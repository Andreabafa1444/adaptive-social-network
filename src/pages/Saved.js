import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import Navbar from "../components/NavBar";

function Saved() {
  const [posts, setPosts] = useState([]);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "posts"),
      (snapshot) => {
        const data = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(post =>
            post.savedBy?.includes(currentUser.uid)
          );

        setPosts(data);
      }
    );

    return () => unsubscribe();
  }, [currentUser.uid]);

  return (
    <div style={{ padding: "2rem" }}>
      <Navbar />
      <h2>Publicaciones guardadas</h2>

      {posts.length === 0 && <p>No tienes guardados aún.</p>}

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

          <p style={{ fontSize: "0.8rem", color: "#666" }}>
            ❤️ {post.likes?.length || 0} likes
          </p>
        </div>
      ))}
    </div>
  );
}

export default Saved;
