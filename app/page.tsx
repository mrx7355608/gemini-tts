"use client";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import { PlayCircle, Mic2 } from "lucide-react";
import { useState } from "react";
import Sidebar from "./components/Sidebar";

export default function HomePage() {
  useAuth(); // Only to ensure auth context is loaded
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState("Zephyr");
  const [temperature, setTemperature] = useState(1);
  const [text, setText] = useState("");
  const [audioURL, setAudioURL] = useState("");
  // const [isRunning, setIsRunning] = useState(false);
  const [styleInstructions, setStyleInstructions] = useState(
    "Read aloud in a warm and friendly tone:"
  );
  const [selectedModel, setSelectedModel] = useState(
    "Gemini 2.5 Flash Preview TTS"
  );

  const handleRun = async () => {
    console.log("Prompt: ", text);
    console.log("Voice: ", selectedVoice.toLowerCase());
    console.log("Temperature: ", temperature);
    console.log("Model: ", selectedModel.toLowerCase().replaceAll(" ", "-"));
    console.log("Style Instructions: ", styleInstructions);

    const response = await fetch("/api/generate-audio", {
      method: "POST",
      body: JSON.stringify({
        text,
        voice: selectedVoice.toLowerCase(),
        temperature,
        model: selectedModel.toLowerCase().replaceAll(" ", "-"),
        styleInstructions,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const audioBuffer = await response.blob();
    const audioUrl = URL.createObjectURL(audioBuffer);
    setAudioURL(audioUrl);
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = "tts.wav";
    a.click();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row items-start justify-center p-6 gap-4">
        {/* Main Card */}
        <div className="shadow-sm bg-white rounded-xl flex-1 w-full">
          {/* Breadcrumb */}
          <div className="text-gray-400 mb-2 flex items-center p-8 pb-4">
            <Mic2 className="w-6 h-6 mr-2" color="black" />
            <span className="text-gray-800 text-lg font-semibold">
              Generate speech
            </span>
          </div>

          {/* Divdier */}
          <div className="h-px bg-gray-200 mb-8"></div>

          {/* Style instructions */}
          <div className="flex m-6 flex-col gap-6 bg-gray-50 rounded-xl p-7 border border-gray-200">
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-semibold">
                Style instructions
              </label>
              <input
                type="text"
                value={styleInstructions}
                onChange={(e) => setStyleInstructions(e.target.value)}
                placeholder="Read aloud in a warm and friendly tone:"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:bg-white outline-none transition-all"
                defaultValue="Read aloud in a warm and friendly tone:"
              />
            </div>

            {/* Text */}
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-semibold">
                Text
              </label>
              <textarea
                placeholder="Start writing or paste text here to generate speech"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:bg-white outline-none transition-all resize-none"
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          </div>

          {/* Divdier */}
          <div className="h-px bg-gray-200 mt-8"></div>

          {/* Run Button */}
          <div className="flex justify-end items-center p-6">
            <audio id="audio" controls autoPlay>
              <source src={audioURL} type="audio/wav" />
            </audio>
            <button
              onClick={handleRun}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-full shadow transition-all"
            >
              <PlayCircle className="w-5 h-5" />
              <span className="font-bold mt-1 text-lg">Run</span>
              <span className="ml-1 text-xs bg-white/20 rounded px-2 py-0.5">
                Ctrl ↵
              </span>
            </button>
          </div>
        </div>
        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          temperature={temperature}
          setTemperature={setTemperature}
        />
      </div>
    </ProtectedRoute>
  );
}
