import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import PostCard from "./PostCard";
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

function SkeletonCard() {
  return (
    <div className="post-card skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton-avatar skeleton-pulse" />
        <div className="skeleton-lines">
          <div className="skeleton-line skeleton-pulse" style={{ width: "60%" }} />
          <div className="skeleton-line skeleton-pulse" style={{ width: "40%" }} />
        </div>
      </div>
      <div className="skeleton-line skeleton-pulse" style={{ width: "90%", marginBottom: 8 }} />
      <div className="skeleton-line skeleton-pulse" style={{ width: "70%", marginBottom: 16 }} />
      <div className="skeleton-image skeleton-pulse" />
    </div>
  );
}

function Feed({ connection, user, loading }) {

  const [posts, setPosts]                   = useState([]);
  const [firestoreReady, setFirestoreReady] = useState(false);

  useEffect(() => {

    if (!user) {
      setPosts([]);
      setFirestoreReady(false);
      return;
    }

    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(
        snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      );
      setFirestoreReady(true);
    });

    return () => unsubscribe();

  }, [user]);


  const toggleLike = async (post) => {
    if (!user) return;
    const postRef = doc(db, "posts", post.id);
    const hasLiked = post.likes?.includes(user.uid);
    await updateDoc(postRef, {
      likes: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
    });
  };

  const toggleSave = async (post) => {
    if (!user) return;
    const postRef = doc(db, "posts", post.id);
    const hasSaved = post.savedBy?.includes(user.uid);
    await updateDoc(postRef, {
      savedBy: hasSaved ? arrayRemove(user.uid) : arrayUnion(user.uid)
    });
  };


  if (loading || (!firestoreReady && posts.length === 0)) {
    return (
      <div className="feed-list">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="feed-loading">
        Por favor inicia sesión
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
        posts.map((post, index) => (
          <PostCard
            key={post.id}
            post={post}
            index={index}
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