import { Message, ToolCall, ToolResult } from './types';
import { getToolByName, availableTools } from './tools';
import OpenAI from 'openai';

// Inicializar el cliente de OpenAI
let openai: OpenAI;

// Inicializar el cliente solo en el lado del cliente
if (typeof window !== 'undefined') {
  openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true, // Necesario para cliente-side
  });
}

// ID del asistente de OpenAI
const ASSISTANT_ID = process.env.NEXT_PUBLIC_OPENAI_ASSISTANT_ID || 'asst_aB9vQf9JCz7lJL1bzZKcCM1c';

// Función para generar un ID único
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Función para crear un nuevo thread
export async function createThread() {
  try {
    // Verificar que openai esté inicializado
    if (!openai) {
      throw new Error('Cliente OpenAI no inicializado. Verifica que estás en el navegador y que la API key está configurada.');
    }

    // Verificar que la API key esté configurada
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      throw new Error('API key de OpenAI no configurada. Verifica el archivo .env.local');
    }

    console.log('Creando thread con OpenAI...');
    const thread = await openai.beta.threads.create();
    console.log('Thread creado con éxito:', thread.id);
    return thread.id;
  } catch (error: any) {
    console.error('Error al crear thread:', error);
    // Proporcionar un mensaje de error más descriptivo
    if (error.status === 401) {
      throw new Error('Error de autenticación: API key inválida o expirada');
    } else if (error.status === 403) {
      throw new Error('Error de permisos: No tienes acceso a este recurso');
    } else if (error.status === 429) {
      throw new Error('Límite de tasa excedido: Demasiadas solicitudes');
    } else {
      throw new Error(`Error al crear thread: ${error.message || 'Error desconocido'}`);
    }
  }
}

// Función para enviar un mensaje al asistente
export async function sendMessageToAssistant(
  threadId: string,
  content: string,
  onToolCall?: (toolCall: ToolCall) => void,
  onToolResult?: (toolResult: ToolResult) => void
): Promise<Message[]> {
  try {
    // Verificar que openai esté inicializado
    if (!openai) {
      throw new Error('Cliente OpenAI no inicializado');
    }

    // Añadir mensaje del usuario al thread
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: content,
    });

    // Ejecutar el asistente con las herramientas disponibles
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: ASSISTANT_ID,
      tools: availableTools.map(tool => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        }
      }))
    });

    // Esperar a que el asistente complete la ejecución o requiera acción
    let currentRun = run;
    let maxAttempts = 60; // 60 segundos máximo
    let attempts = 0;
    
    while (
      (currentRun.status === 'queued' ||
      currentRun.status === 'in_progress' ||
      currentRun.status === 'requires_action') &&
      attempts < maxAttempts
    ) {
      attempts++;
      
      if (currentRun.status === 'requires_action') {
        const toolCalls = currentRun.required_action?.submit_tool_outputs.tool_calls || [];
        
        // Procesar cada llamada a herramienta
        const toolOutputs = await Promise.all(
          toolCalls.map(async (toolCall) => {
            const toolCallObj: ToolCall = {
              id: toolCall.id,
              name: toolCall.function.name,
              arguments: JSON.parse(toolCall.function.arguments),
            };
            
            // Notificar sobre la llamada a herramienta
            if (onToolCall) {
              onToolCall(toolCallObj);
            }
            
            // Obtener la herramienta y ejecutarla
            const tool = getToolByName(toolCall.function.name);
            let result;
            
            if (tool) {
              try {
                result = await tool.handler(toolCallObj.arguments);
              } catch (error) {
                console.error(`Error al ejecutar herramienta ${tool.name}:`, error);
                result = { error: `Error al ejecutar la herramienta: ${error}` };
              }
            } else {
              result = { error: `Herramienta no encontrada: ${toolCall.function.name}` };
            }
            
            const resultStr = JSON.stringify(result);
            
            // Notificar sobre el resultado de la herramienta
            if (onToolResult) {
              onToolResult({
                toolCallId: toolCall.id,
                content: resultStr,
              });
            }
            
            return {
              tool_call_id: toolCall.id,
              output: resultStr,
            };
          })
        );
        
        // Enviar los resultados de las herramientas al asistente
        currentRun = await openai.beta.threads.runs.submitToolOutputs(
          threadId,
          currentRun.id,
          { tool_outputs: toolOutputs }
        );
      } else {
        // Esperar un momento y verificar el estado
        await new Promise((resolve) => setTimeout(resolve, 1000));
        currentRun = await openai.beta.threads.runs.retrieve(
          threadId,
          currentRun.id
        );
      }
    }
    
    if (attempts >= maxAttempts) {
      throw new Error('Tiempo de espera agotado para la respuesta del asistente');
    }
    
    // Obtener los mensajes del thread
    const messagesResponse = await openai.beta.threads.messages.list(threadId);
    
    // Convertir los mensajes al formato de nuestra aplicación
    const messages: Message[] = messagesResponse.data.map(msg => {
      // Extraer el contenido del mensaje
      let content = '';
      if (msg.content && msg.content.length > 0) {
        const firstContent = msg.content[0];
        if (firstContent.type === 'text') {
          content = firstContent.text.value;
        }
      }
      
      return {
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system' | 'tool',
        content: content,
        createdAt: new Date(msg.created_at * 1000),
      };
    });
    
    return messages;
  } catch (error: any) {
    console.error('Error al enviar mensaje al asistente:', error);
    
    // Proporcionar un mensaje de error más descriptivo
    if (error.status === 401) {
      throw new Error('Error de autenticación: API key inválida o expirada');
    } else if (error.status === 403) {
      throw new Error('Error de permisos: No tienes acceso a este recurso');
    } else if (error.status === 404) {
      throw new Error('Recurso no encontrado: Verifica el ID del asistente y del thread');
    } else if (error.status === 429) {
      throw new Error('Límite de tasa excedido: Demasiadas solicitudes');
    } else {
      throw new Error(`Error al enviar mensaje: ${error.message || 'Error desconocido'}`);
    }
  }
}
