import { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, onSnapshot, query, where, doc, updateDoc, increment } from "firebase/firestore";
import Navbar from "../components/NavBar";
import CommentSection from "../components/CommentSection";
import ConnectionBanner from "../components/ConnectionBanner";
import useConnection from "../hooks/useConnection";
import "../styles/News.css";

function Saved() {
  const [allSaved, setAllSaved]       = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [showComments, setShowComments] = useState(false);

  // ✅ Hook centralizado — mismo que FeedPage, alterna fast/slow automáticamente
  const connection = useConnection(); // "fast" | "slow" | "offline"

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
    try {
      const col = allSaved.find(a => a.id === id)?.type === "news" ? "noticias_tesis" : "posts";
      await updateDoc(doc(db, col, id), { likes: increment(1) });
      setSelectedNews(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
    } catch (e) { console.error(e); }
  };

  return (
    <div className={`news-page mode-${connection}`}>
      <Navbar />
      <div className="container" style={{ marginTop: "100px" }}>

        <header className="news-header">
          <div className="title-section">
            <h1>Mis Guardados 🔖</h1>
            {/* ✅ Misma píldora que News, recibe el string directo */}
            <ConnectionBanner connection={connection} />
          </div>
        </header>

        <div className="news-list-container">
          {allSaved.map((item) => (
            <article
              key={item.id}
              className="social-card-mini"
              onClick={() => { setSelectedNews(item); setShowComments(false); }}
            >
              <div className="card-image-box">
                {/* En offline no cargamos imágenes */}
                {connection !== "offline" && (item.urlToImage || item.imageUrl) && (
                  <img
                    src={item.urlToImage || item.imageUrl}
                    alt="preview"
                    loading={connection === "fast" ? "eager" : "lazy"}
                  />
                )}
              </div>
              <div className="card-content-box">
                <span className="source-label">
                  {item.type === "news" ? item.source?.name : `Post de ${item.authorUsername}`}
                </span>
                <h3>{item.title || item.text}</h3>
                <div className="card-footer-mini">
                  <span>❤️ {item.likes?.length || item.likes || 0}</span> •{" "}
                  <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "Reciente"}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* MODAL DETALLE */}
      {selectedNews && !showComments && (
        <div className="modal-overlay" onClick={() => setSelectedNews(null)}>
          <div className="modal-content-social" onClick={e => e.stopPropagation()}>
            <button className="close-modal-social" onClick={() => setSelectedNews(null)}>×</button>

            {connection !== "offline" && (selectedNews.urlToImage || selectedNews.imageUrl) && (
              <div className="modal-image-container">
                <img
                  src={selectedNews.urlToImage || selectedNews.imageUrl}
                  className="modal-img-social"
                  alt="detail"
                />
              </div>
            )}

            <div className="modal-body-social">
              <span className="modal-tag">{selectedNews.categories?.[0] || "Comunidad"}</span>
              <h1 className="modal-title-social">{selectedNews.title || "Publicación"}</h1>
              <p className="modal-text-social">{selectedNews.description || selectedNews.text}</p>
              <div className="modal-divider"></div>
              <div className="modal-footer-social">
                <div className="interaction-item" onClick={() => handleLike(selectedNews.id)}>
                  <span className="icon">❤️</span>
                  <span className="count">{selectedNews.likes?.length || selectedNews.likes || 0}</span>
                </div>
                {connection !== "offline" && (
                  <div className="interaction-item" onClick={() => setShowComments(true)}>
                    <span className="icon">💬</span>
                    <span className="count">Ver Hilo Real</span>
                  </div>
                )}
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
              <button className="back-btn" onClick={() => setShowComments(false)}>← Volver</button>
              <h2>Conversación</h2>
            </header>
            <div className="comments-list-container-scroll" style={{ padding: "20px", overflowY: "auto" }}>
              {selectedNews.type === "post" ? (
                <CommentSection postId={selectedNews.id} />
              ) : (
                <div className="news-comments-static">
                  {selectedNews.comments?.map((c, i) => (
                    <div key={i} className="comment-bubble">
                      <strong>{c.user}</strong>
                      <p>{c.text}</p>
                    </div>
                  )) || <p>No hay comentarios aún.</p>}
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