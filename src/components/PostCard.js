import React, { useState, useEffect } from "react";
import { doc, updateDoc, deleteDoc, serverTimestamp, increment } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import CommentSection from "./CommentSection";
import Swal from "sweetalert2";
import "../styles/post.css";

// ─── Normaliza cualquier valor que venga de la API de red o del prop ──────────
// Network Information API devuelve: "slow-2g" | "2g" | "3g" | "4g"
// También puede venir desde el padre como: "offline" | "limited" | "full"
function normalizeConnection(raw) {
  if (!raw || raw === "4g" || raw === "full" || raw === "fast") return "fast";
  if (raw === "3g" || raw === "limited" || raw === "unstable") return "slow";
  if (raw === "2g" || raw === "slow-2g" || raw === "slow") return "slow";
  if (raw === "offline") return "offline";
  return "fast"; // fallback
}

function PostCard({ post, onLike, onSave, connection }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [imgSrc, setImgSrc] = useState(null); // para lazy loading manual en slow
  const imgContainerRef = React.useRef(null);

  // Estados de edición
  const [title, setTitle] = useState(post?.title || "");
  const [text, setText] = useState(post?.text || "");
  const [tags, setTags] = useState(post?.tags?.join(", ") || "");
  const [imageUrl, setImageUrl] = useState(post?.imageUrl || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);

  const navigate = useNavigate();

  // ── Derivamos los tres estados booleanos desde el prop normalizado ──────────
  const networkStatus = normalizeConnection(connection); // "fast" | "slow" | "offline"
  const isFast = networkStatus === "fast";
  const isSlow = networkStatus === "slow";
  const isOffline = networkStatus === "offline";

  const isOwner = auth.currentUser?.uid === post.authorId;
  const textToShow = isExpanded ? post.text : post.text?.substring(0, 150);
  const isLongText = post.text?.length > 150;

  // ── Label visual del badge de red ──────────────────────────────────────────
  const networkLabel = isFast ? "FAST" : isSlow ? "3G / LENTO" : "OFFLINE";

  // ── Lazy loading manual para "slow": empieza a cargar 400px ANTES de ser visible
  useEffect(() => {
    if (networkStatus !== "slow" || !post.imageUrl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImgSrc(post.imageUrl);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" } // empieza a cargar 400px antes de entrar al viewport
    );

    const el = imgContainerRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [networkStatus, post.imageUrl]);
  useEffect(() => {
    if (!isOffline && post.id) {
      const timer = setTimeout(() => {
        updateDoc(doc(db, "posts", post.id), { views: increment(1) }).catch(() => {});
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [post.id, isOffline]);

  // ── Búsqueda Unsplash solo al editar ───────────────────────────────────────
  const fetchUnsplash = async (q) => {
    try {
      const resp = await fetch(
        `https://api.unsplash.com/search/photos?query=${q}&client_id=${process.env.REACT_APP_UNSPLASH_KEY || "TU_KEY"}`
      );
      const data = await resp.json();
      setResults(data.results || []);
    } catch (e) {
      console.error("Error Unsplash:", e);
    }
  };

  useEffect(() => {
    if (isEditing && searchQuery.length > 2) {
      const timer = setTimeout(() => fetchUnsplash(searchQuery), 500);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [searchQuery, isEditing]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleHashtagClick = (tag) => {
    const cleanTag = tag.replace("#", "").toLowerCase().trim();
    navigate(`/explore?search=${cleanTag}`);
  };

  const handleDoubleTap = () => {
    if (isOffline) return;
    onLike(post);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!isOwner) return;
    const tagsArr = tags
      .split(",")
      .map((t) => t.trim().toLowerCase().replace("#", ""))
      .filter((t) => t !== "");
    await updateDoc(doc(db, "posts", post.id), {
      title,
      text,
      tags: tagsArr,
      imageUrl,
      updatedAt: serverTimestamp(),
    });
    setIsEditing(false);
    Swal.fire({
      icon: "success",
      title: "¡Actualizado!",
      toast: true,
      position: "top-end",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleDelete = async () => {
    setShowDropdown(false);
    if (!isOwner) return;
    const res = await Swal.fire({
      title: "¿Eliminar publicación?",
      text: "No podrás revertir esto",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
    });
    if (res.isConfirmed) await deleteDoc(doc(db, "posts", post.id));
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`post-card mode-${networkStatus}`}>

      {/* ══════════════ MODO EDICIÓN ══════════════ */}
      {isEditing ? (
        <div className="create-card" style={{ boxShadow: "none", padding: "0" }}>
          <div className="create-header">
            <button type="button" className="back-button" onClick={() => setIsEditing(false)}>
              ←
            </button>
            <div className="create-title">Editar publicación</div>
          </div>
          <form onSubmit={handleUpdate}>
            <input
              className="create-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título"
            />
            <textarea
              className="create-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows="5"
              placeholder="¿Qué estás pensando?"
            />
            <input
              className="create-input"
              placeholder="Buscar nueva imagen en Unsplash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div
              className="image-results"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", margin: "10px 0" }}
            >
              {results.map((f) => (
                <img
                  key={f.id}
                  src={f.urls.small}
                  style={{ width: "100%", borderRadius: "12px", cursor: "pointer", height: "100px", objectFit: "cover" }}
                  onClick={() => { setImageUrl(f.urls.regular); setResults([]); setSearchQuery(""); }}
                  alt="result"
                />
              ))}
            </div>
            <button type="submit" className="create-button">Guardar cambios</button>
          </form>
        </div>

      ) : (
        /* ══════════════ MODO VISTA ══════════════ */
        <>
          {/* Header */}
          <div className="post-header-pro">
            <div className="user-avatar-placeholder">
              {post.authorUsername?.charAt(0).toUpperCase()}
            </div>
            <div className="post-user-info">
              <div className="post-username-pro">
                {post.authorUsername}{" "}
                <span className="verified-badge">✔</span>
                {isOwner && <span style={{ fontSize: "12px", color: "#888" }}> (Tú)</span>}
              </div>
              <div className="post-timestamp">
                👁️ {post.views || 0} vistas •{" "}
                <span className={`network-badge-pill ${networkStatus}`}>
                  {networkLabel}
                </span>
              </div>
            </div>

            {/* Opciones solo para el dueño y con conexión */}
            {isOwner && !isOffline && (
              <div className="post-options-container">
                <button className="options-btn" onClick={() => setShowDropdown(!showDropdown)}>⋮</button>
                {showDropdown && (
                  <div className="dropdown-menu-custom">
                    <button className="dropdown-item" onClick={() => { setIsEditing(true); setShowDropdown(false); }}>
                      Editar
                    </button>
                    <button className="dropdown-item delete" onClick={handleDelete}>
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Body */}
          <div className="post-main-body">

            {/* ── INTERFAZ OFFLINE: solo texto plano ── */}
            {isOffline ? (
              <div className="offline-text-mode">
                {post.title && <h3 className="post-title">{post.title}</h3>}
                <p className="post-text-pro">{post.text}</p>
                {post.imageUrl && (
                  <div
                    className="offline-placeholder-pro"
                    style={{ padding: "20px", background: "#f0f2f5", borderRadius: "15px", textAlign: "center", marginTop: "10px" }}
                  >
                    <p style={{ color: "#65676b", fontSize: "14px", fontWeight: "600" }}>
                      🚫 Modo Offline — imagen oculta para ahorrar datos
                    </p>
                  </div>
                )}
              </div>

            ) : (
              /* ── INTERFAZ FAST / SLOW: texto + tags + imagen ── */
              <>
                {post.title && (
                  <h3 className="post-title" style={{ marginTop: 0, marginBottom: "8px" }}>
                    {post.title}
                  </h3>
                )}
                <p className="post-text-pro">
                  {textToShow}
                  {isLongText && !isExpanded && "..."}
                  {isLongText && (
                    <button className="see-more-btn" onClick={() => setIsExpanded(!isExpanded)}>
                      {isExpanded ? " Ver menos" : " Ver más"}
                    </button>
                  )}
                </p>

                {/* Tags */}
                <div className="post-tags" style={{ margin: "10px 0" }}>
                  {post.tags?.map((t, i) => (
                    <span
                      key={i}
                      className="tag-badge"
                      onClick={() => handleHashtagClick(t)}
                      style={{ color: "#1d9bf0", marginRight: "8px", fontWeight: "500", cursor: "pointer" }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Imagen — fast: eager inmediato / slow: IntersectionObserver con 400px de margen */}
                {post.imageUrl && (
                  <div
                    ref={imgContainerRef}
                    className="image-container"
                    onDoubleClick={handleDoubleTap}
                    style={{
                      position: "relative",
                      minHeight: isSlow && !imgSrc ? "160px" : "auto",
                      background: isSlow && !imgSrc ? "#f0f2f5" : "transparent",
                      borderRadius: "15px",
                    }}
                  >
                    {showHeart && <div className="floating-heart">❤️</div>}

                    {/* Placeholder mientras el observer aún no disparó */}
                    {isSlow && !imgSrc && (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: "13px" }}>
                        ⏳ Cargando...
                      </div>
                    )}

                    {(isFast || imgSrc) && (
                      <img
                        src={isFast ? post.imageUrl : imgSrc}
                        alt="Contenido"
                        className="post-image-pro"
                        onLoad={() => setIsLoaded(true)}
                        style={{
                          width: "100%",
                          display: "block",
                          borderRadius: "15px",
                          opacity: isLoaded ? 1 : 0.5,
                          transition: "opacity 0.4s ease",
                          filter: isSlow ? "grayscale(0.4)" : "none",
                        }}
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Acciones */}
          <div className="post-actions-pro">
            <div className="action-group">
              <button className="post-btn-pro" onClick={() => onLike(post)} disabled={isOffline}>
                ❤️ {post.likes?.length || 0}
              </button>
              <button className="post-btn-pro" onClick={() => setShowComments(!showComments)} disabled={isOffline}>
                💬
              </button>
            </div>
            <button className="post-btn-pro" onClick={() => onSave(post)} disabled={isOffline}>
              🔖
            </button>
          </div>
        </>
      )}

      {/* Sección de comentarios */}
      {showComments && !isOffline && (
        <CommentSection postId={post.id} connection={connection} />
      )}
    </div>
  );
}

export default PostCard;