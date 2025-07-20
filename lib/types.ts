export interface IHistoryData {
  prompt: string;
  style_instruction: string;
  voice: string;
  tts_model: string;
  temperature: number;
  audio_clip: string;
}

export interface HistoryItem {
  id: string;
  user_id: string;
  prompt: string;
  style_instruction: string;
  voice: string;
  tts_model: string;
  temperature: number;
  audio_clip: string;
  created_at: string;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  full_name: string;
  created_at: string;
}

export interface UserFormData {
  full_name: string;
  email: string;
  role: string;
  password?: string;
}
