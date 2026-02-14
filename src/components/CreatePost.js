import { useState } from "react";
import { auth, db } from "../services/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/createPost.css";

function CreatePostPage() {

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const navigate = useNavigate();

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
      authorUsername: auth.currentUser.email.split("@")[0],
      title: title || null,
      text,
      imageUrl: null,
      tags: tagsArray,
      createdAt: serverTimestamp()
    });

    navigate("/feed");
  };

  return (
    <div className="create-wrapper">
      <div className="create-card">

        <div className="create-title">
          Nueva publicación
        </div>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="Título (opcional)"
            className="create-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="¿Qué estás pensando?"
            className="create-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <input
            type="text"
            placeholder="Hashtags separados por coma"
            className="create-input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <button className="create-button">
            Publicar
          </button>

        </form>

      </div>
    </div>
  );
}

export default CreatePostPage;
