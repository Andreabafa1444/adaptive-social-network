import { useState } from "react";
import { auth } from "../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/feed");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-wrapper">

      {/* Imagen sección */}
      <div className="login-image-section">
        <img src="/images/Login.jpg" alt="Login" />
      </div>

      {/* Card */}
      <div className="login-card-container">
        <div className="login-card p-5">
          <h3 className="mb-4">Bienvenida</h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="email"
                className="form-control rounded-3"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <input
                type="password"
                className="form-control rounded-3"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="btn btn-dark w-100 rounded-3">
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-4">
            ¿No tienes cuenta?{" "}
            <Link to="/register">Crear cuenta</Link>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Login;
