import { useState, useEffect } from "react";
import { db, auth } from "../services/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import Navbar from "../components/NavBar";
import "../styles/FeedBack.css";

const QUESTIONS = [
  {
    id: "noticed_offline",
    text: "¿Notaste que la app cambió cuando perdiste conexión?",
    type: "options",
    options: ["Sí, claramente", "Lo noté poco", "No me di cuenta"],
  },
  {
    id: "understood_offline",
    text: "Sin imágenes, ¿pudiste leer y entender el contenido?",
    type: "options",
    options: ["Sí, perfectamente", "Más o menos", "No, me faltó información"],
  },
  {
    id: "missed_images",
    text: "¿Te molestó no ver las fotos en modo sin conexión?",
    type: "options",
    options: ["Mucho", "Poco", "Nada, prefiero que cargue rápido"],
  },
  {
    id: "would_use_offline",
    text: "¿Usarías esta versión de solo texto si tuvieras señal muy mala?",
    type: "options",
    options: ["Sí", "No", "Depende de la situación"],
  },
  {
    id: "felt_difference_return",
    text: "Al recuperar la conexión, ¿sentiste que la app mejoró visualmente?",
    type: "options",
    options: ["Sí, claramente", "Un poco", "No noté diferencia"],
  },
  {
    id: "preference",
    text: "¿Qué versión preferiste en general?",
    type: "options",
    options: ["Con imágenes (conexión normal)", "Sin imágenes (modo offline)", "Me da igual"],
  },
  {
    id: "overall_experience",
    text: "¿Qué tan satisfecho quedaste con la experiencia general de la app?",
    type: "stars",
  },
  {
    id: "would_recommend",
    text: "¿Recomendarías una app que se adapta automáticamente a tu conexión?",
    type: "options",
    options: ["Sí, definitivamente", "Tal vez", "No"],
  },
];

function Stars({ value, onChange }) {
  return (
    <div className="fb-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`fb-star ${value >= n ? "active" : ""}`}
          onClick={() => onChange(n)}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function Feedback() {
  const [answers, setAnswers]     = useState({});
  const [step, setStep]           = useState(0);
  const [sending, setSending]     = useState(false);
  const [done, setDone]           = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [checking, setChecking]   = useState(true);

  // Verificar si ya respondió
  useEffect(() => {
    const check = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) { setChecking(false); return; }
      try {
        const snap = await getDoc(doc(db, "survey_completed", uid));
        if (snap.exists()) setAlreadyDone(true);
      } catch {}
      setChecking(false);
    };
    check();
  }, []);

  const current = QUESTIONS[step];
  const canNext = answers[current?.id] !== undefined;

  const handleAnswer = (val) => {
    setAnswers((prev) => ({ ...prev, [current.id]: val }));
  };

  const handleNext = async () => {
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    setSending(true);
    const uid = auth.currentUser?.uid || "anonymous";
    try {
      await addDoc(collection(db, "survey_responses"), {
        userId: uid,
        answers,
        timestamp: serverTimestamp(),
      });
      await setDoc(doc(db, "survey_completed", uid), {
        completedAt: serverTimestamp(),
      });
      setDone(true);
    } catch (e) {
      console.error("Error guardando:", e);
    }
    setSending(false);
  };

  if (checking) return null;

  return (
    <div className="fb-wrapper">
      <Navbar />
      <div className="fb-container">

        {/* Ya respondió */}
        {alreadyDone && (
          <div className="fb-done-card">
            <div className="fb-done-emoji">✅</div>
            <h2>¡Ya respondiste!</h2>
            <p>Gracias por participar en esta investigación. Tu opinión es muy valiosa para la tesis.</p>
          </div>
        )}

        {/* Enviado exitosamente */}
        {!alreadyDone && done && (
          <div className="fb-done-card">
            <div className="fb-done-emoji">🎉</div>
            <h2>¡Gracias por tu tiempo!</h2>
            <p>Tus respuestas fueron guardadas. Estás ayudando a mejorar la experiencia de usuarios con conectividad limitada.</p>
          </div>
        )}

        {/* Formulario */}
        {!alreadyDone && !done && (
          <>
            <div className="fb-header">
              <h1>Tu experiencia importa</h1>
              <p>Responde estas {QUESTIONS.length} preguntas sobre lo que viviste en la app. Solo toma 1 minuto.</p>
            </div>

            {/* Progreso */}
            <div className="fb-progress-bar">
              <div
                className="fb-progress-fill"
                style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>
            <p className="fb-counter">{step + 1} de {QUESTIONS.length}</p>

            {/* Pregunta */}
            <div className="fb-card">
              <p className="fb-question">{current.text}</p>

              {current.type === "options" && (
                <div className="fb-options">
                  {current.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`fb-option ${answers[current.id] === opt ? "selected" : ""}`}
                      onClick={() => handleAnswer(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {current.type === "stars" && (
                <Stars
                  value={answers[current.id] || 0}
                  onChange={(val) => handleAnswer(val)}
                />
              )}
            </div>

            <button
              className="fb-next"
              onClick={handleNext}
              disabled={!canNext || sending}
            >
              {sending
                ? "Guardando..."
                : step < QUESTIONS.length - 1
                ? "Siguiente →"
                : "Enviar respuestas ✓"}
            </button>
          </>
        )}

      </div>
    </div>
  );
}