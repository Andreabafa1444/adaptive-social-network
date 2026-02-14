import { useState } from "react";
import { auth, db } from "../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        createdAt: new Date(),
      });

      navigate("/feed");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-wrapper">

      <div className="login-image-section">
        <img src="/images/Register.jpg" alt="Register" />
      </div>

      <div className="login-card-container">
        <div className="login-card p-5">

          <h3 className="mb-4">Crear cuenta</h3>

          <form onSubmit={handleRegister}>
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
              Registrarse
            </button>
          </form>

          <div className="mt-4">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login">Iniciar sesión</Link>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Register;
