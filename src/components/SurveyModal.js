import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import "../styles/SurveyModal.css";

const INTERVAL_MS = 60_000; // cada 60 segundos

export default function SurveyModal() {
  const [visible, setVisible] = useState(false);
  const navigate  = useNavigate();
  const timerRef  = useRef(null);

  const checkAndShow = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      const snap = await getDoc(doc(db, "survey_completed", uid));
      if (snap.exists()) {
        // Ya respondió, nunca más mostrar
        clearInterval(timerRef.current);
        return;
      }
    } catch {}
    setVisible(true);
  };

  useEffect(() => {
    timerRef.current = setInterval(checkAndShow, INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleGo = () => {
    setVisible(false);
    clearInterval(timerRef.current);
    navigate("/feedback");
  };

  const handleDismiss = () => {
    setVisible(false);
    // El intervalo sigue corriendo, volverá a aparecer al siguiente minuto
  };

  if (!visible) return null;

  return (
    <div className="survey-toast">
      <div className="toast-icon">📋</div>
      <div className="toast-body">
        <p className="toast-title">¿Ya probaste los 3 modos?</p>
        <p className="toast-sub">Cuéntanos tu experiencia, solo toma 1 min.</p>
      </div>
      <div className="toast-actions">
        <button className="toast-btn-go" onClick={handleGo}>Responder</button>
        <button className="toast-btn-close" onClick={handleDismiss}>×</button>
      </div>
    </div>
  );
}