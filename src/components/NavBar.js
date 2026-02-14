import { Link, useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import "../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <header className="navbar-wrapper">
      <div className="navbar-container">

        {/* Logo / Brand */}
        <div className="navbar-left">
          <Link to="/feed" className="navbar-logo">
            Adaptive
          </Link>
        </div>

        {/* Links */}
        <nav className="navbar-center">
          <Link to="/feed">Feed</Link>
          <Link to="/explore">Explorar</Link>
          <Link to="/saved">Guardados</Link>
          <Link to="/news">Noticias</Link>
        </nav>

        {/* Actions */}
        <div className="navbar-right">
          <button className="navbar-btn" onClick={logout}>
            Cerrar sesión
          </button>
        </div>

      </div>
    </header>
  );
}

export default Navbar;
