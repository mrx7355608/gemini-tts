"use client";
import { X, ChevronLeft, Settings, Mic, Volume2, Sliders } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

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

interface VoiceOption {
  name: string;
  desc: string;
  gender: string;
}

interface SpeedSettingsProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
}

export default function SpeechSettings({
  selectedModel,
  setSelectedModel,
  selectedVoice,
  setSelectedVoice,
  temperature,
  setTemperature,
}: SpeedSettingsProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [filteredVoices, setFilteredVoices] =
    useState<VoiceOption[]>(VOICE_OPTIONS);

  useEffect(() => {
    if (genderFilter === "all") {
      setFilteredVoices(VOICE_OPTIONS);
      setSelectedVoice("zephyr");
    } else {
      const filteredVoices = VOICE_OPTIONS.filter((voice) => {
        return voice.gender === genderFilter;
      });
      setFilteredVoices(filteredVoices);
      setSelectedVoice(filteredVoices[0].name.toLowerCase());
    }
  }, [genderFilter]);

  return (
    <div
      className={`relative flex-shrink-0 mt-8 lg:mt-0 transition-all duration-300 ease-in-out ${
        sidebarOpen ? "w-80" : "w-0"
      } overflow-visible`}
    >
      {/* Sidebar content */}
      <Card
        className={`border shadow-xl h-full transition-all duration-300 ease-in-out
          ${
            sidebarOpen
              ? "opacity-100 w-80"
              : "opacity-0 w-0 p-0 overflow-hidden border-0"
          }
        `}
      >
        <CardHeader className="p-6 relative pt-0 pb-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">Speech Settings</h2>
          </div>

          {/* Close (X) button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-1 text-gray-500 right-4 hover:bg-gray-100 rounded-full p-1.5 transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Model Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Mic className="w-4 h-4 text-green-500" />
              AI Model
            </Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="h-12 border-gray-200 focus:border-gray-500 focus:ring-gray-500/20 transition-all duration-200">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-2.5-pro-preview-tts">
                  Gemini 2.5 Pro Preview TTS
                </SelectItem>
                <SelectItem value="gemini-2.5-flash-preview-tts">
                  Gemini 2.5 Flash Preview TTS
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-green-500" />
                Temperature
              </Label>
              <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {temperature}
              </span>
            </div>
            <div className="space-y-2">
              <Slider
                value={[temperature]}
                onValueChange={(value) => setTemperature(value[0])}
                max={2}
                min={0}
                step={0.01}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Conservative (0)</span>
                <span>Creative (2)</span>
              </div>
            </div>
          </div>

          {/* Gender Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-green-500" />
              Voice Gender
            </Label>
            <RadioGroup
              value={genderFilter}
              onValueChange={setGenderFilter}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label
                  htmlFor="all"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  All Voices
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label
                  htmlFor="male"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Male Voices
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label
                  htmlFor="female"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Female Voices
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Voice Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-green-500" />
              Voice Selection
            </Label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger className="h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200">
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {filteredVoices.map((voice) => (
                  <SelectItem key={voice.name} value={voice.name.toLowerCase()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{voice.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {voice.desc}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Voice Preview Info */}
          {selectedVoice && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-green-900 capitalize">
                    {selectedVoice}
                  </h4>
                  <p className="text-sm text-green-700">
                    {
                      VOICE_OPTIONS.find(
                        (v) => v.name.toLowerCase() === selectedVoice
                      )?.desc
                    }{" "}
                    voice
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating expand button when sidebar is closed */}
      {!sidebarOpen && (
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-8 right-8 z-40 bg-white/90 backdrop-blur-sm border-gray-200 rounded-full shadow-lg hover:bg-white transition-all duration-200 lg:flex hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Expand sidebar"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Button>
      )}
    </div>
  );
}
