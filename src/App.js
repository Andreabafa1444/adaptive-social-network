import React, { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";

const FeedPage       = lazy(() => import("./pages/FeedPage"));
const Explorar       = lazy(() => import("./pages/Explorar"));
const News           = lazy(() => import("./pages/News"));
const Login          = lazy(() => import("./pages/Login"));
const Register       = lazy(() => import("./pages/Register"));
const Saved          = lazy(() => import("./pages/Saved"));
const Feedback       = lazy(() => import("./pages/Feedback"));
const CreatePostPage = lazy(() => import("./pages/CreatePostPage"));
const WelcomeModal   = lazy(() => import("./components/WelcomeModal"));
const SurveyModal    = lazy(() => import("./components/SurveyModal"));

// ✅ Componente protector — espera a que Firebase confirme la sesión
function PrivateRoute({ user, loading, children }) {

  if (loading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px"
      }}>
        Cargando...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;

}

// ✅ Componente para rutas públicas (login/register) — espera sesión antes de redirigir
function PublicRoute({ user, loading, children }) {

  if (loading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px"
      }}>
        Cargando...
      </div>
    );
  }

  if (user) return <Navigate to="/feed" replace />;

  return children;

}

function App() {

  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();

  }, []);


  return (

    <BrowserRouter>

      <Suspense fallback={
        <div style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px"
        }}>
          Cargando página...
        </div>
      }>

        <Routes>

          {/* Rutas públicas */}
          <Route
            path="/login"
            element={
              <PublicRoute user={user} loading={loading}>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute user={user} loading={loading}>
                <Register />
              </PublicRoute>
            }
          />

          {/* Rutas privadas */}
          <Route
            path="/feed"
            element={
              <PrivateRoute user={user} loading={loading}>
                <FeedPage user={user} loading={loading} />
              </PrivateRoute>
            }
          />

          <Route
            path="/explore"
            element={
              <PrivateRoute user={user} loading={loading}>
                <Explorar />
              </PrivateRoute>
            }
          />

          <Route
            path="/news"
            element={
              <PrivateRoute user={user} loading={loading}>
                <News />
              </PrivateRoute>
            }
          />

          <Route
            path="/saved"
            element={
              <PrivateRoute user={user} loading={loading}>
                <Saved />
              </PrivateRoute>
            }
          />

          <Route
            path="/feedback"
            element={
              <PrivateRoute user={user} loading={loading}>
                <Feedback />
              </PrivateRoute>
            }
          />

          <Route
            path="/create"
            element={
              <PrivateRoute user={user} loading={loading}>
                <CreatePostPage />
              </PrivateRoute>
            }
          />

          {/* Cualquier ruta desconocida → login */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>

        {/* Modales globales solo si hay sesión */}
        {user && (
          <Suspense fallback={null}>
            <WelcomeModal />
          </Suspense>
        )}

        {user && (
          <Suspense fallback={null}>
            <SurveyModal />
          </Suspense>
        )}

      </Suspense>

    </BrowserRouter>

  );

}

export default App;