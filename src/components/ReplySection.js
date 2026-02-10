import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
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
    <div style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
      {replies.map(reply => (
        <div
          key={reply.id}
          style={{
            background: "#eee",
            padding: "0.5rem",
            borderRadius: "4px",
            marginBottom: "0.25rem"
          }}
        >
          <strong>{reply.authorUsername}</strong>
          <p style={{ margin: 0 }}>{reply.text}</p>
        </div>
      ))}

      <form onSubmit={addReply}>
        <input
          placeholder="Responder…"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button type="submit">Responder</button>
      </form>
    </div>
  );
}

export default ReplySection;
