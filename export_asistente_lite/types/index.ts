// Contenido de src/types/index.ts
export type MessageRole = 'user' | 'assistant' | 'system';

export type Message = {
  role: MessageRole;
  content: string;
  source?: 'function' | 'openai' | 'user' | 'error'; // Ampliado según ChatInterface.tsx
  tool_calls?: any[]; // Debería ser un tipo más específico si se usa
};

export interface ChatRequest {
  message: string;
  conversationId: string; // Añadido según ChatInterface.tsx
  conversationHistory?: Array<{
    role: MessageRole;
    content: string;
  }>;
}

export interface ChatResponse {
  message: { // Estructura según lo que espera ChatInterface.tsx
    role: MessageRole;
    content: string;
    tool_calls?: any[];
  };
  error?: string;
}

// Podrías añadir otros tipos de assistant.ts si son relevantes para la funcionalidad base.
export interface Assistant {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  capabilities?: string[]; // Añadido según ChatInterface.tsx para el placeholder
}
