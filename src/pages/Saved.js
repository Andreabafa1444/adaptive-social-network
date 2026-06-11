import { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, onSnapshot, query, where, doc, updateDoc, increment } from "firebase/firestore";
import Navbar from "../components/NavBar";
import CommentSection from "../components/CommentSection";
import ConnectionBanner from "../components/ConnectionBanner";
import { useConnectionContext } from "../context/ConnectionContext";
import "../styles/News.css";

function Saved() {
  const connection = useConnectionContext();
  const [allSaved, setAllSaved]         = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [showComments, setShowComments] = useState(false);

  const isFast    = connection === "fast";
  const isSlow    = connection === "slow";
  const isOffline = connection === "offline";

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const actualizarLista = (nuevosDatos, tipo) => {
      setAllSaved(prev => {
        const filtrados = prev.filter(item => item.type !== tipo);
        const combinados = [...filtrados, ...nuevosDatos];
        return Array.from(
          new Map(combinados.map(item => [item.title || item.text, item])).values()
        );
      });
    };

    const qPosts = query(collection(db, "posts"), where("savedBy", "array-contains", currentUser.uid));
    const qNews  = query(collection(db, "noticias_tesis"), where("savedBy", "array-contains", currentUser.uid));

    const unsubPosts = onSnapshot(qPosts, (snap) => {
      actualizarLista(snap.docs.map(d => ({ id: d.id, type: "post", ...d.data() })), "post");
    });
    const unsubNews = onSnapshot(qNews, (snap) => {
      actualizarLista(snap.docs.map(d => ({ id: d.id, type: "news", ...d.data() })), "news");
    });

    return () => { unsubPosts(); unsubNews(); };
  }, [currentUser]);

  const handleLike = async (id) => {
    if (isOffline) return;
    try {
      const col = allSaved.find(a => a.id === id)?.type === "news" ? "noticias_tesis" : "posts";
      await updateDoc(doc(db, col, id), { likes: increment(1) });
    } catch (e) { console.error(e); }
  };

  return (
    <div className={`news-page mode-${connection}`}>
      <Navbar />
      <div className="container" style={{ marginTop: "100px" }}>
        <header className="news-header">
          <div className="title-section">
            <h1>Mis Guardados 🔖</h1>
            <ConnectionBanner connection={connection} />
          </div>
        </header>

        <div className="news-list-container">
          {allSaved.map((item) => (
            <article
              key={item.id}
              className={`social-card-mini ${isOffline ? "offline-card" : ""}`}
              onClick={() => !isOffline && setSelectedNews(item)}
            >
              {!isOffline && (item.urlToImage || item.imageUrl) && (
                <div className="card-image-box">
                  <img
                    src={item.urlToImage || item.imageUrl}
                    alt="preview"
                    loading={isFast ? "eager" : "lazy"}
                    style={{ filter: isSlow ? "grayscale(0.4)" : "none" }}
                  />
                </div>
              )}
              <div className="card-content-box">
                <span className="source-label">
                  {item.type === "news" ? item.source?.name : `Post de ${item.authorUsername}`}
                </span>
                <h3>
                  {isFast || isOffline ? (item.title || item.text) : (item.title || item.text)?.slice(0, 80) + "..."}
                </h3>
                {isOffline && (
                  <p className="news-description" style={{ marginTop: "8px", fontSize: "14px", color: "#333" }}>
                    {item.description || item.text?.slice(0, 150)}...
                  </p>
                )}
                <div className="card-footer-mini">
                  <span>❤️ {item.likes?.length || item.likes || 0}</span> •{" "}
                  <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "Reciente"}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selectedNews && !showComments && (
        <div className="modal-overlay" onClick={() => setSelectedNews(null)}>
          <div className="modal-content-social" onClick={e => e.stopPropagation()}>
            <button className="close-modal-social" onClick={() => setSelectedNews(null)}>×</button>
            {isFast && (selectedNews.urlToImage || selectedNews.imageUrl) && (
              <div className="modal-image-container">
                <img src={selectedNews.urlToImage || selectedNews.imageUrl} className="modal-img-social" alt="detail" />
              </div>
            )}
            <div className="modal-body-social" style={{ paddingTop: isSlow ? "40px" : "20px" }}>
              <span className="source-label">{selectedNews.categories?.[0] || "Guardado"}</span>
              <h1 className="modal-title-social">{selectedNews.title || "Publicación"}</h1>
              <p className="modal-text-social" style={{ fontSize: isSlow ? "1.2rem" : "1rem" }}>
                {selectedNews.description || selectedNews.text}
              </p>
              {selectedNews.type === "news" && selectedNews.url && (
                <a href={selectedNews.url} target="_blank" rel="noopener noreferrer" className="full-note-link">
                  Leer nota completa
                </a>
              )}
              <div className="modal-divider"></div>
              <div className="modal-footer-social-pill-container">
                <div className="interaction-pills-left">
                  <div className="interaction-pill-button" onClick={() => handleLike(selectedNews.id)}>
                    <span className="icon">❤️</span>
                    <span className="count">{selectedNews.likes?.length || selectedNews.likes || 0}</span>
                  </div>
                  <div className="interaction-pill-button" onClick={() => setShowComments(true)}>
                    <span className="icon">💬</span>
                    <span className="count">Comentarios</span>
                  </div>
                </div>
                <div className="interaction-pill-button save-pill">
                  <span className="icon">🔖</span>
                  <span className="text">Guardado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showComments && selectedNews && (
        <div className="modal-overlay" onClick={() => setShowComments(false)}>
          <div className="modal-content-comments" onClick={e => e.stopPropagation()}>
            <header className="comments-header">
              <button className="back-btn" onClick={() => setShowComments(false)}>← Volver</button>
              <h2>Conversación</h2>
            </header>
            <div className="comments-list">
              {selectedNews.type === "post" ? (
                <CommentSection postId={selectedNews.id} />
              ) : (
                <div className="news-comments-static">
                  {selectedNews.comments?.map((c, i) => (
                    <div key={i} className="comment-bubble">
                      <strong>{c.user}</strong>
                      <p>{c.text}</p>
                    </div>
                  )) || <p className="no-comments">No hay comentarios aún.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Saved;
