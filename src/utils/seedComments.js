import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

export async function seedComments(postId) {
  const commentsRef = collection(db, "posts", postId, "comments");

  const comment1 = await addDoc(commentsRef, {
    authorId: "demo1",
    authorUsername: "andrea_dev",
    text: "Este post está muy interesante.",
    parentId: null,
    createdAt: serverTimestamp()
  });

  await addDoc(commentsRef, {
    authorId: "demo2",
    authorUsername: "juanito",
    text: "Estoy de acuerdo contigo.",
    parentId: comment1.id,
    createdAt: serverTimestamp()
  });
}
