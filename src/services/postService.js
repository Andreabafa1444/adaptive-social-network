import { db } from "./firebase"; // Tu archivo de config
import { doc, deleteDoc, updateDoc } from "firebase/firestore";

// Borrar Post
export const deletePost = async (postId) => {
  const postRef = doc(db, "posts", postId);
  return await deleteDoc(postRef);
};

// Editar Post
export const updatePost = async (postId, newData) => {
  const postRef = doc(db, "posts", postId);
  return await updateDoc(postRef, newData);
};