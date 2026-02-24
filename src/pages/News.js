import { useEffect, useState } from "react";
import { fetchTopNews } from "../services/exploreApi";
import Navbar from "../components/NavBar";
import "../styles/News.css";
import { doc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import useConnection from "../hooks/useConnection"; // ← mismo hook que FeedPage

function News() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [activeTopic, setActiveTopic] = useState("All");
  const [selectedNews, setSelectedNews] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  // ✅ Usa el mismo hook — "fast" | "slow" | "offline"
  const connection = useConnection();

  // Aliases para el JSX (misma lógica que PostCard)
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

  // ── Badge de modo (igual que en PostCard) ──────────────────────────────────
  const networkLabel = isFast ? "⚡ FAST" : isSlow ? "🐢 SLOW" : "📵 OFFLINE";
  const networkColor = isFast ? "#00c896"  : isSlow ? "#f5a623" : "#8b9ab1";

  return (
    <div className={`news-page mode-${connection}`}>
      <Navbar />
      <div className="container">
        <header className="news-header">
          <div className="title-section">
            <h1>Explorar Mundo</h1>

            {/* ── Banner de conexión — mismo estilo que el resto de la app ── */}
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

        {/* ── OFFLINE: aviso en lugar del feed ── */}
        {isOffline ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#8b9ab1",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📵</div>
            <h2 style={{ marginBottom: 8 }}>Sin conexión</h2>
            <p style={{ fontSize: 14 }}>Las noticias requieren internet. Vuelve cuando tengas conexión.</p>
          </div>
        ) : (
          <section className="feed-section">
            <h2>Popular Reading</h2>
            <div className="news-list-container">
              {filteredArticles.map((a, i) => (
                <article
                  key={i}
                  className="social-card-mini"
                  onClick={() => !isOffline && setSelectedNews(a)}
                >
                  {/* Imagen: fast = eager full, slow = lazy reducida */}
                  <div className="card-image-box">
                    {isFast && a.urlToImage && (
                      <img src={a.urlToImage} alt="news" loading="eager" />
                    )}
                    {isSlow && a.urlToImage && (
                      <img
                        src={a.urlToImage}
                        alt="news"
                        loading="lazy"
                        style={{ filter: "grayscale(0.4)" }}
                      />
                    )}
                  </div>

                  <div className="card-content-box">
                    <span className="source-label">{a.source?.name}</span>
                    {/* Título truncado según modo */}
                    <h3>{isFast ? a.title : a.title?.slice(0, 80) + (a.title?.length > 80 ? "…" : "")}</h3>
                    {/* Descripción solo en fast */}
                    {isFast && a.description && (
                      <p style={{ fontSize: 12, color: "#888", margin: "4px 0" }}>
                        {a.description.slice(0, 100)}…
                      </p>
                    )}
                    <div className="card-footer-mini">
                      <span>{new Date(a.publishedAt).toLocaleDateString()}</span> • ❤️ {a.likes || 0}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── MODAL DETALLE ── */}
      {selectedNews && !showComments && (
        <div className="modal-overlay" onClick={() => setSelectedNews(null)}>
          <div className="modal-content-social" onClick={e => e.stopPropagation()}>
            <button className="close-modal-social" onClick={() => setSelectedNews(null)}>×</button>

            {/* Imagen del modal solo en fast */}
            {isFast && selectedNews.urlToImage && (
              <div className="modal-image-container">
                <img src={selectedNews.urlToImage} className="modal-img-social" alt="news" />
              </div>
            )}
            {isSlow && selectedNews.urlToImage && (
              <div className="modal-image-container">
                <img
                  src={selectedNews.urlToImage}
                  className="modal-img-social"
                  alt="news"
                  loading="lazy"
                  style={{ filter: "grayscale(0.4)" }}
                />
              </div>
            )}

            <div className="modal-body-social">
              <h1 className="modal-title-social">{selectedNews.title}</h1>
              <p className="modal-text-social">{selectedNews.description}</p>
              <div className="modal-divider"></div>

              <div className="modal-footer-social-pill-container">
                <div className="interaction-pills-left">
                  {/* Like deshabilitado en offline */}
                  <div
                    className="interaction-pill-button"
                    onClick={() => handleLike(selectedNews.id)}
                    style={{ opacity: isOffline ? 0.4 : 1, cursor: isOffline ? "not-allowed" : "pointer" }}
                  >
                    <span className="icon">❤️</span>
                    <span className="count">{selectedNews.likes || 0}</span>
                  </div>

                  {/* Comentarios solo con conexión */}
                  {!isOffline && (
                    <div className="interaction-pill-button" onClick={() => setShowComments(true)}>
                      <span className="icon">💬</span>
                      <span className="count">{selectedNews.commentCount || (selectedNews.comments?.length || 0)}</span>
                    </div>
                  )}
                </div>

                <div
                  className="interaction-pill-button save-pill"
                  onClick={() => handleSave(selectedNews.id)}
                  style={{ opacity: isOffline ? 0.4 : 1, cursor: isOffline ? "not-allowed" : "pointer" }}
                >
                  <span className="icon">🔖</span>
                  <span className="text">Guardar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL COMENTARIOS ── */}
      {showComments && selectedNews && (
        <div className="modal-overlay" onClick={() => setShowComments(false)}>
          <div className="modal-content-comments" onClick={e => e.stopPropagation()}>
            <header className="comments-header">
              <button className="back-btn" onClick={() => setShowComments(false)}>← Volver</button>
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