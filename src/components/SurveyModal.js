import { useEffect, useState, useRef } from "react";
import { db, auth } from "../services/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { surveyOpenRef, onModeChangeRef } from "../hooks/useConnection";
import "../styles/SurveyModal.css";

// 8 preguntas — solo aparecen al regresar de offline
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
    <div className="survey-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          className={`star-btn ${value >= n ? "active" : ""}`}
          onClick={() => onChange(n)}
          aria-label={`${n} estrellas`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function SurveyModal() {
  const [visible, setVisible]   = useState(false);
  const [answers, setAnswers]   = useState({});
  const [step, setStep]         = useState(0);
  const [sending, setSending]   = useState(false);
  const transitionRef           = useRef(null);
  const alreadyChecked          = useRef(false);

  // Verifica si este usuario ya respondió
  const hasResponded = async (uid) => {
    try {
      const snap = await getDoc(doc(db, "survey_completed", uid));
      return snap.exists();
    } catch {
      return false;
    }
  };

  useEffect(() => {
    onModeChangeRef.current = async ({ from, to }) => {
      // Solo cuando regresa de offline
      if (from !== "offline") return;
      // Solo verificar una vez por sesión
      if (alreadyChecked.current) return;
      alreadyChecked.current = true;

      const uid = auth.currentUser?.uid;
      if (!uid) return;

      // Si ya respondió, no mostrar nada
      const responded = await hasResponded(uid);
      if (responded) {
        console.log("✅ Usuario ya respondió la encuesta");
        return;
      }

      transitionRef.current = `${from}→${to}`;
      setAnswers({});
      setStep(0);
      setVisible(true);
      surveyOpenRef.current = true;
    };

    return () => {
      onModeChangeRef.current = null;
    };
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

    // Última pregunta — guardar respuestas y marcar usuario como completado
    setSending(true);
    const uid = auth.currentUser?.uid || "anonymous";
    try {
      // Guardar respuestas en survey_responses
      await addDoc(collection(db, "survey_responses"), {
        userId: uid,
        transition: transitionRef.current,
        answers,
        timestamp: serverTimestamp(),
      });

      // Marcar que este usuario ya respondió para no mostrarle de nuevo
      await setDoc(doc(db, "survey_completed", uid), {
        completedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Error guardando encuesta:", e);
    }
    setSending(false);
    handleClose();
  };

  const handleClose = () => {
    setVisible(false);
    surveyOpenRef.current = false;
  };

  if (!visible || !current) return null;

  return (
    <div className="survey-overlay" onClick={handleClose}>
      <div className="survey-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="survey-header">
          <span className="survey-badge">📋 Cuéntanos tu experiencia</span>
          <button className="survey-close" onClick={handleClose}>×</button>
        </div>

        {/* Progreso */}
        <div className="survey-progress">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={`survey-dot ${i <= step ? "done" : ""}`} />
          ))}
        </div>

        <p className="survey-counter">{step + 1} de {QUESTIONS.length}</p>

        {/* Pregunta */}
        <p className="survey-question">{current.text}</p>

        {/* Opciones */}
        {current.type === "options" && (
          <div className="survey-options">
            {current.options.map((opt) => (
              <button
                key={opt}
                className={`survey-option ${answers[current.id] === opt ? "selected" : ""}`}
                onClick={() => handleAnswer(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Estrellas */}
        {current.type === "stars" && (
          <Stars
            value={answers[current.id] || 0}
            onChange={(val) => handleAnswer(val)}
          />
        )}

        {/* Botón siguiente */}
        <button
          className="survey-next"
          onClick={handleNext}
          disabled={!canNext || sending}
        >
          {sending
            ? "Guardando..."
            : step < QUESTIONS.length - 1
            ? "Siguiente →"
            : "Enviar ✓"}
        </button>

      </div>
    </div>
  );
}