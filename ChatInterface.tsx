'use client';

import { useState, useEffect, useRef } from 'react';
import { Message, ToolCall, ToolResult } from '@/lib/types';
import { createThread, sendMessageToAssistant, generateId } from '@/lib/openai';
import { availableTools } from '@/lib/tools';
import { Transition } from '@headlessui/react';

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inicializar el thread al cargar el componente
  useEffect(() => {
    async function initThread() {
      try {
        const id = await createThread();
        setThreadId(id);
        console.log('Thread creado:', id);
      } catch (err) {
        setError('Error al inicializar el chat. Por favor, recarga la página.');
        console.error('Error al crear thread:', err);
      }
    }

    initThread();
  }, []);

  // Scroll al final de los mensajes cuando se añaden nuevos
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Manejar el envío de mensajes
  const handleSendMessage = async () => {
    if (!input.trim() || !threadId || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input,
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Función para manejar llamadas a herramientas
      const handleToolCall = (toolCall: ToolCall) => {
        const toolCallMessage: Message = {
          id: generateId(),
          role: 'tool',
          content: `Llamando a herramienta: ${toolCall.name}`,
          toolCall: toolCall,
          createdAt: new Date(),
        };
        setMessages(prev => [...prev, toolCallMessage]);
      };

      // Función para manejar resultados de herramientas
      const handleToolResult = (toolResult: ToolResult) => {
        const toolResultMessage: Message = {
          id: generateId(),
          role: 'tool',
          content: `Resultado de herramienta:`,
          toolResult: toolResult,
          createdAt: new Date(),
        };
        setMessages(prev => [...prev, toolResultMessage]);
      };

      // Enviar mensaje al asistente
      const assistantMessages = await sendMessageToAssistant(
        threadId,
        input,
        handleToolCall,
        handleToolResult
      );

      // Filtrar solo los mensajes del asistente y añadirlos
      const newAssistantMessages = assistantMessages
        .filter(msg => msg.role === 'assistant')
        .filter(msg => {
          // Evitar duplicados
          return !messages.some(existingMsg => existingMsg.id === msg.id);
        });

      setMessages(prev => [...prev, ...newAssistantMessages]);
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      setError('Error al comunicarse con el asistente. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar un mensaje individual
  const renderMessage = (message: Message) => {
    switch (message.role) {
      case 'user':
        return (
          <div className="bg-blue-100 p-3 rounded-lg ml-auto max-w-[80%]">
            <p>{message.content}</p>
          </div>
        );
      case 'assistant':
        return (
          <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
            <p>{message.content}</p>
          </div>
        );
      case 'tool':
        if (message.toolCall) {
          // Renderizar llamada a herramienta
          return (
            <div className="bg-amber-100 p-3 rounded-lg max-w-[80%] border border-amber-300">
              <p className="font-semibold">🔧 {message.toolCall.name}</p>
              <pre className="bg-amber-50 p-2 rounded mt-2 text-sm overflow-x-auto">
                {JSON.stringify(message.toolCall.arguments, null, 2)}
              </pre>
            </div>
          );
        } else if (message.toolResult) {
          // Renderizar resultado de herramienta
          return (
            <div className="bg-green-100 p-3 rounded-lg max-w-[80%] border border-green-300">
              <p className="font-semibold">✅ Resultado:</p>
              <pre className="bg-green-50 p-2 rounded mt-2 text-sm overflow-x-auto">
                {message.toolResult.content}
              </pre>
            </div>
          );
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Encabezado */}
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Asistente MCP</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Herramientas disponibles: {availableTools.length}</span>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>
      </header>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p className="text-lg">👋 ¡Hola! Soy tu asistente con acceso a herramientas.</p>
            <p className="mt-2">Puedes preguntarme sobre el clima, pedirme que busque información o realice cálculos.</p>
          </div>
        ) : (
          messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {renderMessage(message)}
            </div>
          ))
        )}

        {/* Indicador de carga */}
        <Transition
          show={isLoading}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg max-w-[80%] flex items-center space-x-2">
              <div className="animate-pulse flex space-x-1">
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animation-delay-200"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animation-delay-400"></div>
              </div>
              <span className="text-gray-500">Pensando...</span>
            </div>
          </div>
        </Transition>

        {/* Mensaje de error */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-100 text-red-700 p-3 rounded-lg max-w-[80%] border border-red-300">
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Referencia para scroll automático */}
        <div ref={messagesEndRef} />
      </div>

      {/* Área de entrada */}
      <div className="border-t p-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Escribe un mensaje..."
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading || !threadId}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim() || !threadId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              Enviar
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <p>Prueba: "¿Cuál es el clima en Madrid?", "Busca información sobre MCP", "Calcula 15 * 24 + 7"</p>
          </div>
        </div>
      </div>
    </div>
  );
}
