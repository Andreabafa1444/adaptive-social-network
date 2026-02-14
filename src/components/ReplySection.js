import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import "../styles/comments.css";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

function ReplySection({ postId, commentId }) {
  const [replies, setReplies] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "posts", postId, "comments", commentId, "replies"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, snap => {
      setReplies(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
      );
    });

    return () => unsub();
  }, [postId, commentId]);

  const addReply = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    await addDoc(
      collection(db, "posts", postId, "comments", commentId, "replies"),
      {
        authorUsername: auth.currentUser.email.split("@")[0],
        text,
        createdAt: serverTimestamp()
      }
    );

    setText("");
  };

  return (
    <div className="reply-section">
  
      {replies.map(reply => (
        <div key={reply.id} className="reply-card">
          <div className="reply-username">
            {reply.authorUsername}
          </div>
          <p className="reply-text">
            {reply.text}
          </p>
        </div>
      ))}
  
      <form onSubmit={addReply} className="reply-form">
        <input
          className="reply-input"
          placeholder="Responder..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button type="submit" className="reply-btn">
          Responder
        </button>
      </form>
  
    </div>
  );
  
}

export default ReplySection;
