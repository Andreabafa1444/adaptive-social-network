import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "../services/firebase";

const seedPostsData = [
  {
    authorId: "seedUser01",
    authorUsername: "urbanPixel",
    authorEmail: "urbanpixel@email.com",
    title: "¿La pizza con piña merece tanto odio?",
    text: "A ver… la combinación dulce-salado funciona en muchos platos. ¿Por qué con la pizza es un crimen? 🍍🍕",
    imageUrl: "https://images.unsplash.com/photo-1601924582975-7aa8d8b9c9b6",
    tags: ["pizza", "debate", "food"],
    likes: [],
    savedBy: []
  },
  {
    authorId: "seedUser02",
    authorUsername: "codeNomad",
    authorEmail: "codenomad@email.com",
    title: "¿La IA nos va a reemplazar?",
    text: "No creo que la IA nos quite el trabajo… creo que nos va a obligar a dejar de hacer tareas repetitivas.",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
    tags: ["ia", "tech", "future"],
    likes: [],
    savedBy: []
  },
  {
    authorId: "seedUser03",
    authorUsername: "civicMind",
    authorEmail: "civicmind@email.com",
    title: "Gobierno digital y trámites",
    text: "Imaginen un país donde todo trámite fuera claro, digital y rápido. Eso sí cambiaría la productividad.",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf",
    tags: ["gobierno", "digital", "sociedad"],
    likes: [],
    savedBy: []
  },
  {
    authorId: "seedUser04",
    authorUsername: "popCultureHub",
    authorEmail: "pop@email.com",
    title: "La cultura pop se mueve demasiado rápido",
    text: "Un meme dura 3 días, una tendencia 1 semana… vivimos en una aceleración constante.",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
    tags: ["cultura", "pop", "trends"],
    likes: [],
    savedBy: []
  },
  {
    authorId: "seedUser05",
    authorUsername: "remoteSoul",
    authorEmail: "remote@email.com",
    title: "El trabajo remoto cambió todo",
    text: "Ya no imagino volver a oficina todos los días. El balance de vida mejora muchísimo.",
    imageUrl: "https://images.unsplash.com/photo-1587614382346-acf2d1f5b2a0",
    tags: ["remote", "work", "life"],
    likes: [],
    savedBy: []
  },
  {
    authorId: "seedUser06",
    authorUsername: "algorithmWatcher",
    authorEmail: "algo@email.com",
    title: "El algoritmo define lo que vemos",
    text: "A veces siento que no descubrimos cosas nuevas, solo vemos lo que el algoritmo decide mostrarnos.",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    tags: ["algoritmo", "redes", "reflexion"],
    likes: [],
    savedBy: []
  },
  {
    authorId: "seedUser07",
    authorUsername: "minimalWave",
    authorEmail: "minimal@email.com",
    title: "Minimalismo digital",
    text: "Reducir apps y notificaciones me ayudó más mentalmente de lo que esperaba.",
    imageUrl: "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
    tags: ["minimalismo", "digital", "vida"],
    likes: [],
    savedBy: []
  },
  {
    authorId: "seedUser08",
    authorUsername: "streamCritic",
    authorEmail: "stream@email.com",
    title: "¿Netflix ya no es lo mismo?",
    text: "Antes encontraba algo bueno rápido. Ahora siento que hay demasiado contenido pero poca calidad.",
    imageUrl: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4",
    tags: ["streaming", "series", "entretenimiento"],
    likes: [],
    savedBy: []
  },
  {
    authorId: "seedUser09",
    authorUsername: "eduNext",
    authorEmail: "edu@email.com",
    title: "Educación online vs presencial",
    text: "Las plataformas digitales democratizan el conocimiento, pero la interacción humana sigue siendo clave.",
    imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
    tags: ["educacion", "online", "futuro"],
    likes: [],
    savedBy: []
  },
  {
    authorId: "seedUser10",
    authorUsername: "socialMirror",
    authorEmail: "mirror@email.com",
    title: "¿Las redes nos conectan o aíslan?",
    text: "Podemos hablar con cualquiera en el mundo, pero a veces nos sentimos más solos que nunca.",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
    tags: ["redes", "sociedad", "reflexion"],
    likes: [],
    savedBy: []
  }
];

export async function seedPosts() {
  const postsRef = collection(db, "posts");

  // 🔥 BORRAR existentes
  const snapshot = await getDocs(postsRef);
  for (const document of snapshot.docs) {
    await deleteDoc(doc(db, "posts", document.id));
  }

  // 🔥 INSERTAR nuevos
  for (const post of seedPostsData) {
    await addDoc(postsRef, {
      ...post,
      createdAt: serverTimestamp()
    });
  }

  console.log("✅ Seed ejecutado correctamente");
}
