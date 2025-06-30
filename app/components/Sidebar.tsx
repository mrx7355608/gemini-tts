"use client";
import { X, ChevronLeft } from "lucide-react";

const VOICE_OPTIONS = [
  { name: "Zephyr", desc: "Bright" },
  { name: "Puck", desc: "Upbeat" },
  { name: "Charon", desc: "Informative" },
  { name: "Kore", desc: "Firm" },
  { name: "Fenrir", desc: "Excitable" },
  { name: "Leda", desc: "Youthful" },
  { name: "Orus", desc: "Firm" },
  { name: "Aoede", desc: "Breezy" },
  { name: "Callirrhoe", desc: "Easy-going" },
  { name: "Autonoe", desc: "Bright" },
  { name: "Enceladus", desc: "Breathy" },
  { name: "Iapetus", desc: "Clear" },
  { name: "Umbriel", desc: "Easy-going" },
  { name: "Algieba", desc: "Smooth" },
  { name: "Despina", desc: "Smooth" },
  { name: "Erinome", desc: "Clear" },
  { name: "Algenib", desc: "Gravelly" },
  { name: "Rasalgethi", desc: "Informative" },
  { name: "Laomedeia", desc: "Upbeat" },
  { name: "Achernar", desc: "Soft" },
  { name: "Alnilam", desc: "Firm" },
  { name: "Schedar", desc: "Even" },
  { name: "Gacrux", desc: "Mature" },
  { name: "Pulcherrima", desc: "Forward" },
  { name: "Achird", desc: "Friendly" },
  { name: "Zubenelgenubi", desc: "Casual" },
  { name: "Vindemiatrix", desc: "Gentle" },
  { name: "Sadachbia", desc: "Lively" },
  { name: "Sadaltager", desc: "Knowledgeable" },
  { name: "Sulafat", desc: "Warm" },
];

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  selectedModel,
  setSelectedModel,
  selectedVoice,
  setSelectedVoice,
  temperature,
  setTemperature,
}: SidebarProps) {
  return (
    <div
      className={`relative flex-shrink-0 mt-8 lg:mt-0 transition-all duration-300 ease-in-out ${
        sidebarOpen ? "w-80" : "w-0"
      } overflow-visible`}
    >
      {/* Sidebar content */}
      <div
        className={`bg-white rounded-2xl shadow-md h-full border border-gray-100 p-6 flex flex-col gap-6 sticky top-8 transition-all duration-300 ease-in-out
          ${
            sidebarOpen
              ? "opacity-100 w-80"
              : "opacity-0 w-0 p-0 overflow-hidden border-0"
          }
        `}
      >
        {/* Close (X) button */}
        <button
          className="absolute top-4 right-4 cursor-pointer z-20 hover:bg-gray-100 rounded-full p-1.5 transition-colors"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
          type="button"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <div className="text-gray-700 font-semibold text-lg mb-2">
          Run settings
        </div>
        {/* Model dropdown */}
        <div className="mb-4">
          <label className="block text-gray-600 text-sm mb-1">Model</label>
          <div className="relative">
            <select
              className="appearance-none w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all shadow-sm hover:bg-gray-100 focus:bg-white"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              <option>Gemini 2.5 Pro Preview TTS</option>
              <option>Gemini 2.5 Flash Preview TTS</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <path
                  d="M6 8l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
        {/* Model Settings: Temperature slider */}
        <div className="mb-4">
          <div className="font-semibold text-gray-700 mb-2">Model Settings</div>
          <label
            htmlFor="temperature"
            className="block text-gray-600 text-sm mb-1"
          >
            Temperature:{" "}
            <span className="font-semibold text-orange-600">{temperature}</span>
          </label>
          <input
            id="temperature"
            type="range"
            min={0}
            max={2}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full accent-orange-500 h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>2</span>
          </div>
        </div>
        {/* Voice dropdown */}
        <div className="mb-4">
          <label className="block text-gray-600 text-sm mb-1">Voice</label>
          <div className="relative">
            <select
              className="appearance-none w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all shadow-sm hover:bg-gray-100 focus:bg-white"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
            >
              {VOICE_OPTIONS.map((voice) => (
                <option key={voice.name}>{voice.name}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <path
                  d="M6 8l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
      {/* Floating expand button when sidebar is closed */}
      {!sidebarOpen && (
        <button
          className="fixed bottom-8 right-8 z-40 bg-white border border-gray-200 rounded-full shadow p-2 hover:bg-orange-50 transition-colors lg:flex hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Expand sidebar"
          type="button"
        >
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </button>
      )}
    </div>
  );
}
