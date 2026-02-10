import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  onSnapshot
} from "firebase/firestore";
import PostCard from "../components/PostCard";
import Navbar from "../components/NavBar";

function Explore() {
  const [posts, setPosts] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "posts"),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(data);
      }
    );

    return () => unsubscribe();
  }, []);

  // 🔹 obtener hashtags únicos
  const allTags = Array.from(
    new Set(
      posts.flatMap(post => post.tags || [])
    )
  );

  // 🔹 filtrar posts por hashtag
  const filteredPosts = search
  ? posts.filter(post => {
      const query = search.toLowerCase();

      return (
        post.title?.toLowerCase().includes(query) ||
        post.text?.toLowerCase().includes(query) ||
        post.tags?.some(tag =>
          tag.toLowerCase().includes(query)
        )
      );
    })
  : selectedTag
  ? posts.filter(post =>
      post.tags?.includes(selectedTag)
    )
  : [];


  return (
    <div style={{ padding: "2rem" }}>
      <Navbar />

      <h2>Explorar por hashtags</h2>
      <input
  type="text"
  placeholder="Buscar por texto o hashtag..."
  value={search}
  onChange={(e) => {
    setSearch(e.target.value);
    setSelectedTag(null); // 🔹 limpia hashtag si escriben
  }}
  style={{
    width: "100%",
    padding: "0.5rem",
    marginBottom: "1rem"
  }}
/>

      {/* Hashtags */}
      <div style={{ marginBottom: "1rem" }}>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            style={{
              marginRight: "0.5rem",
              marginBottom: "0.5rem",
              backgroundColor:
                selectedTag === tag ? "#333" : "#eee",
              color:
                selectedTag === tag ? "#fff" : "#000",
              border: "none",
              padding: "0.4rem 0.6rem",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Resultados */}
      {!selectedTag && !search && (
  <p>
    Escribe algo o selecciona un hashtag para explorar.
  </p>
)}


      {filteredPosts.map(post => (
        <PostCard
          key={post.id}
          post={post}
        />
      ))}

      {!selectedTag && (
        <p>Selecciona un hashtag para explorar.</p>
      )}
    </div>
  );
}

export default Explore;