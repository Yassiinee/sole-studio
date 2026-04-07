import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Camera, Wand2, Zap, ArrowRight, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans overflow-hidden selection:bg-orange-500/30">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[150px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Camera size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              SoleStudio <span className="font-light text-white/60">Pro</span>
            </span>
          </div>
          <div className="flex items-center">
            <Link
              to="/auth"
              className="hidden sm:inline-block text-sm font-medium hover:text-white text-white/70 transition-colors mr-6"
            >
              Sign In
            </Link>
            <Link
              to="/auth"
              className="bg-white text-black px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)] whitespace-nowrap"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 lg:pt-48 lg:pb-32 flex flex-col items-center text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl flex flex-col items-center"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm"
          >
            <Zap size={14} className="text-orange-400" />
            <span className="text-xs font-medium tracking-wide text-white/80 uppercase">
              Powered by AI Background Segmentation & Canvas Compositing
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.05] mb-8"
          >
            Studio Quality. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500">
              Zero Studio Time.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-12 leading-relaxed"
          >
            Upload amateur shoe photos. Our AI surgically extracts your shoe
            with pixel-perfect accuracy and composites it onto a flawless 4K
            studio sweep with realistic physics-based shadows.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link
              to="/auth"
              className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white px-8 py-4 rounded-full text-base font-semibold hover:scale-105 transition-all shadow-[0_0_40px_rgba(249,115,22,0.3)]"
            >
              Start Creating Free
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="grid md:grid-cols-3 gap-6 mt-32 max-w-5xl w-full text-left"
        >
          {[
            {
              icon: Wand2,
              title: "Exact Details",
              desc: "100% of your shoe's original pixels are preserved. We only intelligently strip the background and inject studio gradients and shadows.",
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              desc: "Powered by WebAssembly-based background removal running entirely in your browser. Near instant studio renders for free.",
            },
            {
              icon: ShieldCheck,
              title: "Enterprise Grade",
              desc: "Secure authentication powered by Supabase. Your sessions and generated data are handled with best-in-class security.",
            },
          ].map((feat, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors cursor-default"
            >
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <feat.icon size={24} className="text-white/80" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
              <p className="text-neutral-400 leading-relaxed text-sm">
                {feat.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer minimal */}
      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-white/30 text-sm">
        <p>© 2026 SoleStudio Pro. A concept application.</p>
      </footer>
    </div>
  );
}
