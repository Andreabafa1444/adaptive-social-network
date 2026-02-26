import { useState } from "react";
import "../styles/Welcomemodal.css";

export default function WelcomeModal() {
  const [visible, setVisible] = useState(true);
  const [step, setStep] = useState(0);

  if (!visible) return null;

  const steps = [
    {
      emoji: "👋",
      title: "Bienvenido a Adaptive",
      body: "Estás usando la primera versión de una red social diseñada para adaptarse a tu conexión a internet. Esta app es parte de una investigación de tesis sobre experiencia de usuario.",
    },
    {
      emoji: "📱",
      title: "¿Qué puedes hacer aquí?",
      body: null,
      features: [
        { icon: "✍️", label: "Crear posts y comentar" },
        { icon: "❤️", label: "Doble tap para dar like" },
        { icon: "🔖", label: "Guardar contenido favorito" },
        { icon: "🔍", label: "Explorar tendencias" },
        { icon: "📰", label: "Ver noticias en tiempo real" },
      ],
    },
    {
      emoji: "🧪",
      title: "Tu misión de hoy",
      body: null,
      steps: [
        { n: "1", text: "Navega la app con internet unos dos minutos para que veas cambios" },
        { n: "2", text: "Importante desactiva ambos: tu WiFi y datos para ver el modo offline" },
        { n: "3", text: "Vuelve a conectarte cuando quieras" },
        { n: "4", text: "Al reconectarte te haremos unas preguntas rápidas" },
      ],
      note: "La app cambiará su interfaz automáticamente según tu conexión. ¡Eso es lo que queremos que experimentes!",
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="welcome-overlay">
      <div className="welcome-modal">

        <div className="welcome-emoji">{current.emoji}</div>
        <h2 className="welcome-title">{current.title}</h2>

        {current.body && (
          <p className="welcome-body">{current.body}</p>
        )}

        {current.features && (
          <ul className="welcome-features">
            {current.features.map((f) => (
              <li key={f.label}>
                <span className="feature-icon">{f.icon}</span>
                <span>{f.label}</span>
              </li>
            ))}
          </ul>
        )}

        {current.steps && (
          <>
            <ol className="welcome-steps">
              {current.steps.map((s) => (
                <li key={s.n}>
                  <span className="step-num">{s.n}</span>
                  <span>{s.text}</span>
                </li>
              ))}
            </ol>
            <p className="welcome-note">{current.note}</p>
          </>
        )}

        {/* Puntos de progreso */}
        <div className="welcome-dots">
          {steps.map((_, i) => (
            <span key={i} className={`welcome-dot ${i === step ? "active" : ""}`} />
          ))}
        </div>

        <button
          className="welcome-btn"
          onClick={() => isLast ? setVisible(false) : setStep(s => s + 1)}
        >
          {isLast ? "¡Entendido, a explorar! 🚀" : "Siguiente →"}
        </button>

      </div>
    </div>
  );
}