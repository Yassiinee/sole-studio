import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const checkKeys = import.meta.env.VITE_SUPABASE_URL;
    if (!checkKeys) {
      setError("Waiting for VITE_SUPABASE_URL to be configured in .env");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/app");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setError("Success! Please check your email to verify your account.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden relative selection:bg-orange-500/30">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-orange-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
          <Camera size={32} className="text-white" />
        </div>

        <motion.div
          layout
          className="bg-white/5 border border-white/10 p-8 rounded-3xl w-full backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-white/40 text-sm">
              {isLogin
                ? "Sign in to SoleStudio Pro"
                : "Start rendering 4K studio shoes"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4 relative">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-3 rounded-xl flex items-start gap-3 text-sm ${error.includes("Success") ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 block">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 pl-11 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium"
                  placeholder="name@example.com"
                  required
                />
                <Mail
                  size={18}
                  className="absolute left-4 top-3.5 text-white/40"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 block">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 pl-11 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <Lock
                  size={18}
                  className="absolute left-4 top-3.5 text-white/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-white text-black hover:bg-neutral-200 transition-colors py-3.5 rounded-xl font-bold flex items-center justify-center disabled:opacity-70"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setPassword("");
              }}
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.div>

        <button
          onClick={() => navigate("/")}
          className="mt-8 text-white/40 text-sm hover:text-white transition-colors"
        >
          &larr; Back to home
        </button>
      </div>
    </div>
  );
}
