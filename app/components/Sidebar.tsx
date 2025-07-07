"use client";
import { X, ChevronLeft } from "lucide-react";
import { useState } from "react";

const VOICE_OPTIONS = [
  { name: "Zephyr", desc: "Bright", gender: "female" },
  { name: "Puck", desc: "Upbeat", gender: "male" },
  { name: "Charon", desc: "Informative", gender: "male" },
  { name: "Kore", desc: "Firm", gender: "female" },
  { name: "Fenrir", desc: "Excitable", gender: "male" },
  { name: "Leda", desc: "Youthful", gender: "female" },
  { name: "Orus", desc: "Firm", gender: "male" },
  { name: "Aoede", desc: "Breezy", gender: "female" },
  { name: "Callirrhoe", desc: "Easy-going", gender: "female" },
  { name: "Autonoe", desc: "Bright", gender: "female" },
  { name: "Enceladus", desc: "Breathy", gender: "male" },
  { name: "Iapetus", desc: "Clear", gender: "male" },
  { name: "Umbriel", desc: "Easy-going", gender: "male" },
  { name: "Algieba", desc: "Smooth", gender: "male" },
  { name: "Despina", desc: "Smooth", gender: "female" },
  { name: "Erinome", desc: "Clear", gender: "female" },
  { name: "Algenib", desc: "Gravelly", gender: "male" },
  { name: "Rasalgethi", desc: "Informative", gender: "male" },
  { name: "Laomedeia", desc: "Upbeat", gender: "female" },
  { name: "Achernar", desc: "Soft", gender: "female" },
  { name: "Alnilam", desc: "Firm", gender: "male" },
  { name: "Schedar", desc: "Even", gender: "male" },
  { name: "Gacrux", desc: "Mature", gender: "female" },
  { name: "Pulcherrima", desc: "Forward", gender: "female" },
  { name: "Achird", desc: "Friendly", gender: "male" },
  { name: "Zubenelgenubi", desc: "Casual", gender: "male" },
  { name: "Vindemiatrix", desc: "Gentle", gender: "female" },
  { name: "Sadachbia", desc: "Lively", gender: "male" },
  { name: "Sadaltager", desc: "Knowledgeable", gender: "male" },
  { name: "Sulafat", desc: "Warm", gender: "female" },
];

interface SidebarProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
}

export default function Sidebar({
  selectedModel,
  setSelectedModel,
  selectedVoice,
  setSelectedVoice,
  temperature,
  setTemperature,
}: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [genderFilter, setGenderFilter] = useState<string>("all");

  // Filter voices based on gender selection
  const filteredVoices = VOICE_OPTIONS.filter((voice) => {
    if (genderFilter === "all") return true;
    return voice.gender === genderFilter;
  });

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
              className="appearance-none w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all shadow-sm hover:bg-gray-100 focus:bg-white"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              <option value="gemini-2.5-pro-preview-tts">
                Gemini 2.5 Pro Preview TTS
              </option>
              <option value="gemini-2.5-flash-preview-tts">
                Gemini 2.5 Flash Preview TTS
              </option>
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
        {/* Temperature slider */}
        <div className="mb-4">
          <div className="font-semibold text-gray-700 mb-2">Model Settings</div>
          <label
            htmlFor="temperature"
            className="block text-gray-600 text-sm mb-1"
          >
            Temperature:{" "}
            <span className="font-semibold text-green-600">{temperature}</span>
          </label>
          <input
            id="temperature"
            type="range"
            min={0}
            max={2}
            step={0.01}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full accent-green-500 h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>2</span>
          </div>
        </div>
        {/* Gender filter radio buttons */}
        <div className="mb-4">
          <label className="block text-gray-600 text-sm mb-2">Voice Gender</label>
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="genderFilter"
                value="all"
                checked={genderFilter === "all"}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-4 h-4 text-green-500 border-gray-300 focus:ring-green-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700">All Voices</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="genderFilter"
                value="male"
                checked={genderFilter === "male"}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-4 h-4 text-green-500 border-gray-300 focus:ring-green-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700">Male Voices</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="genderFilter"
                value="female"
                checked={genderFilter === "female"}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-4 h-4 text-green-500 border-gray-300 focus:ring-green-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700">Female Voices</span>
            </label>
          </div>
        </div>
        {/* Voice dropdown */}
        <div className="mb-4">
          <label className="block text-gray-600 text-sm mb-1">Voice</label>
          <div className="relative">
            <select
              className="appearance-none w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all shadow-sm hover:bg-gray-100 focus:bg-white"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
            >
              {filteredVoices.map((voice) => (
                <option key={voice.name} value={voice.name.toLowerCase()}>
                  {voice.name}
                </option>
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
          className="fixed bottom-8 right-8 z-40 bg-white border border-gray-200 rounded-full shadow p-2 hover:bg-green-50 transition-colors lg:flex hidden"
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
