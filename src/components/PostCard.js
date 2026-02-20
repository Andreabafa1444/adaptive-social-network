import React, { useState, useEffect } from "react";
import { doc, updateDoc, deleteDoc, serverTimestamp, increment } from "firebase/firestore";
import { db, auth } from "../services/firebase"; 
import { useNavigate } from "react-router-dom";
import CommentSection from "./CommentSection";
import Swal from "sweetalert2";
import "../styles/post.css";

function PostCard({ post, onLike, onSave, connection }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const navigate = useNavigate();

  // ESTADOS DE EDICIÓN
  const [title, setTitle] = useState(post?.title || "");
  const [text, setText] = useState(post?.text || "");
  const [tags, setTags] = useState(post?.tags?.join(", ") || "");
  const [imageUrl, setImageUrl] = useState(post?.imageUrl || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);

  const networkStatus = connection?.status || "fast";
  const isOwner = auth.currentUser?.uid === post.authorId;

  const textToShow = isExpanded ? post.text : post.text?.substring(0, 150);
  const isLongText = post.text?.length > 150;

  // 👁️ Vistas (Lógica de 2 segundos de permanencia)
  useEffect(() => {
    if (connection?.online && post.id) {
      const timer = setTimeout(() => {
        const postRef = doc(db, "posts", post.id);
        updateDoc(postRef, { views: increment(1) }).catch(() => {});
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [post.id, connection?.online]);

  // 🖼️ Lógica de Unsplash para edición
  const fetchUnsplash = async (q) => {
    try {
      const resp = await fetch(`https://api.unsplash.com/search/photos?query=${q}&client_id=${process.env.REACT_APP_UNSPLASH_KEY || 'TU_KEY'}`);
      const data = await resp.json();
      setResults(data.results || []);
    } catch (e) { console.error("Error Unsplash:", e); }
  };

  useEffect(() => {
    if (isEditing && searchQuery.length > 2) {
      const timer = setTimeout(() => fetchUnsplash(searchQuery), 500);
      return () => clearTimeout(timer);
    } else { setResults([]); }
  }, [searchQuery, isEditing]);

  // 🔗 Clic en Hashtag (Navegación normalizada a minúsculas)
  const handleHashtagClick = (tag) => {
    // Convertimos el clic a minúsculas automáticamente
    const cleanTag = tag.replace("#", "").toLowerCase().trim();
    navigate(`/explore?search=${cleanTag}`);
  };

  const handleDoubleTap = () => {
    onLike(post);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!isOwner) return;
    const postRef = doc(db, "posts", post.id);
    const tagsArr = tags.split(",").map(t => t.trim().toLowerCase().replace("#", "")).filter(t => t !== "");
    await updateDoc(postRef, { 
      title, 
      text, 
      tags: tagsArr, 
      imageUrl, 
      updatedAt: serverTimestamp() 
    });
    setIsEditing(false);
    Swal.fire({ icon: 'success', title: '¡Actualizado!', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
  };

  const handleDelete = async () => {
    setShowDropdown(false);
    if (!isOwner) return;
    const res = await Swal.fire({ title: '¿Eliminar?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#000' });
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
            <textarea className="create-textarea" value={text} onChange={(e) => setText(e.target.value)} rows="5" placeholder="¿Qué estás pensando?" />
            <input className="create-input" placeholder="Buscar nueva imagen en Unsplash..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            
            <div className="image-results" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '10px 0' }}>
              {results.map(f => (
                <img 
                  key={f.id} 
                  src={f.urls.small} 
                  style={{width:'100%', borderRadius:'12px', cursor:'pointer', height: '100px', objectFit: 'cover'}} 
                  onClick={() => {setImageUrl(f.urls.regular); setResults([]); setSearchQuery("")}} 
                  alt="result" 
                />
              ))}
            </div>
            
            {imageUrl && <p style={{fontSize: '10px', color: 'green'}}>✓ Imagen seleccionada</p>}
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
                👁️ {post.views || 0} vistas • 
                <span className={`network-badge-pill ${networkStatus}`}>
                  {networkStatus === "fast" ? "FAST" : networkStatus === "unstable" ? "INTERMEDIO" : "OFFLINE"}
                </span>
              </div>
            </div>
            {isOwner && (
              <div className="post-options-container">
                <button className="options-btn" onClick={() => setShowDropdown(!showDropdown)}>⋮</button>
                {showDropdown && (
                  <div className="dropdown-menu-custom">
                    <button className="dropdown-item" onClick={() => {setIsEditing(true); setShowDropdown(false)}}>Editar</button>
                    <button className="dropdown-item delete" onClick={handleDelete}>Eliminar</button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="post-main-body">
            {post.title && <h3 className="post-title" style={{marginTop: 0, marginBottom: '8px'}}>{post.title}</h3>}
            <p className="post-text-pro">
              {textToShow}{isLongText && !isExpanded && "..."}
              {isLongText && (
                <button className="see-more-btn" onClick={() => setIsExpanded(!isExpanded)}>
                  {isExpanded ? " Ver menos" : " Ver más"}
                </button>
              )}
            </p>

            <div className="post-tags" style={{ margin: '10px 0' }}>
              {post.tags?.map((t, i) => (
                <span 
                  key={i} 
                  className="tag-badge" 
                  onClick={() => handleHashtagClick(t)}
                  style={{ color: '#1d9bf0', marginRight: '8px', fontWeight: '500', cursor: 'pointer' }}
                >
                  #{t}
                </span>
              ))}
            </div>
            
            <div className="image-container" onDoubleClick={handleDoubleTap} style={{ position: 'relative' }}>
              {showHeart && <div className="floating-heart">❤️</div>}
              {post.imageUrl && networkStatus !== "critical" ? (
                <img 
                  src={post.imageUrl} 
                  alt="Contenido" 
                  loading={networkStatus === "fast" ? "eager" : "lazy"}
                  className="post-image-pro"
                  onLoad={() => setIsLoaded(true)}
                  style={{ width: '100%', display: 'block', borderRadius: '15px', opacity: isLoaded ? 1 : 0.7, transition: "opacity 0.2s ease" }}
                />
              ) : (
                post.imageUrl && (
                  <div className="offline-placeholder-pro" style={{ padding: '40px', background: '#f0f2f5', borderRadius: '15px', textAlign: 'center' }}>
                    <p style={{ color: '#65676b', fontWeight: '600' }}>🚫 Red Crítica: Imagen oculta para ahorro de datos</p>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="post-actions-pro">
            <div className="action-group">
              <button className="post-btn-pro" onClick={() => onLike(post)}>❤️ {post.likes?.length || 0}</button>
              <button className="post-btn-pro" onClick={() => setShowComments(!showComments)}>💬</button>
            </div>
            <button className="post-btn-pro" onClick={() => onSave(post)}>🔖</button>
          </div>
        </>
      )}
      {showComments && <CommentSection postId={post.id} connection={connection} />}
    </div>
  );
}
export default PostCard;