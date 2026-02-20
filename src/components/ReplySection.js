import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import Swal from "sweetalert2";

function ReplySection({ postId, commentId }) {
  const [replies, setReplies] = useState([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "posts", postId, "comments", commentId, "replies"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, snap => {
      setReplies(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [postId, commentId]);

  const addReply = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addDoc(collection(db, "posts", postId, "comments", commentId, "replies"), {
      authorUsername: auth.currentUser.email.split("@")[0],
      authorId: auth.currentUser.uid,
      text,
      createdAt: serverTimestamp()
    });
    setText("");
  };

  const handleDelete = async (replyId) => {
    setActiveDropdown(null);
    if ((await Swal.fire({ title: '¿Borrar?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#000' })).isConfirmed) {
      await deleteDoc(doc(db, "posts", postId, "comments", commentId, "replies", replyId));
    }
  };

  return (
    <div className="reply-section">
      {replies.map(r => (
        <div key={r.id} className="reply-card">
          <div className="comment-header">
            <div className="reply-username">{r.authorUsername}</div>
            {auth.currentUser?.uid === r.authorId && (
              <div style={{position: 'relative'}}>
                <button className="options-btn-mini" onClick={() => setActiveDropdown(activeDropdown === r.id ? null : r.id)}>⋮</button>
                {activeDropdown === r.id && (
                  <div className="dropdown-menu-custom">
                    <button className="dropdown-item" onClick={() => {setEditingId(r.id); setEditText(r.text); setActiveDropdown(null)}}><span>Editar</span></button>
                    <button className="dropdown-item delete" onClick={() => handleDelete(r.id)}><span>Borrar</span></button>
                  </div>
                )}
              </div>
            )}
          </div>
          {editingId === r.id ? (
            <div style={{marginTop: '5px'}}>
              <input className="reply-input" value={editText} onChange={e => setEditText(e.target.value)} />
              <button className="save-btn" style={{padding: '5px 12px'}} onClick={async () => {
                await updateDoc(doc(db, "posts", postId, "comments", commentId, "replies", r.id), { text: editText });
                setEditingId(null);
              }}>Listo</button>
            </div>
          ) : (
            <p className="reply-text">{r.text}</p>
          )}
        </div>
      ))}
      <form onSubmit={addReply} style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <input className="reply-input" placeholder="Responder..." value={text} onChange={e => setText(e.target.value)} />
        <button type="submit" className="reply-btn" style={{marginTop: 0}}>Responder</button>
      </form>
    </div>
  );
}

export default ReplySection;