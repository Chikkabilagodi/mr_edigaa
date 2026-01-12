export enum Sender {
  User = 'user',
  Bot = 'model'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number;
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
  theme: 'dark' | 'light'; // Currently forcing dark for the specific aesthetic, but scaffolding strictly.
}

export interface GeminiResponse {
  text: string;
  error?: string;
}