import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

const seedPostsData = [
  {
    authorId: "JLuNPXg1f0Vo5dFBTQYJD3IPpum2",
    authorUsername: "andrea_dev",
    authorEmail: "andreaprueba14@gmail.com",
    title: "Aplicaciones PWA y conectividad",
    text: "Las Progressive Web Apps permiten ofrecer una experiencia funcional incluso en escenarios de conectividad limitada, mejorando la accesibilidad del sistema.",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    tags: ["pwa", "conectividad", "web"],
    likes: [],
    savedBy: []
  },
  {
    authorId: "JLuNPXg1f0Vo5dFBTQYJD3IPpum2",
    authorUsername: "andrea_dev",
    authorEmail: "andreaprueba14@gmail.com",
    title: "Diseño de interfaces adaptativas",
    text: "Una interfaz adaptativa ajusta la cantidad de información visual mostrada según la calidad de la red del usuario.",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    tags: ["ui", "ux", "adaptativa"],
    likes: [],
    savedBy: []
  },
  {
    authorId: "JLuNPXg1f0Vo5dFBTQYJD3IPpum2",
    authorUsername: "andrea_dev",
    authorEmail: "andreaprueba14@gmail.com",
    title: "Impacto del clima en la red",
    text: "Factores ambientales como la lluvia o tormentas pueden afectar la estabilidad de las conexiones inalámbricas.",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    tags: ["clima", "infraestructura", "redes"],
    likes: [],
    savedBy: []
  },
  {
    authorId: "JLuNPXg1f0Vo5dFBTQYJD3IPpum2",
    authorUsername: "andrea_dev",
    authorEmail: "andreaprueba14@gmail.com",
    title: "Persistencia con Firestore",
    text: "Cloud Firestore facilita el almacenamiento de datos no relacionales, permitiendo flexibilidad en el esquema y escalabilidad.",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    tags: ["firebase", "firestore", "nosql"],
    likes: [],
    savedBy: []
  },
  {
    authorId: "JLuNPXg1f0Vo5dFBTQYJD3IPpum2",
    authorUsername: "andrea_dev",
    authorEmail: "andreaprueba14@gmail.com",
    title: "Evaluación del rendimiento",
    text: "Reducir el peso de los recursos visuales permite mejorar los tiempos de carga en redes de baja velocidad.",
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
    tags: ["rendimiento", "optimizacion", "web"],
    likes: [],
    savedBy: []
  }
];

export async function seedPosts() {
  const postsRef = collection(db, "posts");

  for (const post of seedPostsData) {
    await addDoc(postsRef, {
      ...post,
      createdAt: serverTimestamp()
    });
  }

  console.log("Seed limpio de 5 publicaciones creado");
}
