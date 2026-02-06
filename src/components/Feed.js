import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

function Feed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPosts(data);
    };

    fetchPosts();
  }, []);

  return (
    <div>
      {posts.map(post => (
        <div
          key={post.id}
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            marginBottom: "1rem"
          }}
        >
          <strong>{post.authorEmail}</strong>
          <p>{post.text}</p>

          {post.imageUrl && <img src={post.imageUrl} alt="" />}
        </div>
      ))}
    </div>
  );
}

export default Feed;
