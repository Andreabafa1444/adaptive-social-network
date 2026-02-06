import { useState } from "react";
import { auth, db } from "../services/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

function CreatePost() {
  const [text, setText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) return;

    await addDoc(collection(db, "posts"), {
      authorId: auth.currentUser.uid,
      authorEmail: auth.currentUser.email,
      text: text,
      imageUrl: null,
      createdAt: serverTimestamp()
    });

    setText("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        placeholder="¿Qué estás pensando?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />
      <button type="submit">Publicar</button>
    </form>
  );
}

export default CreatePost;
