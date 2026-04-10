import { useState } from "react";
import { auth, db } from "../services/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { updateHashtagTrends } from "../services/exploreApi";
import "../styles/createPost.css";

const UNSPLASH_KEY = process.env.REACT_APP_UNSPLASH_KEY;

function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [imageQuery, setImageQuery] = useState("");
  const [imageResults, setImageResults] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // guarda img.urls completo
  const [loadingImages, setLoadingImages] = useState(false);
  const navigate = useNavigate();

  const searchImages = async () => {
    if (!imageQuery.trim()) return;
    setLoadingImages(true);
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${imageQuery}&per_page=4&client_id=${UNSPLASH_KEY}`
      );
      const data = await response.json();
      setImageResults(data.results || []);
    } catch (error) {
      console.error("Error buscando imágenes:", error);
    }
    setLoadingImages(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const tagsArray = tags
      .split(",")
      .map(tag => tag.trim().toLowerCase().replace("#", ""))
      .filter(tag => tag !== "");

    try {
      await addDoc(collection(db, "posts"), {
        authorId: auth.currentUser.uid,
        authorEmail: auth.currentUser.email,
        authorUsername: auth.currentUser.email.split("@")[0],
        title: title || null,
        text,
        imageUrl: selectedImage?.small || null,       // ✅ URL pequeña para feed
        imageUrlFull: selectedImage?.regular || null, // ✅ URL grande para detalle
        tags: tagsArray,
        createdAt: serverTimestamp(),
        views: 0,
        likes: []
      });

      if (tagsArray.length > 0) {
        await updateHashtagTrends(tagsArray);
      }

      navigate("/feed");
    } catch (error) {
      console.error("Error al publicar:", error);
    }
  };

  return (
    <div className="create-wrapper">
      <div className="create-card">
        <div className="create-title">Nueva publicación</div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Título (opcional)"
            className="create-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="¿Qué estás pensando?"
            className="create-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <input
            type="text"
            placeholder="Hashtags separados por coma (ej: tech, fortnite)"
            className="create-input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          {/* BUSCADOR UNSPLASH */}
          <div className="image-search-section">
            <input
              type="text"
              placeholder="Buscar imagen (ej. pizza, tecnología...)"
              value={imageQuery}
              onChange={(e) => setImageQuery(e.target.value)}
              className="create-input"
            />
            <button
              type="button"
              onClick={searchImages}
              className="image-search-button"
            >
              Buscar imagen
            </button>
          </div>

          {loadingImages && <p className="image-loading">Buscando imágenes...</p>}

          {/* RESULTADOS */}
          <div className="image-results">
            {imageResults.map((img) => (
              <img
                key={img.id}
                src={img.urls.small}
                alt=""
                className={`image-option ${
                  selectedImage?.small === img.urls.small ? "selected" : ""  // ✅ fix bug de selección
                }`}
                onClick={() => setSelectedImage(img.urls)} // ✅ guarda objeto completo
              />
            ))}
          </div>

          {/* PREVIEW */}
          {selectedImage && (
            <div className="selected-image-preview">
              <img src={selectedImage.small} alt="" /> {/* ✅ fix bug de preview */}
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="remove-image-btn"
              >
                Quitar imagen
              </button>
            </div>
          )}

          <button type="submit" className="create-button">
            Publicar
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePostPage;