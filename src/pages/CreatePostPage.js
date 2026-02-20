import { useState } from "react";
import { auth, db } from "../services/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import "../styles/createPost.css";
import { useNavigate } from "react-router-dom";
import { updateHashtagTrends } from "../services/exploreApi"; // ✅ Importado para actualizar tendencias

const UNSPLASH_KEY = process.env.REACT_APP_UNSPLASH_KEY;

function CreatePost() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");

  const [imageQuery, setImageQuery] = useState("");
  const [imageResults, setImageResults] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadingImages, setLoadingImages] = useState(false);

  // 🔍 Buscar imágenes en Unsplash
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

    // --- 🔹 NORMALIZACIÓN AGRESIVA DE HASHTAGS 🔹 ---
    // Convertimos a minúsculas, quitamos espacios y eliminamos el símbolo #
    const tagsArray = tags
      .split(",")
      .map(tag => tag.toLowerCase().trim().replace("#", ""))
      .filter(tag => tag !== "");

    try {
      // 1. Guardar el post en Firestore
      await addDoc(collection(db, "posts"), {
        authorId: auth.currentUser.uid,
        authorEmail: auth.currentUser.email,
        authorUsername: auth.currentUser.email.split("@")[0],
        title: title || null,
        text,
        imageUrl: selectedImage || null, // ✅ Imagen desde Unsplash
        tags: tagsArray,
        createdAt: serverTimestamp(),
        views: 0,
        likes: []
      });

      // 2. Disparar actualización de tendencias (Conteo Real)
      if (tagsArray.length > 0) {
        await updateHashtagTrends(tagsArray);
      }

      navigate("/feed");
    } catch (error) {
      console.error("Error al publicar:", error);
    }
  };

  return (
    <div className="create-post-wrapper">
      <div className="create-post-card">

        <div className="create-header">
          <button
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ←
          </button>

          <h2 className="create-title">
            Nueva publicación
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Título (opcional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="create-input"
          />

          <textarea
            placeholder="¿Qué estás pensando?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="create-textarea"
          />

          <input
            type="text"
            placeholder="Hashtags separados por coma"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="create-input"
          />

          {/* 🔍 BUSCADOR DE IMAGEN UNSPLASH */}
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

          {loadingImages && (
            <p className="image-loading">Buscando imágenes...</p>
          )}

          {/* RESULTADOS DE UNSPLASH */}
          <div className="image-results">
            {imageResults.map((img) => (
              <img
                key={img.id}
                src={img.urls.small}
                alt=""
                className={`image-option ${
                  selectedImage === img.urls.regular ? "selected" : ""
                }`}
                onClick={() => setSelectedImage(img.urls.regular)}
              />
            ))}
          </div>

          {/* PREVIEW IMAGEN SELECCIONADA */}
          {selectedImage && (
            <div className="selected-image-preview">
              <img src={selectedImage} alt="" />
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

export default CreatePost;