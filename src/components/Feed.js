import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import PostCard from "./PostCard";

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
  const currentUser = auth.currentUser;

  useEffect(() => {
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
  }, []);

  const toggleLike = async (post) => {
    const postRef = doc(db, "posts", post.id);
    const hasLiked = post.likes?.includes(currentUser.uid);

    await updateDoc(postRef, {
      likes: hasLiked
        ? arrayRemove(currentUser.uid)
        : arrayUnion(currentUser.uid)
    });
  };

  const toggleSave = async (post) => {
    const postRef = doc(db, "posts", post.id);
    const hasSaved = post.savedBy?.includes(currentUser.uid);

    await updateDoc(postRef, {
      savedBy: hasSaved
        ? arrayRemove(currentUser.uid)
        : arrayUnion(currentUser.uid)
    });
  };

  return (
    <div>
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onLike={toggleLike}
          onSave={toggleSave}
        />
      ))}
    </div>
  );
}

export default Feed;
