"use client";

import { HistoryItem } from "@/lib/types";
import { Play, Download, Loader2, StopCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function HistoryTable({
  historyData,
}: {
  historyData: HistoryItem[];
}) {
  const [downloadingIds, setDownloadingIds] = useState<string[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(historyData);

  // Search and filter states
  const [search, setSearch] = useState("");
  const [modelFilter, setModelFilter] = useState("all");
  const [voiceFilter, setVoiceFilter] = useState("all");

  // Unique models and voices for filter dropdowns
  const models = Array.from(new Set(historyData.map((item) => item.tts_model)));
  const voices = Array.from(new Set(historyData.map((item) => item.voice)));

  const playAudio = (id: string, audioClip: string) => {
    if (playingId === id && audio) {
      audio.pause();
      audio.currentTime = 0;
      setPlayingId(null);
      setAudio(null);
      return;
    }

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setPlayingId(null);
      setAudio(null);
    }

    setPlayingId(id);
    const newAudioClip = new Audio(audioClip);
    newAudioClip.play();
    setAudio(newAudioClip);

    newAudioClip.onended = () => {
      setPlayingId(null);
      setAudio(null);
    };
  };

  const downloadFileFromUrl = (
    audioURL: string,
    filename: string,
    id: string
  ) => {
    setDownloadingIds((prev) => [...prev, id]);
    fetch(audioURL)
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(blobUrl);
        setDownloadingIds((prev) => prev.filter((id) => id !== id));
      });
  };

  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Filtered history
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      !search ||
      item.prompt.toLowerCase().includes(search.toLowerCase()) ||
      (item.style_instruction &&
        item.style_instruction.toLowerCase().includes(search.toLowerCase()));
    const matchesModel =
      modelFilter === "all" || item.tts_model === modelFilter;
    const matchesVoice = voiceFilter === "all" || item.voice === voiceFilter;
    return matchesSearch && matchesModel && matchesVoice;
  });

  useEffect(() => {
    setHistory(historyData);
  }, [historyData]);

  return (
    <div>
      {/* Search and Filters */}
      <div className="p-2 flex flex-col md:flex-row md:items-center gap-3 mb-4 h-full">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompt or style..."
            className="pl-10 h-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
          />
        </div>
        <Select value={modelFilter} onValueChange={setModelFilter}>
          <SelectTrigger className="w-full md:w-48 h-10 border-gray-200 focus:border-gray-500 focus:ring-gray-500">
            <SelectValue placeholder="Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Models</SelectItem>
            {models.map((model) => (
              <SelectItem key={model} value={model}>
                {model === "gemini-2.5-flash-preview-tts"
                  ? "Gemini 2.5 Flash Preview TTS"
                  : "Gemini 2.5 Pro Preview TTS"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={voiceFilter} onValueChange={setVoiceFilter}>
          <SelectTrigger className="w-full md:w-48 h-10 border-gray-200 focus:border-gray-500 focus:ring-gray-500">
            <SelectValue placeholder="Voice" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Voices</SelectItem>
            {voices.map((voice) => (
              <SelectItem key={voice} value={voice}>
                {capitalize(voice)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prompt
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Voice
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Model
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Temperature
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredHistory.map((item: HistoryItem, index: number) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.prompt}
                    </p>
                    {item.style_instruction && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        Style: {item.style_instruction}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {capitalize(item.voice)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900">
                    {item.tts_model === "gemini-2.5-flash-preview-tts"
                      ? "Gemini 2.5 Flash Preview TTS"
                      : "Gemini 2.5 Pro Preview TTS"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(item.temperature / 2) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {item.temperature}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {item.audio_clip && (
                      <>
                        <button
                          onClick={() => playAudio(item.id, item.audio_clip)}
                          className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                          {playingId === item.id ? (
                            <>
                              <StopCircle className="w-3 h-3 mr-1" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-1" />
                              Play
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            downloadFileFromUrl(
                              item.audio_clip,
                              `${item.id}.mp3`,
                              item.id
                            );
                          }}
                          className={`cursor-pointer inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors ${
                            downloadingIds.includes(item.id)
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={downloadingIds.includes(item.id)}
                        >
                          {downloadingIds.includes(item.id) ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
