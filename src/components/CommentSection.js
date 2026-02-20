import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import ReplySection from "./ReplySection";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import "../styles/comments.css";

function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, snap => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [postId]);

  const addComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addDoc(collection(db, "posts", postId, "comments"), {
      authorUsername: auth.currentUser.email.split("@")[0],
      authorId: auth.currentUser.uid,
      text,
      createdAt: serverTimestamp()
    });
    setText("");
  };

  const handleUpdate = async (commentId) => {
    await updateDoc(doc(db, "posts", postId, "comments", commentId), { text: editText });
    setEditingId(null);
  };

  const handleDelete = async (commentId) => {
    setActiveDropdown(null);
    const res = await Swal.fire({ title: '¿Borrar?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#000' });
    if (res.isConfirmed) await deleteDoc(doc(db, "posts", postId, "comments", commentId));
  };

  return (
    <div className="comment-section">
      <strong>Comentarios</strong>
      {comments.map(c => (
        <div key={c.id} className="comment-card">
          <div className="comment-header">
            <div className="comment-username">{c.authorUsername}</div>
            {auth.currentUser?.uid === c.authorId && (
              <div style={{position: 'relative'}}>
                <button className="options-btn-mini" onClick={() => setActiveDropdown(activeDropdown === c.id ? null : c.id)}>⋮</button>
                {activeDropdown === c.id && (
                  <div className="dropdown-menu-custom">
                    <button className="dropdown-item" onClick={() => {setEditingId(c.id); setEditText(c.text); setActiveDropdown(null)}}><span>Editar</span></button>
                    <button className="dropdown-item delete" onClick={() => handleDelete(c.id)}><span>Eliminar</span></button>
                  </div>
                )}
              </div>
            )}
          </div>

          {editingId === c.id ? (
            <div style={{marginTop: '8px'}}>
              <input className="comment-input" value={editText} onChange={e => setEditText(e.target.value)} />
              <button className="save-btn" onClick={() => handleUpdate(c.id)}>Listo</button>
            </div>
          ) : (
            <p className="comment-text">{c.text}</p>
          )}

          <ReplySection postId={postId} commentId={c.id} />
        </div>
      ))}

      <form onSubmit={addComment} style={{marginTop: '15px'}}>
        <input className="comment-input" placeholder="Escribe un comentario..." value={text} onChange={e => setText(e.target.value)} />
        <button type="submit" className="comment-btn">Comentar</button>
      </form>
    </div>
  );
}

export default CommentSection;