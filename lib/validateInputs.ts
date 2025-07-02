const VOICE_OPTIONS = [
  "zephyr",
  "puck",
  "charon",
  "kore",
  "fenrir",
  "leda",
  "orus",
  "aoede",
  "callirrhoe",
  "autonoe",
  "enceladus",
  "iapetus",
  "umbriel",
  "algieba",
  "despina",
  "erinome",
  "algenib",
  "rasalgethi",
  "laomedeia",
  "achernar",
  "alnilam",
  "schedar",
  "gacrux",
  "pulcherrima",
  "achird",
  "zubenelgenubi",
  "vindemiatrix",
  "sadachbia",
  "sadaltager",
  "sulafat",
];

export function validateInputs(
  text: string,
  model: string,
  voice: string,
  temperature: number,
  styleInstructions: string
) {
  // Validate text
  if (!text) {
    return "Text is required";
  }
  if (text.length > 30000) {
    return "Text must be less than 30000 characters";
  }
  if (text.length < 10) {
    return "Text must be at least 10 characters";
  }

  // Validate model
  if (!model) {
    return "Model is required";
  }
  if (
    model !== "gemini-2.5-pro-preview-tts" &&
    model !== "gemini-2.5-flash-preview-tts"
  ) {
    return "Select a valid TTS model";
  }

  // Validate voice
  if (!voice) {
    return "Voice is required";
  }
  if (!VOICE_OPTIONS.includes(voice)) {
    return "Select a valid voice";
  }

  // Validate temperature
  if (temperature < 0 || temperature > 2) {
    return "Temperature must be between 0 and 2";
  }

  // Validate style instructions
  if (!styleInstructions) {
    return "Style instructions are required";
  }
  if (styleInstructions.length > 1000) {
    return "Style instructions must be less than 1000 characters";
  }
  if (styleInstructions.length < 10) {
    return "Style instructions must be at least 10 characters";
  }

  return null;
}
