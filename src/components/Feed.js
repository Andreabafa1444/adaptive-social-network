import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
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
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(data);
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
        <div
          key={post.id}
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            marginBottom: "1rem",
            borderRadius: "6px"
          }}
        >
          <strong>{post.authorUsername}</strong>

          {post.title && <h3>{post.title}</h3>}
          <p>{post.text}</p>

          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt=""
              style={{ width: "100%", borderRadius: "4px" }}
            />
          )}

          <div>
            {post.tags?.map(tag => (
              <span key={tag} style={{ marginRight: "0.5rem" }}>
                #{tag}
              </span>
            ))}
          </div>

          <div style={{ marginTop: "0.5rem" }}>
            <button onClick={() => toggleLike(post)}>
              ❤️ {post.likes?.length || 0}
            </button>

            <button
              onClick={() => toggleSave(post)}
              style={{ marginLeft: "1rem" }}
            >
              🔖 Guardar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Feed;
