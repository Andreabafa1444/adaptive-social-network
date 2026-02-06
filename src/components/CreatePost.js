import { useState } from "react";
import { auth, db } from "../services/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

function CreatePost() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) return;

    const tagsArray = tags
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag !== "");

      await addDoc(collection(db, "posts"), {
        authorId: auth.currentUser.uid,
        authorEmail: auth.currentUser.email,
        authorUsername: auth.currentUser.email.split("@")[0], // 👈 temporal
        title: title || null,
        text: text,
        imageUrl: null,
        tags: tagsArray,
        createdAt: serverTimestamp()
      });
      
    setTitle("");
    setText("");
    setTags("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <input
        type="text"
        placeholder="Título (opcional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />

      <textarea
        placeholder="¿Qué estás pensando?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />

      <input
        type="text"
        placeholder="Hashtags (separados por comas)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />

      <button type="submit">Publicar</button>
    </form>
  );
}

export default CreatePost;
