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
    <div className="explore-wrapper">
  
      <Navbar />
  
      <div className="explore-container">
  
        <h2 className="explore-title">
          Explorar contenido
        </h2>
  
        <input
          type="text"
          className="explore-search"
          placeholder="Buscar por texto o hashtag..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedTag(null);
          }}
        />
  
        {/* HASHTAGS */}
        <div className="explore-tags">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => {
                setSelectedTag(tag);
                setSearch("");
              }}
              className={`tag-chip ${
                selectedTag === tag ? "active" : ""
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
  
        {/* ESTADO VACÍO */}
        {!selectedTag && !search && (
          <div className="explore-empty">
            Escribe algo o selecciona un hashtag para explorar.
          </div>
        )}
  
        {/* RESULTADOS */}
        <div className="explore-results">
          {filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
            />
          ))}
        </div>
  
      </div>
  
    </div>
  );
  
}

export default Explore;