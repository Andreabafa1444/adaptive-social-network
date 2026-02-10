import { useState } from "react";
import { db, auth } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Navbar from "../components/NavBar";

function Feedback() {
  const [form, setForm] = useState({
    overallExperience: "",
    connectivityImpact: "",
    progressiveLoading: "",
    functionalContinuity: "",
    adaptiveStrategies: [],
    pwaComparison: "",
    pwaAdvantages: [],
    pwaLimitations: [],
    digitalInclusionPotential: "",
    socialImpact: "",
    openComment: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (e) => {
    const { name, value, checked } = e.target;
    setForm({
      ...form,
      [name]: checked
        ? [...form[name], value]
        : form[name].filter(v => v !== value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await addDoc(collection(db, "feedback"), {
      userId: auth.currentUser.uid,
      networkType: navigator.connection?.effectiveType || "unknown",
      isOnline: navigator.onLine,
      ...form,
      createdAt: serverTimestamp()
    });

    alert("¡Gracias por tu retroalimentación!");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <Navbar />
      <h2>Evaluación de la experiencia</h2>

      <form onSubmit={handleSubmit}>
        <label>Experiencia general (1–5)</label>
        <input name="overallExperience" type="number" min="1" max="5" onChange={handleChange} />

        <label>Impacto de conectividad</label>
        <select name="connectivityImpact" onChange={handleChange}>
          <option value="">Selecciona</option>
          <option>Funcionó sin problemas</option>
          <option>Funcionó con retrasos</option>
          <option>Tuvo fallos</option>
          <option>No funcionó bien</option>
        </select>

        <label>¿La información cargó progresivamente?</label>
        <select name="progressiveLoading" onChange={handleChange}>
          <option>Si</option>
          <option>A veces</option>
          <option>No</option>
        </select>

        <label>Continuidad con mala red</label>
        <select name="functionalContinuity" onChange={handleChange}>
          <option>Usable</option>
          <option>Limitada</option>
          <option>Inusable</option>
        </select>

        <label>Estrategias útiles</label><br />
        <input type="checkbox" name="adaptiveStrategies" value="texto" onChange={handleCheckbox} /> Texto<br />
        <input type="checkbox" name="adaptiveStrategies" value="interfaz simple" onChange={handleCheckbox} /> Interfaz simple<br />
        <input type="checkbox" name="adaptiveStrategies" value="imagenes reducidas" onChange={handleCheckbox} /> Imágenes reducidas<br />

        <label>Comparación con apps nativas</label>
        <select name="pwaComparison" onChange={handleChange}>
          <option>Peor</option>
          <option>Similar</option>
          <option>Mejor</option>
        </select>

        <label>Ventajas PWA</label><br />
        <input type="checkbox" name="pwaAdvantages" value="no instalacion" onChange={handleCheckbox} /> No instalación<br />
        <input type="checkbox" name="pwaAdvantages" value="menos datos" onChange={handleCheckbox} /> Menor consumo de datos<br />

        <label>Limitaciones PWA</label><br />
        <input type="checkbox" name="pwaLimitations" value="menos fluida" onChange={handleCheckbox} /> Menos fluida<br />
        <input type="checkbox" name="pwaLimitations" value="problemas offline" onChange={handleCheckbox} /> Problemas offline<br />

        <label>¿Útil en zonas con mala conectividad?</label>
        <select name="digitalInclusionPotential" onChange={handleChange}>
          <option>Si</option>
          <option>No</option>
          <option>Tal vez</option>
        </select>

        <label>Comentario adicional</label>
        <textarea name="openComment" onChange={handleChange} />

        <button type="submit">Enviar feedback</button>
      </form>
    </div>
  );
}

export default Feedback;
