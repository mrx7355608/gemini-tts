"use client";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";
import {
  Mic2,
  Download,
  PlayCircle,
  Loader2,
  AlertTriangle,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useState } from "react";
import SpeechSettings from "../components/SpeechSettings";
import TaskStatus from "../components/TaskStatus";
import { validateInputs } from "@/lib/validateInputs";
import { createClient } from "@/lib/supabase/client";
import { IHistoryData } from "@/lib/types";
import { logError } from "@/lib/errorLogger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

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
  const [isDownloading, setIsDownloading] = useState(false);

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
        const error = await response.json();
        setError(error.error || "Error generating audio");
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
    setIsDownloading(true);
    fetch(audioURL)
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = "gemini_tts.mp3";
        a.click();
        URL.revokeObjectURL(blobUrl);
        setIsDownloading(false);
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
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl">
          <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
            {/* Main Content Card */}
            <Card className="flex-1 border shadow-xl rounded-2xl pt-0">
              <CardHeader className="p-6 pb-0 mt-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Mic2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Generate Speech</h1>
                    <p className="text-gray-500 text-sm mt-1">
                      Transform your text into natural-sounding audio
                    </p>
                  </div>
                </div>
              </CardHeader>

              <Separator className="my-0" />

              <CardContent className="p-6 space-y-6 pt-2">
                {/* Error Message */}
                {error && (
                  <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700 font-medium">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Style Instructions */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-green-500" />
                    Style Instructions
                  </Label>
                  <Input
                    type="text"
                    value={styleInstructions}
                    onChange={(e) => setStyleInstructions(e.target.value)}
                    placeholder="Read aloud in a warm and friendly tone:"
                    className="h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500/20 transition-all duration-200"
                  />
                </div>

                {/* Text Input */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-green-500" />
                    Text Content
                  </Label>
                  <div className="relative">
                    <Textarea
                      placeholder="Start writing or paste text here to generate speech..."
                      className="min-h-[200px] resize-none border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200 text-base leading-relaxed"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                  </div>
                </div>

                {/* Text length indicator */}
                <div className="flex justify-end items-center gap-2">
                  {text.length > 30000 ? (
                    <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      You are generating 30+ minutes of audio
                    </span>
                  ) : text.length > 20000 ? (
                    <span className="text-xs text-yellow-600 font-medium bg-yellow-50 px-2 py-1 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      You are generating 20+ minutes of audio
                    </span>
                  ) : null}
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {text.length}/30,000
                  </span>
                </div>

                {/* Audio Player & Controls */}
                {audioURL && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <audio
                          className="w-full rounded-lg bg-white shadow-sm"
                          controls
                          autoPlay
                        >
                          <source src={audioURL} type="audio/mpeg" />
                        </audio>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isDownloading}
                        onClick={downloadFileFromUrl}
                        className="cursor-pointer shrink-0"
                      >
                        {isDownloading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        {isDownloading ? "Downloading..." : "Download"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleRun}
                    disabled={loading}
                    size="lg"
                    className="bg-emerald-600 cursor-pointer hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-5 h-5 mr-2" />
                        Generate Audio
                      </>
                    )}
                  </Button>
                </div>

                {/* Task Status */}
                {loading && handleObj.publicAccessToken && (
                  <TaskStatus
                    handleObj={handleObj}
                    handleComplete={onComplete}
                    handleError={(errorMessage: string) => {
                      setError(errorMessage);
                      setTimeout(() => setError(""), 5000);
                      setLoading(false);
                    }}
                  />
                )}
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="xl:w-80">
              <SpeechSettings
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                selectedVoice={selectedVoice}
                setSelectedVoice={setSelectedVoice}
                temperature={temperature}
                setTemperature={setTemperature}
              />
            </div>
          </div>
        </div>
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
      await logError(error, "Supabase - Add History");
      console.error(error);
      return;
    }

    return;
  }
}
