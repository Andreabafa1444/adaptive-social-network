import { useEffect, useState } from "react";
import { fetchTopNews } from "../services/exploreApi";
import Navbar from "../components/NavBar";
import "../styles/News.css";
import { doc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import useConnection from "../hooks/useConnection";

// FIX Mixed Content: fuerza https:// en URLs de imágenes externas (fix peru21.pe etc.)
const toHttps = (url) => {
  if (!url) return url;
  return url.replace(/^http:\/\//i, "https://");
};

function News() {
  const [articles, setArticles]               = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [activeTopic, setActiveTopic]         = useState("All");
  const [selectedNews, setSelectedNews]       = useState(null);
  const [showComments, setShowComments]       = useState(false);
  const [commentText, setCommentText]         = useState("");

  const connection = useConnection();

  const isFast    = connection === "fast";
  const isSlow    = connection === "slow";
  const isOffline = connection === "offline";

  useEffect(() => {
    fetchTopNews().then(data => {
      const uniqueData = Array.from(new Map(data.map(item => [item.title, item])).values());
      setArticles(uniqueData);
      setFilteredArticles(uniqueData);
    });
  }, []);

  const handleLike = async (id) => {
    if (isOffline) return;
    try {
      const newsRef = doc(db, "noticias_tesis", id);
      await updateDoc(newsRef, { likes: increment(1) });
      const updateLocal = (list) => list.map(a => a.id === id ? { ...a, likes: (a.likes || 0) + 1 } : a);
      setArticles(prev => updateLocal(prev));
      setFilteredArticles(prev => updateLocal(prev));
      if (selectedNews?.id === id) setSelectedNews(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
    } catch (e) { console.error("Error en Like:", e); }
  };

  const handleSave = async (newsId) => {
    if (isOffline) return;
    const userId = auth.currentUser?.uid || "user_demo_123";
    try {
      const newsRef = doc(db, "noticias_tesis", newsId);
      await updateDoc(newsRef, { savedBy: arrayUnion(userId) });
    } catch (e) { console.error("Error al guardar noticia:", e); }
  };

  const handleAddComment = async (newsId) => {
    if (!commentText.trim() || isOffline) return;
    try {
      const newsRef = doc(db, "noticias_tesis", newsId);
      const newComment = {
        text: commentText,
        user: "Usuario_Tesis",
        date: new Date().toLocaleString()
      };
      await updateDoc(newsRef, {
        comments: arrayUnion(newComment),
        commentCount: increment(1)
      });
      setSelectedNews(prev => ({
        ...prev,
        comments: prev.comments ? [...prev.comments, newComment] : [newComment],
        commentCount: (prev.commentCount || 0) + 1
      }));
      setCommentText("");
    } catch (e) { console.error(e); }
  };

  const handleTopicChange = (topic) => {
    setActiveTopic(topic);
    if (topic === "All") setFilteredArticles(articles);
    else setFilteredArticles(articles.filter(a => a.categories?.includes(topic)));
  };

  const topics = ["All", "Tecnología", "Política", "Negocios", "Cultura Pop", "Ciencia"];

  // FIX A11y: colores con ratio de contraste suficiente (antes fallaban en Lighthouse)
  const networkColor = isFast ? "#007a5e" : isSlow ? "#8a5a00" : "#5a6478";

  const networkLabel = isFast ? "FAST" : isSlow ? "SLOW" : "OFFLINE";

  return (
    <div className={`news-page mode-${connection}`}>
      <Navbar />
      <div className="container">
        <header className="news-header">
          <div className="title-section">
            <h1>Explorar Mundo</h1>

            <div className="connection-banner" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "100px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1px",
              background: `${networkColor}18`,
              border: `1px solid ${networkColor}40`,
              color: networkColor,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: networkColor, display: "inline-block" }} />
              {networkLabel}
            </div>
          </div>

          <div className="topics-bar">
            {topics.map(t => (
              <button key={t} className={activeTopic === t ? "active" : ""} onClick={() => handleTopicChange(t)}>{t}</button>
            ))}
          </div>
        </header>

        {/* FEED */}
        <section className="feed-section">
          <h2>Popular Reading</h2>
          <div className="news-list-container">
            {filteredArticles.map((a, i) => (
              <article
                key={i}
                className={`social-card-mini ${isOffline ? "offline-card" : ""}`}
                onClick={() => !isOffline && setSelectedNews(a)}
              >
                {/* Alta y Media: imagen / Baja: oculta */}
                {!isOffline && (
                  <div className="card-image-box">
                    {isFast && a.urlToImage && (
                      // FIX: toHttps() previene Mixed Content
                      <img
                        src={toHttps(a.urlToImage)}
                        alt="news"
                        width={150}
                        height={100}
                        loading="eager"
                      />
                    )}
                    {isSlow && a.urlToImage && (
                      <img
                        src={toHttps(a.urlToImage)}
                        alt="news"
                        width={150}
                        height={100}
                        loading="lazy"
                        style={{ filter: "grayscale(0.4)" }}
                      />
                    )}
                  </div>
                )}

                <div className="card-content-box">
                  <span className="source-label">{a.source?.name}</span>

                  {/* Titulo: Completo en Fast/Offline, Truncado en Slow */}
                  <h3>
                    {isFast || isOffline ? a.title : a.title?.slice(0, 80) + "..."}
                  </h3>

                  {/* Descripcion: Fast y Offline / oculta en Slow */}
                  {(isFast || isOffline) && a.description && (
                    // FIX A11y: #555 tiene ratio 7.4:1 (antes #888 = 3.5:1, insuficiente)
                    <p style={{ fontSize: "14px", color: isOffline ? "#333" : "#555", margin: "8px 0" }}>
                      {a.description.slice(0, 150)}...
                    </p>
                  )}

                  <div className="card-footer-mini">
                    <span>{new Date(a.publishedAt).toLocaleDateString()}</span>
                    {!isOffline && <span> • ❤️ {a.likes || 0}</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* MODAL DETALLE */}
      {selectedNews && !showComments && (
        <div className="modal-overlay" onClick={() => setSelectedNews(null)}>
          <div className="modal-content-social" onClick={e => e.stopPropagation()}>

            <button className="close-modal-social" onClick={() => setSelectedNews(null)}>×</button>

            {/* Imagen: Solo en modo FAST */}
            {isFast && selectedNews.urlToImage && (
              <div className="modal-image-container">
                {/* FIX: toHttps() en modal también */}
                <img
                  src={toHttps(selectedNews.urlToImage)}
                  className="modal-img-social"
                  alt="news"
                  width={600}
                  height={350}
                  loading="eager"
                />
              </div>
            )}

            <div className="modal-body-social">
              <h1 className="modal-title-social">{selectedNews.title}</h1>
              <p className="modal-text-social">{selectedNews.description}</p>

              <a href={selectedNews.url} target="_blank" rel="noopener noreferrer" className="full-note-link">
                Leer nota completa
              </a>

              <div className="modal-divider"></div>

              <div className="modal-footer-social-pill-container">
                <div className="interaction-pills-left">
                  <div className="interaction-pill-button" onClick={() => handleLike(selectedNews.id)}>
                    <span className="icon">❤️</span>
                    <span className="count">{selectedNews.likes || 0}</span>
                  </div>

                  {!isOffline && (
                    <div className="interaction-pill-button" onClick={() => setShowComments(true)}>
                      <span className="icon">💬</span>
                      <span className="count">{selectedNews.commentCount || 0}</span>
                    </div>
                  )}
                </div>

                <div className="interaction-pill-button save-pill" onClick={() => handleSave(selectedNews.id)}>
                  <span className="icon">🏷️</span>
                  <span className="text">Guardar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL COMENTARIOS */}
      {showComments && selectedNews && (
        <div className="modal-overlay" onClick={() => setShowComments(false)}>
          <div className="modal-content-comments" onClick={e => e.stopPropagation()}>
            <header className="comments-header">
              <button className="back-btn" onClick={() => setShowComments(false)}>Volver</button>
              <h2>Comentarios ({selectedNews.commentCount || 0})</h2>
            </header>
            <div className="comments-list">
              {selectedNews.comments?.map((c, idx) => (
                <div key={idx} className="comment-bubble">
                  <strong>{c.user}</strong>
                  <p>{c.text}</p>
                  <small>{c.date}</small>
                </div>
              )) || <p className="no-comments">No hay comentarios aún.</p>}
            </div>
            <div className="comment-input-area">
              <textarea
                placeholder="Añadir comentario..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button onClick={() => handleAddComment(selectedNews.id)}>Publicar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default News;