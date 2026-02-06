import { useState } from "react";
import { auth } from "../services/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      navigate("/feed");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{isRegister ? "Registrarse" : "Iniciar sesión"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />
        <button type="submit">
          {isRegister ? "Crear cuenta" : "Entrar"}
        </button>
      </form>

      <br />

      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister
          ? "¿Ya tienes cuenta? Inicia sesión"
          : "¿No tienes cuenta? Regístrate"}
      </button>
    </div>
  );
}

export default Login;
