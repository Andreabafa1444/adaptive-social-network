import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import PostCard from "./PostCard";
import useConnection from "../hooks/useConnection";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const connection = useConnection();

  // Escuchar cambios en la autenticación
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Cargar posts solo cuando el usuario esté autenticado
  useEffect(() => {
    if (!currentUser) {
      setPosts([]);
      return;
    }

    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setPosts(
          snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        );
      },
      (error) => {
        console.error("Error al cargar posts:", error);
        // Opcional: mostrar mensaje de error al usuario
      }
    );

    return () => unsubscribe();
  }, [currentUser]); // ← Solo se ejecuta cuando currentUser cambia

  const toggleLike = async (post) => {
    if (!currentUser) return;

    const postRef = doc(db, "posts", post.id);
    const hasLiked = post.likes?.includes(currentUser.uid);

    await updateDoc(postRef, {
      likes: hasLiked
        ? arrayRemove(currentUser.uid)
        : arrayUnion(currentUser.uid)
    });
  };

  const toggleSave = async (post) => {
    if (!currentUser) return;

    const postRef = doc(db, "posts", post.id);
    const hasSaved = post.savedBy?.includes(currentUser.uid);

    await updateDoc(postRef, {
      savedBy: hasSaved
        ? arrayRemove(currentUser.uid)
        : arrayUnion(currentUser.uid)
    });
  };

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return <div style={{ padding: "1rem" }}>Cargando...</div>;
  }

  // Mostrar mensaje si no está autenticado
  if (!currentUser) {
    return <div style={{ padding: "1rem" }}>Por favor inicia sesión para ver posts</div>;
  }

  return (
    <div>
      {/* 🔵 Estado de conexión visible */}
      <div
        style={{
          padding: "0.5rem",
          marginBottom: "1rem",
          borderRadius: "4px",
          background:
            !connection.online
              ? "#ffdddd"
              : connection.type === "2g" || connection.type === "3g"
              ? "#fff4cc"
              : "#ddffdd"
        }}
      >
        {!connection.online && "🔴 Modo Offline"}
        {connection.online &&
          (connection.type === "2g" || connection.type === "3g") &&
          "🟡 Conexión limitada"}
        {connection.online &&
          (connection.type === "4g" || connection.type === "unknown") &&
          "🟢 Conexión estable"}
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div style={{ padding: "1rem", textAlign: "center" }}>
          No hay posts todavía
        </div>
      ) : (
        posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onLike={toggleLike}
            onSave={toggleSave}
            connection={connection}
          />
        ))
      )}
    </div>
  );
}

export default Feed;