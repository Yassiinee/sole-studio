import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AuthGuard from "./components/AuthGuard";
import LandingPage from "./pages/LandingPage";
import StudioApp from "./pages/StudioApp";
import AuthPage from "./pages/AuthPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<AuthGuard />}>
          <Route path="/app" element={<StudioApp />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
