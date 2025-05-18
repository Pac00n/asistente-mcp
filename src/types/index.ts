export type MessageRole = 'user' | 'assistant' | 'system';

export type Message = {
  role: MessageRole;
  content: string;
  source?: 'function' | 'openai';
};

export interface ChatRequest {
  message: string;
  conversationHistory?: Array<{
    role: MessageRole;
    content: string;
  }>;
}

export interface ChatResponse {
  response: string;
  source: 'function' | 'openai';
  error?: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface ChatMessage {
  role: MessageRole | 'tool';
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
}
