import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";
import CreatePostPage from "./pages/CreatePostPage";
import Explore from "./pages/Explore";
import News from "./pages/News";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FeedPage from "./pages/FeedPage";
import Saved from "./pages/Saved";
import Feedback from "./pages/Feedback";

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

  if (loading) return <p>Cargando sesión...</p>;

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/feed" />}
        />

        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/feed" />}
        />

        <Route
          path="/feed"
          element={user ? <FeedPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/saved"
          element={user ? <Saved /> : <Navigate to="/login" />}
        />

        <Route
          path="/feedback"
          element={user ? <Feedback /> : <Navigate to="/login" />}
        />

        <Route
          path="/explore"
          element={user ? <Explore /> : <Navigate to="/login" />}
        />

        <Route
          path="/news"
          element={user ? <News /> : <Navigate to="/login" />}
        />

        <Route path="*" element={<Navigate to="/login" />} />
        <Route
  path="/create"
  element={user ? <CreatePostPage /> : <Navigate to="/login" />}
/>


      </Routes>
    </BrowserRouter>
  );
}

export default App;
