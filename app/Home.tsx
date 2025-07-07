"use client";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import { Mic2, Download, PlayCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import TaskStatus from "./components/TaskStatus";
import { validateInputs } from "@/lib/validateInputs";
import { createClient } from "@/lib/supabase/client";
import { IHistoryData } from "@/lib/types";

export default function HomePage() {
  useAuth();
  const [selectedVoice, setSelectedVoice] = useState("zephyr");
  const [temperature, setTemperature] = useState(1);
  const [text, setText] = useState("");
  const [audioURL, setAudioURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [handleObj, setHandleObj] = useState({
    publicAccessToken: "",
    id: "",
    taskIdentifier: "",
  });
  const [styleInstructions, setStyleInstructions] = useState(
    "Read aloud in a warm and friendly tone:"
  );
  const [selectedModel, setSelectedModel] = useState(
    "gemini-2.5-flash-preview-tts"
  );
  const [error, setError] = useState("");

  const handleRun = async () => {
    try {
      // If already running, return
      if (loading) {
        return;
      }

      setAudioURL("");
      setError("");
      setLoading(true);
      setHandleObj({
        publicAccessToken: "",
        id: "",
        taskIdentifier: "",
      });

      // Validate inputs
      const validationError = validateInputs(
        text,
        selectedModel,
        selectedVoice,
        temperature,
        styleInstructions
      );

      if (validationError) {
        setLoading(false);
        setError(validationError);
        setTimeout(() => setError(""), 5000);
        return;
      }

      // Make API call
      const response = await fetch("/api/generate-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          styleInstructions: styleInstructions,
          model: selectedModel,
          voice: selectedVoice,
          temperature: temperature,
        }),
      });

      if (!response.ok) {
        setLoading(false);
        setError("Error generating audio");
        console.error(await response.json());
        setTimeout(() => setError(""), 5000);
        return;
      }

      const result = await response.json();
      setHandleObj(result);
    } catch (err) {
      setError("Internal server error");
      console.error(err);
      setLoading(false);
      setTimeout(() => setError(""), 5000);
    }
  };

  function downloadFileFromUrl() {
    fetch(audioURL)
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = "gemini_tts.mp3";
        a.click();
        URL.revokeObjectURL(blobUrl);
      });
  }

  const onComplete = async (url: string | undefined) => {
    setLoading(false);
    setAudioURL(url || "");
    await addHistory({
      prompt: text,
      style_instruction: styleInstructions,
      voice: selectedVoice,
      tts_model: selectedModel,
      temperature: temperature,
      audio_clip: url || "",
    });
  };

  return (
    <ProtectedRoute>
      <div className="bg-gray-50 flex flex-col lg:flex-row items-start justify-center p-6 gap-4">
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

          {/* Error Message */}
          {error && (
            <p className="bg-red-50 rounded-lg mx-6 font-medium p-4 text-red-600">
              {error}
            </p>
          )}

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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:bg-white outline-none transition-all"
              />
            </div>

            {/* Text */}
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-semibold">
                Text
              </label>
              <textarea
                placeholder="Start writing or paste text here to generate speech"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:bg-white outline-none transition-all resize-none"
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          </div>

          {/* Divdier */}
          <div className="h-px bg-gray-200 mt-8"></div>

          {/* Bottom section */}
          <div className="flex justify-between items-center p-6">
            {audioURL && (
              <div className="flex items-center gap-2">
                {/* Audio player */}
                <audio className="bg-blue-800 rounded-lg" controls autoPlay>
                  <source src={audioURL} type="audio/mpeg" />
                </audio>

                {/* Download audio button */}
                <button
                  className="border-1 border-gray-800  hover:bg-gray-200 cursor-pointer px-6 py-2 rounded-full transition-all"
                  onClick={downloadFileFromUrl}
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* An empty div to prevent layout shift */}
            {!audioURL && <div></div>}

            {/* Run button */}
            <button
              onClick={handleRun}
              disabled={loading}
              className="px-7 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-full shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-500 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <PlayCircle className="w-5 h-5" />
              )}
              <span className="font-bold text-lg mr-2">
                {loading ? "Running..." : "Run"}
              </span>
            </button>

            {/* Subscribes to task status and updates audio URL on task completion */}
            {loading && handleObj.publicAccessToken && (
              <TaskStatus
                handleObj={handleObj}
                handleComplete={onComplete}
                handleError={console.error}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar
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

  async function addHistory(history: IHistoryData) {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      console.error("No user found");
      return;
    }

    const { error } = await supabase.from("history").insert({
      user_id: data.user.id,
      ...history,
    });

    if (error) {
      console.error(error);
      return;
    }

    return;
  }
}
