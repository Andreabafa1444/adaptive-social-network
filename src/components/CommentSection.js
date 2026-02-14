import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import ReplySection from "./ReplySection";
import "../styles/comments.css";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import "../styles/feed.css";

function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, snap => {
      setComments(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
      );
    });

    return () => unsub();
  }, [postId]);

  const addComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    await addDoc(collection(db, "posts", postId, "comments"), {
      authorUsername: auth.currentUser.email.split("@")[0],
      text,
      createdAt: serverTimestamp()
    });

    setText("");
  };
return (
  <div className="comment-section">
    <strong style={{ fontSize: "0.9rem", fontWeight: 500 }}>
      Comentarios
    </strong>

    {comments.length === 0 && (
      <p style={{ color: "#888", marginTop: "12px" }}>
        Sé el primero en comentar
      </p>
    )}

    {comments.map(comment => (
      <div key={comment.id} className="comment-card">
        <div className="comment-username">
          {comment.authorUsername}
        </div>
        <p className="comment-text">
          {comment.text}
        </p>

        <ReplySection
          postId={postId}
          commentId={comment.id}
        />
      </div>
    ))}

    <form onSubmit={addComment}>
      <input
        className="comment-input"
        placeholder="Escribe un comentario…"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button type="submit" className="comment-btn">
        Comentar
      </button>
    </form>
  </div>
);

  
}

export default CommentSection;
