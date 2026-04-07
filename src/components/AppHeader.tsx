import React, { useState, useRef, useEffect } from "react";
import { Camera, LogOut, User as UserIcon } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface AppHeaderProps {
  onReset: () => void;
}

export default function AppHeader({ onReset }: AppHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Get first letter of email for avatar
  const initial = user?.email ? user.email.charAt(0).toUpperCase() : "U";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-black/6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
            <Camera size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-lg leading-none tracking-tight">
              SoleStudio <span className="text-black/30 font-normal">Pro</span>
            </p>
            <p className="hidden sm:block text-[9px] font-bold uppercase tracking-[0.22em] text-black/30 mt-0.5">
              Groq Vision · FLUX.1-schnell · 4K Studio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onReset}
              className="text-xs font-semibold text-black/35 hover:text-black border border-black/10 rounded-xl px-3 py-1.5 transition-colors"
            >
              Start Over
            </button>
          </div>

          {/* Vertical Divider */}
          <div className="w-px h-6 bg-black/10" />

          {/* Profile Section */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-black">
                Active Session
              </span>
              <span className="text-[10px] font-medium text-black/40 truncate max-w-[120px]">
                {user?.email || "Guest User"}
              </span>
            </div>

            <div 
              className="relative cursor-pointer" 
              ref={dropdownRef} 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(249,115,22,0.2)] border-2 border-white">
                {initial}
              </div>

              {/* Dropdown Menu (Click-Based for Mobile) */}
              <div 
                className={`absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-black/5 transition-all duration-200 transform origin-top-right flex flex-col overflow-hidden ${
                  isDropdownOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'
                }`}
              >
                <div className="px-4 py-3 border-b border-black/5 bg-black/[0.02]">
                  <p className="text-xs font-bold text-black truncate">
                    {user?.email}
                  </p>
                  <p className="text-[10px] text-green-600 font-semibold mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Online
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-3 text-xs font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-2 text-left"
                >
                  <LogOut size={14} />
                  Sign Out of Device
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
