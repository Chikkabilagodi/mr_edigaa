
export enum Sender {
  User = 'user',
  Bot = 'model'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number;
  attachment?: string; // Base64 data URI (Image)
  audio?: string; // Base64 data URI (Speech)
  reactions?: string[]; // Array of emoji strings
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  memoryEnabled: boolean;
  theme: 'dark' | 'light';
  flirtLevel: number; // 1 to 5
  personaMode: 'romantic' | 'professional';
  memories: string[]; // List of specific facts Arohi remembers
  passcode?: string; // 4-digit string
}

export interface GeminiResponse {
  text: string;
  attachment?: string; // For generated images
  error?: string;
}
