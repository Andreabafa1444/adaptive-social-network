import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import "../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-wrapper">
      <div className="navbar-container">

        {/* Logo / Brand */}
        <div className="navbar-left">
          <Link to="/feed" className="navbar-logo">
            Adaptive
          </Link>
        </div>

        {/* Links — escritorio: texto / móvil vertical: iconos */}
        <nav className="navbar-center">
          <Link to="/feed" className={isActive("/feed") ? "nav-active" : ""}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span>Feed</span>
          </Link>

          <Link to="/explore" className={isActive("/explore") ? "nav-active" : ""}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <span>Explorar</span>
          </Link>

          <Link to="/saved" className={isActive("/saved") ? "nav-active" : ""}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
            </svg>
            <span>Guardados</span>
          </Link>

          <Link to="/news" className={isActive("/news") ? "nav-active" : ""}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z"/>
            </svg>
            <span>Noticias</span>
          </Link>
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