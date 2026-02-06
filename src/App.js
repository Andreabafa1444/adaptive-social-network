import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";

import Login from "./pages/Login";
import FeedPage from "./pages/FeedPage";
import Saved from "./pages/Saved";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Cargando sesión...</p>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/feed" />}
        />

        <Route
          path="/feed"
          element={user ? <FeedPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/saved"
          element={user ? <Saved /> : <Navigate to="/login" />}
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
