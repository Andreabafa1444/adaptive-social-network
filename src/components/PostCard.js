import React, { useState, useEffect } from "react";
import { doc, updateDoc, deleteDoc, serverTimestamp, increment } from "firebase/firestore";
import { db, auth } from "../services/firebase"; 
import CommentSection from "./CommentSection";
import Swal from "sweetalert2";
import "../styles/post.css";

function PostCard({ post, onLike, onSave, connection }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 📡 Leemos el estado del Hook de métricas
  const networkStatus = connection?.status || "fast";
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  
  const [title, setTitle] = useState(post?.title || "");
  const [text, setText] = useState(post?.text || "");
  const [tags, setTags] = useState(post?.tags?.join(", ") || "");
  const [imageUrl, setImageUrl] = useState(post?.imageUrl || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);

  const LIMIT = 150;
  const isLongText = post.text?.length > LIMIT;
  const textToShow = isExpanded ? post.text : post.text?.substring(0, LIMIT);

  const isOwner = auth.currentUser?.uid === post.authorId;

  useEffect(() => {
    const registerView = async () => {
      if (connection?.online) {
        try {
          const postRef = doc(db, "posts", post.id);
          await updateDoc(postRef, { views: increment(1) });
        } catch (error) {
          console.error("Error al registrar vista:", error);
        }
      }
    };
    registerView();
  }, [post.id, connection?.online]);

  const fetchUnsplash = async (q) => {
    try {
      const resp = await fetch(`https://api.unsplash.com/search/photos?query=${q}&client_id=${process.env.REACT_APP_UNSPLASH_KEY || 'TU_KEY'}`);
      const data = await resp.json();
      setResults(data.results || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timer = setTimeout(() => fetchUnsplash(searchQuery), 500);
      return () => clearTimeout(timer);
    } else { setResults([]); }
  }, [searchQuery]);

  const handleDoubleTap = () => {
    onLike(post);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!isOwner) return;
    const postRef = doc(db, "posts", post.id);
    const tagsArr = tags.split(",").map(t => t.trim()).filter(t => t !== "");
    await updateDoc(postRef, { title, text, tags: tagsArr, imageUrl, updatedAt: serverTimestamp() });
    setIsEditing(false);
    Swal.fire({ icon: 'success', title: '¡Actualizado!', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
  };

  const handleDelete = async () => {
    setShowDropdown(false);
    if (!isOwner) return;
    if (!connection?.online) return Swal.fire('Offline', 'Red inestable', 'error');
    const res = await Swal.fire({ title: '¿Eliminar?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#000', confirmButtonText: 'Sí, eliminar' });
    if (res.isConfirmed) await deleteDoc(doc(db, "posts", post.id));
  };

  return (
    <div className="post-card">
      {isEditing ? (
        <div className="create-card" style={{ boxShadow: 'none', padding: '0' }}>
          <div className="create-header">
            <button type="button" className="back-button" onClick={() => setIsEditing(false)}>←</button>
            <div className="create-title">Editar publicación</div>
          </div>
          <form onSubmit={handleUpdate}>
            <input className="create-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" />
            <textarea className="create-textarea" value={text} onChange={(e) => setText(e.target.value)} rows="5" />
            <input className="create-input" placeholder="Buscar nueva imagen..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <div className="image-results" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '10px 0' }}>
              {results.map(f => (
                <img key={f.id} src={f.urls.small} style={{width:'100%', borderRadius:'12px', cursor:'pointer'}} onClick={() => {setImageUrl(f.urls.regular); setResults([]); setSearchQuery("")}} alt="unsplash" />
              ))}
            </div>
            <button type="submit" className="create-button">Guardar cambios</button>
          </form>
        </div>
      ) : (
        <>
          <div className="post-header-pro">
            <div className="user-avatar-placeholder">{post.authorUsername?.charAt(0).toUpperCase()}</div>
            <div className="post-user-info">
              <div className="post-username-pro">{post.authorUsername} <span className="verified-badge">✔</span></div>
              <div className="post-timestamp">
                Hace 3m • 👁️ {post.views || 0} vistas • 
                <span className={`network-badge-pill ${networkStatus}`}>
                  {networkStatus === "fast" ? "FAST" : 
                   networkStatus === "unstable" ? "INTERMEDIO" : "OFFLINE"}
                </span>
              </div>
            </div>
            
            {isOwner && (
              <div className="post-options-container">
                <button className="options-btn" onClick={() => setShowDropdown(!showDropdown)}>⋮</button>
                {showDropdown && (
                  <div className="dropdown-menu-custom">
                    <button className="dropdown-item" onClick={() => {setIsEditing(true); setShowDropdown(false)}}>
                      <span>Editar publicación</span>
                    </button>
                    <button className="dropdown-item delete" onClick={handleDelete}>
                      <span>Eliminar</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
  
          <div className="post-main-body">
            {post.title && <h3 className="post-title" style={{marginTop: 0}}>{post.title}</h3>}
            <p className="post-text-pro">
              {textToShow}
              {isLongText && !isExpanded && "..."}
              {isLongText && (
                <button className="see-more-btn" onClick={() => setIsExpanded(!isExpanded)}>
                  {isExpanded ? " Ver menos" : " Ver más"}
                </button>
              )}
            </p>
            <div className="post-tags">
              {post.tags?.map((t, i) => <span key={i} className="tag-badge">#{t}</span>)}
            </div>
            
            <div className="image-container" onDoubleClick={handleDoubleTap}>
              {showHeart && <div className="floating-heart">❤️</div>}
              
              {post.imageUrl && connection?.online && networkStatus !== "critical" ? (
                <img 
                  src={post.imageUrl} 
                  alt="Post" 
                  loading={networkStatus === "unstable" ? "lazy" : "eager"}
                  className={`post-image-pro ${isLoaded ? 'image-loaded' : 'image-loading'}`}
                  onLoad={() => setIsLoaded(true)}
                  style={{ 
                    filter: !isLoaded && networkStatus === "unstable" ? "blur(10px)" : "none",
                    transition: "filter 0.5s ease"
                  }}
                />
              ) : (
                post.imageUrl && (
                  <div className="offline-placeholder-pro">
                    <p>📉 Modo Resiliente: Imagen pausada</p>
                  </div>
                )
              )}
            </div>
          </div>
  
          <div className="post-actions-pro">
            <div className="action-group">
              <button className="post-btn-pro" onClick={() => onLike(post)}>❤️ {post.likes?.length || 0}</button>
              <button className="post-btn-pro" onClick={() => setShowComments(!showComments)}>💬 Comentar</button>
            </div>
            <button className="post-btn-pro" onClick={() => onSave(post)}>🔖 Guardar</button>
          </div>
        </>
      )}
      {showComments && <CommentSection postId={post.id} connection={connection} />}
    </div>
  );
}

export default PostCard;