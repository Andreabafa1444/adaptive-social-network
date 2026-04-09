import { db } from "./firebase";
import { collection, query, orderBy, limit, getDocs, doc, setDoc, where } from "firebase/firestore";

const API_KEY = process.env.REACT_APP_EXPLORE_API_KEY;

/**
 * 1. OBTENER TOP 10 TENDENCIAS (CONTEO REAL)
 */
export const getTrendingNews = async (providedKey) => {
  if (providedKey !== API_KEY) throw new Error("401: No autorizado.");

  try {
    const allPosts = await getDocs(collection(db, "posts"));
    const tagCounts = {};

    allPosts.forEach(postDoc => {
      const postTags = postDoc.data().tags || [];
      postTags.forEach(tag => {
        const clean = tag.toLowerCase().trim().replace("#", "");
        if (clean) {
          tagCounts[clean] = (tagCounts[clean] || 0) + 1;
        }
      });
    });

    await Promise.all(Object.entries(tagCounts).map(([name, count]) =>
      setDoc(doc(db, "trends", name), {
        name,
        count,
        lastUpdated: new Date()
      }, { merge: true })
    ));

    const q = query(collection(db, "trends"), orderBy("count", "desc"), limit(10));
    const snap = await getDocs(q);

    return {
      status: "success",
      data: snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => t.count > 0)
    };
  } catch (error) {
    console.error("Error en tendencias:", error);
    return { status: "error", message: error.message };
  }
};

/**
 * 2. ACTUALIZAR TENDENCIAS (Para creación de posts)
 */
export const updateHashtagTrends = async (tagsArray) => {
  if (!tagsArray || tagsArray.length === 0) return;
  try {
    const batchPromises = tagsArray.map(async (tag) => {
      const cleanTag = tag.toLowerCase().trim().replace("#", "");
      const trendRef = doc(db, "trends", cleanTag);

      const postsQuery = query(collection(db, "posts"), where("tags", "array-contains", cleanTag));
      const snapCount = await getDocs(postsQuery);

      await setDoc(trendRef, {
        name: cleanTag,
        count: snapCount.size,
        lastUpdated: new Date()
      }, { merge: true });
    });
    await Promise.all(batchPromises);
  } catch (error) {
    console.error("Error al actualizar hashtags:", error);
  }
};

/**
 * 3. FETCH NEWS DESDE FIRESTORE
 * FIX CLS: traemos más artículos para compensar duplicados por categoría,
 * y deduplicamos por doc.id (más confiable que por title).
 */
export const fetchTopNews = async () => {
  try {
    const newsRef = collection(db, "noticias_tesis");

    // Traemos 60 para tener margen después de deduplicar
    const q = query(
      newsRef,
      orderBy("publishedAt", "desc"),
      limit(60)
    );

    const querySnapshot = await getDocs(q);

    // FIX: deduplicar por doc.id (el hash SHA256 del título que genera Python)
    // Esto elimina el CLS causado por artículos repetidos que hacen crecer el DOM
    const seen = new Set();
    const articles = [];

    querySnapshot.docs.forEach(d => {
      if (!seen.has(d.id)) {
        seen.add(d.id);
        articles.push({ ...d.data(), id: d.id });
      }
    });

    // Limitar a 30 artículos únicos máximo
    const unique = articles.slice(0, 30);

    if (unique.length === 0) throw new Error("Firestore vacío");

    return unique;
  } catch (error) {
    console.error("Error al leer noticias globales:", error);
    return [{
      title: "Contenido en sincronización",
      description: "Sincronizando con el motor de Python...",
      source: { name: "Adaptive System" }
    }];
  }
};