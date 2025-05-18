export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  error?: string;
}
