import { useState, useEffect } from "react";
import { db, auth } from "../services/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import Navbar from "../components/NavBar";
import "../styles/FeedBack.css";

const QUESTIONS = [
  {
    id: "app_speed",
    text: "¿Qué tan rápida sentiste la aplicación al abrirla por primera vez?",
    type: "stars",
    label: ["Muy lenta", "Muy rápida"],
  },
  {
    id: "felt_stuck",
    text: "¿Hubo momentos en que pensaste que la app se había trabado o no funcionaba?",
    type: "options",
    options: ["Sí", "No"],
  },
  {
    id: "images_wait",
    text: "¿Qué tan molesto te resultó esperar a que cargaran las fotos?",
    type: "stars",
    label: ["Nada molesto", "Muy molesto"],
  },
  {
    id: "noticed_change",
    text: "¿Te diste cuenta del momento exacto en que la app cambió de mostrar fotos a mostrar solo texto?",
    type: "options",
    options: ["Sí, lo noté claramente", "Lo noté poco", "No me di cuenta"],
  },
  {
    id: "understood_offline",
    text: "Cuando perdiste conexión, ¿pudiste seguir leyendo y entendiendo el contenido solo con texto?",
    type: "options",
    options: ["Sí, sin problema", "Más o menos", "No, me faltó información"],
  },
  {
    id: "prefers_speed",
    text: "Si tuvieras muy poco internet, ¿preferirías que la app te muestre solo texto rápido en lugar de esperar por las fotos?",
    type: "options",
    options: ["Sí, prefiero rapidez", "No, prefiero esperar por las fotos"],
  },
  {
    id: "layout_shift",
    text: "¿Sentiste que los textos o botones saltaban de lugar mientras las imágenes terminaban de cargar?",
    type: "options",
    options: ["Sí, fue confuso", "No, todo se mantuvo estable"],
  },
  {
    id: "nav_ease",
    text: "¿Qué tan fácil te resultó navegar entre las secciones usando el menú de abajo?",
    type: "stars",
    label: ["Difícil", "Muy fácil"],
  },
  {
    id: "offline_trust",
    text: "¿Te sentiste más seguro usando una app que te avisa que estás sin conexión pero te permite seguir leyendo?",
    type: "options",
    options: ["Sí", "No"],
  },
  {
    id: "overall_rating",
    text: "En general, ¿qué calificación le das a la app considerando que funciona incluso sin internet?",
    type: "stars",
    label: ["Muy mala", "Excelente"],
  },
];

function Stars({ value, onChange, label }) {
  return (
    <div className="fb-stars-wrapper">
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
      {label && (
        <div className="fb-stars-labels">
          <span>{label[0]}</span>
          <span>{label[1]}</span>
        </div>
      )}
    </div>
  );
}

export default function Feedback() {
  const [answers, setAnswers]         = useState({});
  const [step, setStep]               = useState(0);
  const [sending, setSending]         = useState(false);
  const [done, setDone]               = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [checking, setChecking]       = useState(true);

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
              <p>10 preguntas rápidas sobre lo que viviste en la app. Solo toma 1 minuto.</p>
            </div>

            <div className="fb-progress-bar">
              <div
                className="fb-progress-fill"
                style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>
            <p className="fb-counter">{step + 1} de {QUESTIONS.length}</p>

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
                  label={current.label}
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