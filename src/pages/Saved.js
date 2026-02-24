import { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig"; 
import { collection, onSnapshot, query, where, doc, updateDoc, increment } from "firebase/firestore";
import Navbar from "../components/NavBar";
import CommentSection from "../components/CommentSection"; // Tu componente real
import "../styles/News.css"; 

function Saved() {
  const [allSaved, setAllSaved] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null); 
  const [showComments, setShowComments] = useState(false);
  const [connectionType, setConnectionType] = useState("full"); // Restaurado funcionamiento original
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    // Lógica de conexión restaurada
    const checkConnection = () => {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (!navigator.onLine) setConnectionType("offline");
      else if (conn && (conn.saveData || ["2g", "3g"].includes(conn.effectiveType))) setConnectionType("limited");
      else setConnectionType("full");
    };
    checkConnection();

    // Consultas gemelas para posts y noticias
    const qPosts = query(collection(db, "posts"), where("savedBy", "array-contains", currentUser.uid));
    const qNews = query(collection(db, "noticias_tesis"), where("savedBy", "array-contains", currentUser.uid));

    const unsubPosts = onSnapshot(qPosts, (snap) => {
      const postsData = snap.docs.map(doc => ({ id: doc.id, type: 'post', ...doc.data() }));
      actualizarLista(postsData, 'post');
    });

    const unsubNews = onSnapshot(qNews, (snap) => {
      const newsData = snap.docs.map(doc => ({ id: doc.id, type: 'news', ...doc.data() }));
      actualizarLista(newsData, 'news');
    });

    // Mantenemos la lógica de actualización sin perder datos
    const actualizarLista = (nuevosDatos, tipo) => {
        setAllSaved(prev => {
            const filtrados = prev.filter(item => item.type !== tipo);
            const combinados = [...filtrados, ...nuevosDatos];
            // Limpieza de duplicados por título/texto restaurada
            return Array.from(new Map(combinados.map(item => [item.title || item.text, item])).values());
        });
    };

    return () => { unsubPosts(); unsubNews(); };
  }, [currentUser]);

  const handleLike = async (id) => {
    try {
      const col = allSaved.find(a => a.id === id)?.type === 'news' ? "noticias_tesis" : "posts";
      const itemRef = doc(db, col, id);
      await updateDoc(itemRef, { likes: increment(1) });
      setSelectedNews(prev => ({...prev, likes: (prev.likes || 0) + 1}));
    } catch (e) { console.error(e); }
  };

  return (
    <div className={`news-page mode-${connectionType}`}>
      <Navbar />
      <div className="container" style={{ marginTop: "100px" }}>
        <header className="news-header">
           <div className="title-section">
              <h1>Mis Guardados 🔖</h1>
              <div className={`connection-pill ${connectionType === 'offline' ? 'offline' : 'online'}`}>
                <div className="connection-dot"></div>
                {connectionType.toUpperCase()}
              </div>
           </div>
        </header>
        
        <div className="news-list-container">
          {allSaved.map((item) => (
            <article key={item.id} className="social-card-mini" onClick={() => { setSelectedNews(item); setShowComments(false); }}>
              <div className="card-image-box">
                {connectionType !== "offline" && (item.urlToImage || item.imageUrl) && (
                  <img src={item.urlToImage || item.imageUrl} alt="preview" />
                )}
              </div>
              <div className="card-content-box">
                <span className="source-label">
                    {item.type === 'news' ? item.source?.name : `Post de ${item.authorUsername}`}
                </span>
                <h3>{item.title || item.text}</h3>
                <div className="card-footer-mini">
                  <span>❤️ {item.likes?.length || item.likes || 0}</span> • 
                  <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Reciente'}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* MODAL 1: DETALLE (Con todas las funciones originales) */}
      {selectedNews && !showComments && (
        <div className="modal-overlay" onClick={() => setSelectedNews(null)}>
          <div className="modal-content-social" onClick={e => e.stopPropagation()}>
            <button className="close-modal-social" onClick={() => setSelectedNews(null)}>×</button>
            <div className="modal-image-container">
              <img src={selectedNews.urlToImage || selectedNews.imageUrl} className="modal-img-social" alt="detail" />
            </div>
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
                <div className="interaction-item" onClick={() => setShowComments(true)}>
                  <span className="icon">💬</span>
                  <span className="count">Ver Hilo Real</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: COMENTARIOS (Aquí vive tu Fornite real) */}
      {showComments && selectedNews && (
        <div className="modal-overlay" onClick={() => setShowComments(false)}>
          <div className="modal-content-comments" onClick={e => e.stopPropagation()}>
            <header className="comments-header">
              <button className="back-btn" onClick={() => setShowComments(false)}>← Volver</button>
              <h2>Conversación</h2>
            </header>
            
            <div className="comments-list-container-scroll" style={{ padding: '20px', overflowY: 'auto' }}>
               {/* INTEGRACIÓN: Si es post de usuario, llamamos a tus subcolecciones */}
               {selectedNews.type === 'post' ? (
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