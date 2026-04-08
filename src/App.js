import React, { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";
import 'bootstrap/dist/css/bootstrap.min.css';


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

function PrivateRoute({ user, authChecked, children }) {
  if (!authChecked) {
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

function PublicRoute({ user, authChecked, children }) {
  if (!authChecked) {
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
  const [user, setUser]           = useState(null);
  const [authChecked, setAuthChecked] = useState(false); // ← antes era loading:true

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser ?? null);
      setAuthChecked(true); // ← la UI ya puede decidir qué mostrar
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
          <Route
            path="/login"
            element={
              <PublicRoute user={user} authChecked={authChecked}>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute user={user} authChecked={authChecked}>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/feed"
            element={
              <PrivateRoute user={user} authChecked={authChecked}>
                <FeedPage user={user} loading={!authChecked} />
              </PrivateRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <PrivateRoute user={user} authChecked={authChecked}>
                <Explorar />
              </PrivateRoute>
            }
          />
          <Route
            path="/news"
            element={
              <PrivateRoute user={user} authChecked={authChecked}>
                <News />
              </PrivateRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <PrivateRoute user={user} authChecked={authChecked}>
                <Saved />
              </PrivateRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <PrivateRoute user={user} authChecked={authChecked}>
                <Feedback />
              </PrivateRoute>
            }
          />
          <Route
            path="/create"
            element={
              <PrivateRoute user={user} authChecked={authChecked}>
                <CreatePostPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

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