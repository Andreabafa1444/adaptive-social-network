import { db } from "./firebase";
import { collection, query, orderBy, limit, getDocs, doc, setDoc, where } from "firebase/firestore";

const API_KEY = process.env.REACT_APP_EXPLORE_API_KEY;

/**
 * 1. OBTENER TOP 10 TENDENCIAS (CONTEO REAL)
 * Escanea todos los posts para que el ranking sea 100% exacto.
 */
export const getTrendingNews = async (providedKey) => {
  if (providedKey !== API_KEY) throw new Error("401: No autorizado.");

  try {
    // Escaneo de todos los posts para contar hashtags reales
    const allPosts = await getDocs(collection(db, "posts"));
    const tagCounts = {};

    allPosts.forEach(postDoc => {
      const postTags = postDoc.data().tags || [];
      postTags.forEach(tag => {
        // Normalización: minúsculas y sin símbolos
        const clean = tag.toLowerCase().trim().replace("#", "");
        if (clean) {
          tagCounts[clean] = (tagCounts[clean] || 0) + 1;
        }
      });
    });

    // Sincronizar la colección 'trends' con los nuevos conteos
    await Promise.all(Object.entries(tagCounts).map(([name, count]) =>
      setDoc(doc(db, "trends", name), { 
        name, 
        count, 
        lastUpdated: new Date() 
      }, { merge: true })
    ));

    // Traer el Top 10 real de mayor a menor
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
    console.error("Error al actualizar:", error);
  }
};

export const fetchTopNews = async () => {
  return [{
    title: "Algoritmo de Conteo Real",
    description: "Sincronización automática de metadatos basada en posts.",
    source: { name: "Adaptive Tech" },
    publishedAt: new Date().toISOString(),
    url: "#"
  }];
};