import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import ReplySection from "./ReplySection";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

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
    <div style={{ marginTop: "1rem" }}>
      <strong>Comentarios</strong>

      {comments.length === 0 && (
        <p style={{ color: "#666" }}>Sé el primero en comentar</p>
      )}

      {comments.map(comment => (
        <div
          key={comment.id}
          style={{
            marginTop: "0.75rem",
            padding: "0.75rem",
            background: "#f7f7f7",
            borderRadius: "6px"
          }}
        >
          <strong>{comment.authorUsername}</strong>
          <p style={{ margin: "0.25rem 0" }}>{comment.text}</p>

          {/* RESPUESTAS */}
          <ReplySection
            postId={postId}
            commentId={comment.id}
          />
        </div>
      ))}

      {/* INPUT PRINCIPAL */}
      <form onSubmit={addComment} style={{ marginTop: "0.75rem" }}>
        <input
          placeholder="Escribe un comentario…"
          value={text}
          onChange={e => setText(e.target.value)}
          style={{ width: "100%" }}
        />
        <button type="submit">Comentar</button>
      </form>
    </div>
  );
}

export default CommentSection;
