import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import PostCard from "./PostCard";
import useConnection from "../hooks/useConnection";
import "../styles/feed.css";

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

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setPosts([]);
      return;
    }

    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    return () => unsubscribe();
  }, [currentUser]);

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

  if (loading) {
    return <div className="feed-loading">Cargando...</div>;
  }

  if (!currentUser) {
    return (
      <div className="feed-loading">
        Por favor inicia sesión para ver publicaciones
      </div>
    );
  }

  return (
    <div className="feed-list">
      {posts.length === 0 ? (
        <div className="feed-empty">
          No hay publicaciones todavía
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
