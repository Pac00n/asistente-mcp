import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Extender los tipos de OpenAI para incluir las herramientas
declare global {
  namespace OpenAI {
    interface ChatCompletionCreateParams {
      tools?: Array<{
        type: 'function';
        function: {
          name: string;
          description?: string;
          parameters: Record<string, unknown>;
        };
      }>;
      tool_choice?: 'none' | 'auto' | { type: 'function'; function: { name: string } };
    }
  }
}

// Configuración de OpenAI
const openai = new OpenAI({
  apiKey: (process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY) as string,
  dangerouslyAllowBrowser: true,
});

// URL del servidor MCP
const MCP_SERVER_URL = (process.env.MCP_SERVER_URL || 'http://localhost:3001') + '/api';

// Definición de las herramientas (funciones) disponibles
const tools = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Obtiene el clima actual para una ubicación específica. Úsalo cuando el usuario pregunte sobre el tiempo, la temperatura o condiciones climáticas en un lugar específico.',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'La ciudad y país, ej: Madrid, España',
          },
          unit: {
            type: 'string',
            enum: ['celsius', 'fahrenheit'],
            description: 'Unidad de temperatura a utilizar. Si el usuario no especifica, usa celsius por defecto.',
          },
        },
        required: ['location'],
      },
    },
  },
] as const;

// Tipo para los parámetros de la función de clima
type WeatherFunctionArgs = {
  location: string;
  unit?: 'celsius' | 'fahrenheit';
};

// Tipos para las respuestas de la API
type ToolCall = {
  id: string;
  type: 'function';
  function: {
    name: 'get_weather';
    arguments: string;
  };
};

type ChatCompletionMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool' | 'function';
  content: string | null;
  name?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
};

