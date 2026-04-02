import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AuthGuard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-t-orange-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin mb-4" />
          <p className="text-white/50 text-sm">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
