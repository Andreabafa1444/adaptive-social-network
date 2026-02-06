import { Link, useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";

function Navbar() {
  const navigate = useNavigate();

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav style={{ marginBottom: "1rem" }}>
      <Link to="/feed">Feed</Link> |{" "}
      <Link to="/saved">Guardados</Link> |{" "}
      <button onClick={logout}>Cerrar sesión</button>
    </nav>
  );
}

export default Navbar;