// Función para manejar la consulta de clima con MCP
async function getWeather(location: string, unit: 'celsius' | 'fahrenheit' = 'celsius'): Promise<string> {
  try {
    console.log(`Consultando clima para: ${location}`);
    const response = await fetch(`${MCP_SERVER_URL}/weather`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location,
        units: unit === 'celsius' ? 'metric' : 'imperial'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en la respuesta del servidor MCP:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Error del servidor MCP: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Respuesta del servidor MCP:', data);
    
    if (!data || !data.condition || data.temperature === undefined) {
      console.error('Respuesta del servidor MCP incompleta:', data);
      throw new Error('Respuesta del servidor MCP incompleta');
    }

    return `El clima en ${data.location} es ${data.condition} con una temperatura de ${data.temperature}°${unit === 'celsius' ? 'C' : 'F'}. ` +
           `Sensación térmica: ${data.apparent_temperature}°${unit === 'celsius' ? 'C' : 'F'}, Humedad: ${data.humidity}%, ` +
           `Viento: ${data.wind_speed} ${unit === 'celsius' ? 'km/h' : 'mph'}`;
  } catch (error: any) {
    console.error('Error al consultar el clima:', error);
    return `Lo siento, no pude obtener la información del clima. ${error?.message || ''}`.trim();
  }
}

export async function POST(req: Request) {
  try {
    const { message, conversationHistory = [] } = await req.json();
    
    // 1. Configurar los mensajes iniciales
    const systemMessage = {
      role: 'system' as const,
      content: `Eres un asistente de IA útil y versátil. Tu objetivo es ayudar al usuario con cualquier pregunta o tarea que tenga.

      Tienes acceso a herramientas que puedes usar cuando sea necesario. Por ejemplo, si el usuario hace una pregunta sobre el clima, puedes usar la función get_weather para obtener información actualizada.
      
      Instrucciones importantes:
      - Solo usa las herramientas cuando sean necesarias para responder la pregunta del usuario.
      - Si no necesitas usar herramientas, responde directamente de manera natural.
      - Si el usuario hace preguntas generales, respóndelas sin usar herramientas.
      - Mantén un tono amable y profesional en todo momento.`
    };

    // Filtrar y mapear el historial de mensajes
    const historyMessages = conversationHistory
      .filter((msg: { role: string; content: string | null }) => 
        msg.content != null && msg.content.trim() !== ''
      )
      .map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

    // Asegurarse de que el mensaje del usuario no esté vacío
    if (!message || message.trim() === '') {
      throw new Error('El mensaje no puede estar vacío');
    }

    const userMessage = { 
      role: 'user' as const, 
      content: message 
    };

    // Filtrar mensajes para asegurar que todos tengan contenido
    const messages = [
      systemMessage,
      ...historyMessages,
      userMessage
    ].filter(msg => msg.content != null && msg.content.trim() !== '');
    
    console.log('Enviando mensaje a OpenAI:', { messages });
    
    // 2. Llamar a la API de OpenAI con las herramientas
    console.log('Enviando solicitud a OpenAI con mensajes:', JSON.stringify(messages, null, 2));
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Intentamos usar el modelo gpt-4o-mini
      messages,
      tools: tools as any,
      tool_choice: 'auto', // Permite que el modelo decida si usar herramientas o no
      temperature: 0.7, // Un poco de creatividad
      top_p: 0.9,
    } as any);

    const responseMessage = completion.choices[0].message;
    console.log('Respuesta de OpenAI:', JSON.stringify(responseMessage, null, 2));
    
    // Asegurarse de que el mensaje tenga contenido
    if (!responseMessage.content) {
      responseMessage.content = ''; // Establecer un valor predeterminado si es null o undefined
    }
    
    // 3. Manejar la respuesta de OpenAI
    const responseWithTools = responseMessage as ChatCompletionMessage & { tool_calls?: ToolCall[] };
    
    if (responseWithTools.tool_calls && responseWithTools.tool_calls.length > 0) {
      console.log('OpenAI solicitó llamar a una herramienta:', responseWithTools.tool_calls);
      
      // Procesar cada llamada a herramienta
      const toolResults = await Promise.all(
        responseWithTools.tool_calls.map(async (toolCall: ToolCall) => {
          try {
            if (toolCall.function.name === 'get_weather') {
              const args = JSON.parse(toolCall.function.arguments) as WeatherFunctionArgs;
              console.log('Llamando a get_weather con args:', args);
              const weatherInfo = await getWeather(args.location, args.unit);
              return {
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                name: 'get_weather',
                content: weatherInfo,
              };
            }
          } catch (error) {
            console.error('Error al procesar la herramienta:', error);
            return {
              tool_call_id: toolCall.id,
              role: 'tool' as const,
              name: toolCall.function.name,
              content: `Error al procesar la herramienta: ${error instanceof Error ? error.message : String(error)}`,
            };
          }
          return null;
        })
      );

      // Filtrar resultados nulos
      const validResults = toolResults.filter(Boolean);
      
      // Si hay resultados válidos, enviar la respuesta de vuelta a OpenAI
      if (validResults.length > 0) {
        console.log('Enviando resultados de herramientas a OpenAI:', validResults);
        
        const secondResponse = await openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [
            ...messages,
            responseMessage,
            ...validResults,
          ],
          temperature: 0.7,
        } as any);

        console.log('Respuesta final de OpenAI:', secondResponse.choices[0].message);
        
        return NextResponse.json({ 
          message: secondResponse.choices[0].message,
        });
      }
    }

    // Si no hay llamadas a herramientas, devolver la respuesta directa
    console.log('Respuesta directa de OpenAI (sin herramientas):', responseMessage);
    return NextResponse.json({ 
      message: responseMessage,
    });

  } catch (error: unknown) {
    console.error('Error en la ruta /api/chat:', error);
    
    // Manejar diferentes tipos de errores
    let statusCode = 500;
    let errorMessage = 'Error al procesar la solicitud';
    let errorDetails = error instanceof Error ? error.message : String(error);
    
    if (error instanceof SyntaxError) {
      statusCode = 400;
      errorMessage = 'Error de formato en la solicitud';
    } else if (error && typeof error === 'object' && 'status' in error) {
      // Manejar errores de la API de OpenAI
      const apiError = error as { status?: number; message?: string; code?: string };
      statusCode = apiError.status || 500;
      errorMessage = `Error de la API: ${apiError.message || 'Error desconocido'}`;
      errorDetails = apiError.code ? `Código: ${apiError.code}` : errorDetails;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}
