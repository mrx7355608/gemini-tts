"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <nav className="w-full bg-white border-b border-gray-100 shadow-sm px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="text-xl font-bold text-green-500 tracking-tight select-none">
        Gemini TTS
      </div>
      <div className="relative" ref={menuRef}>
        <button
          className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-green-100 transition-colors focus:outline-none"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <User className="w-6 h-6 text-gray-700" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-40 animate-fade-in">
            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100 truncate">
              {user?.user_metadata.full_name || "User"}
            </div>
            <div className="hover:bg-gray-100 py-2 cursor-pointer w-full border-b border-gray-200">
              <Link
                href="/history"
                className="text-left px-4 py-2 text-sm text-gray-700 "
              >
                History
              </Link>
            </div>
            <button
              className="cursor-pointer w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-green-50 hover:text-green-600 transition-colors"
              onClick={signOut}
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
