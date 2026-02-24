import { useEffect, useState } from "react";
import { fetchTopNews } from "../services/exploreApi";
import Navbar from "../components/NavBar";
import "../styles/News.css";
// Firebase Web SDK
import { doc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebaseConfig"; 

function News() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [activeTopic, setActiveTopic] = useState("All");
  const [selectedNews, setSelectedNews] = useState(null); 
  const [showComments, setShowComments] = useState(false); 
  const [connectionType, setConnectionType] = useState("full");
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    // 1. Carga de noticias inicial
    fetchTopNews().then(data => {
      const uniqueData = Array.from(new Map(data.map(item => [item.title, item])).values());
      setArticles(uniqueData);
      setFilteredArticles(uniqueData);
    });

    // 2. Función de detección de conexión mejorada
    const checkConnection = () => {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      if (!navigator.onLine) {
        setConnectionType("offline");
      } else if (conn) {
        // Detecta si la red es lenta o tiene ahorro de datos activo
        if (conn.saveData || ["2g", "3g"].includes(conn.effectiveType)) {
          setConnectionType("limited");
        } else {
          setConnectionType("full");
        }
      } else {
        setConnectionType("full");
      }
    };

    // 3. Listeners para cambios en tiempo real
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);
    
    // Escucha cambios específicos en la velocidad de la red si el navegador lo permite
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      conn.addEventListener('change', checkConnection);
    }

    // Ejecución inicial al montar
    checkConnection();

    // 4. Limpieza de eventos al salir del componente
    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
      if (conn) conn.removeEventListener('change', checkConnection);
    };
  }, []);

  const handleLike = async (id) => {
    try {
      const newsRef = doc(db, "noticias_tesis", id);
      await updateDoc(newsRef, { likes: increment(1) });
      const updateLocal = (list) => list.map(a => a.id === id ? {...a, likes: (a.likes || 0) + 1} : a);
      setArticles(prev => updateLocal(prev));
      setFilteredArticles(prev => updateLocal(prev));
      if(selectedNews?.id === id) setSelectedNews(prev => ({...prev, likes: (prev.likes || 0) + 1}));
    } catch (e) { console.error("Error en Like:", e); }
  };

  const handleSave = async (newsId) => {
    const userId = auth.currentUser?.uid || "user_demo_123"; 
    try {
      const newsRef = doc(db, "noticias_tesis", newsId);
      await updateDoc(newsRef, {
        savedBy: arrayUnion(userId)
      });
      console.log("Noticia guardada con éxito");
    } catch (e) {
      console.error("Error al guardar noticia:", e);
    }
  };
  
  const handleAddComment = async (newsId) => {
    if (!commentText.trim()) return;
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

  return (
    <div className={`news-page mode-${connectionType}`}>
      <Navbar />
      <div className="container">
        <header className="news-header">
          <div className="title-section">
            <h1>Explorar Mundo</h1>
            {/* Banner dinámico de conexión corregido */}
            <div className={`connection-banner ${connectionType === 'offline' ? 'offline' : 'online'}`}>
              <div className="connection-dot"></div>
              <span>
                {connectionType === "full" && "FAST"}
                {connectionType === "limited" && "SLOW"}
                {connectionType === "offline" && "OFFLINE"}
              </span>
            </div>
          </div>
          <div className="topics-bar">
            {topics.map(t => (
              <button key={t} className={activeTopic === t ? "active" : ""} onClick={() => handleTopicChange(t)}>{t}</button>
            ))}
          </div>
        </header>

        <section className="feed-section">
          <h2>Popular Reading</h2>
          <div className="news-list-container">
            {filteredArticles.map((a, i) => (
              <article key={i} className="social-card-mini" onClick={() => setSelectedNews(a)}>
                <div className="card-image-box">
                  {connectionType !== "offline" && a.urlToImage && <img src={a.urlToImage} alt="news" />}
                </div>
                <div className="card-content-box">
                  <span className="source-label">{a.source?.name}</span>
                  <h3>{a.title}</h3>
                  <div className="card-footer-mini">
                    <span>{new Date(a.publishedAt).toLocaleDateString()}</span> • ❤️ {a.likes || 0}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* MODAL DETALLE CON DISEÑO DE BOTONES (PÍLDORAS) */}
      {selectedNews && !showComments && (
        <div className="modal-overlay" onClick={() => setSelectedNews(null)}>
          <div className="modal-content-social" onClick={e => e.stopPropagation()}>
            <button className="close-modal-social" onClick={() => setSelectedNews(null)}>×</button>
            <div className="modal-image-container">
              <img src={selectedNews.urlToImage} className="modal-img-social" alt="news" />
            </div>
            <div className="modal-body-social">
              <h1 className="modal-title-social">{selectedNews.title}</h1>
              <p className="modal-text-social">{selectedNews.description}</p>
              <div className="modal-divider"></div>
              <div className="modal-footer-social-pill-container">
                <div className="interaction-pills-left">
                  <div className="interaction-pill-button" onClick={() => handleLike(selectedNews.id)}>
                    <span className="icon">❤️</span>
                    <span className="count">{selectedNews.likes || 0}</span>
                  </div>
                  <div className="interaction-pill-button" onClick={() => setShowComments(true)}>
                    <span className="icon">💬</span>
                    <span className="count">{selectedNews.commentCount || (selectedNews.comments?.length || 0)}</span>
                  </div>
                </div>
                <div className="interaction-pill-button save-pill" onClick={() => handleSave(selectedNews.id)}>
                  <span className="icon">🔖</span>
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