export interface Assistant {
  id: string;
  name: string;
  description: string;
  avatar: string;
  color: string;
  initialMessage?: string;
}

export const getAssistantById = (id: string): Assistant | undefined => {
  return assistants.find(a => a.id === id);
};

export const assistants: Assistant[] = [
  {
    id: 'asistente-mcp',
    name: 'Asistente MCP',
    description: 'Un asistente inteligente que puede ayudarte con diversas tareas',
    avatar: '🤖',
    color: 'bg-blue-500',
    initialMessage: '¡Hola! Soy tu asistente MCP. ¿En qué puedo ayudarte hoy?'
  }
];
