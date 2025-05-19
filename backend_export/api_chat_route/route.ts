// Contenido de src/app/api/chat/route.ts
// Este archivo contiene la lógica principal del backend del chat.
// (El contenido completo del archivo original se pega aquí)
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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

const openai = new OpenAI({
  apiKey: (process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY) as string,
  dangerouslyAllowBrowser: true, // Considerar implicaciones de seguridad si se mantiene en un backend real
});

const MCP_SERVER_URL = (process.env.MCP_SERVER_URL || 'http://localhost:3001') + '/api';

const tools = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Obtiene el clima actual para una ubicación específica...',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'La ciudad y país, ej: Madrid, España' },
          unit: { type: 'string', enum: ['celsius', 'fahrenheit'], description: 'Unidad de temperatura...' },
        },
        required: ['location'],
      },
    },
  },
] as const;

type WeatherFunctionArgs = { location: string; unit?: 'celsius' | 'fahrenheit'; };
type ToolCall = { id: string; type: 'function'; function: { name: 'get_weather'; arguments: string; }; };
type ChatCompletionMessage = { role: 'system' | 'user' | 'assistant' | 'tool' | 'function'; content: string | null; name?: string; tool_calls?: ToolCall[]; tool_call_id?: string; };

const KNOWN_LOCATIONS: Record<string, { name: string; latitude: number; longitude: number; country: string }> = {
  'madrid': { name: 'Madrid', latitude: 40.4168, longitude: -3.7038, country: 'España' },
  // ... (otras ubicaciones) ...
  'tokio': { name: 'Tokio', latitude: 35.6762, longitude: 139.6503, country: 'Japón' }
};

const WEATHER_CODE_MAP: Record<number, string> = {
  0: 'Despejado', 1: 'Mayormente despejado', /* ... (otros códigos) ... */ 99: 'Tormenta con granizo intenso'
};

function getCoordinates(location: string) {
  const normalizedLocation = location.toLowerCase().trim();
  const exactMatch = KNOWN_LOCATIONS[normalizedLocation];
  if (exactMatch) return exactMatch;
  const match = Object.entries(KNOWN_LOCATIONS).find(([key]) => normalizedLocation.includes(key) || key.includes(normalizedLocation));
  return match ? match[1] : null;
}

async function getWeatherFromOpenMeteo(location: string, unit: 'celsius' | 'fahrenheit' = 'celsius') {
  const locationData = getCoordinates(location);
  if (!locationData) throw new Error(`No se encontró información para la ubicación: ${location}`);
  const { latitude, longitude, name, country } = locationData;
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
    `&timezone=auto&temperature_unit=${unit === 'celsius' ? 'celsius' : 'fahrenheit'}`
  );
  if (!response.ok) throw new Error(`Error al consultar el clima: ${response.status} ${response.statusText}`);
  const data = await response.json();
  const current = data.current;
  return {
    location: `${name}, ${country}`,
    temperature: current.temperature_2m, apparent_temperature: current.apparent_temperature,
    condition: WEATHER_CODE_MAP[current.weather_code] || 'Desconocido', humidity: current.relative_humidity_2m,
    wind_speed: current.wind_speed_10m, units: unit === 'celsius' ? '°C' : '°F',
    last_updated: new Date().toISOString()
  };
}

async function getWeather(location: string, unit: 'celsius' | 'fahrenheit' = 'celsius'): Promise<string> {
  if (process.env.NODE_ENV === 'production' || process.env.USE_OPEN_METEO === 'true') {
    try {
      const data = await getWeatherFromOpenMeteo(location, unit);
      return `El clima en ${data.location} es ${data.condition} con ${data.temperature}${data.units}...`;
    } catch (error) {
      if (process.env.NODE_ENV === 'production') throw error;
    }
  }
  try {
    const response = await fetch(`${MCP_SERVER_URL}/weather`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location, units: unit === 'celsius' ? 'metric' : 'imperial' }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor MCP: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    if (!data || !data.condition || data.temperature === undefined) throw new Error('Respuesta del servidor MCP incompleta');
    return `El clima en ${data.location} es ${data.condition} con ${data.temperature}°${unit === 'celsius' ? 'C' : 'F'}...`;
  } catch (error: any) {
    return `Lo siento, no pude obtener el clima. ${error?.message || ''}`.trim();
  }
}

export async function POST(req: Request) {
  try {
    const { message, conversationHistory = [] } = await req.json();
    const systemMessage = { role: 'system' as const, content: `Eres un asistente útil...` };
    const historyMessages = conversationHistory.filter((msg: any) => msg.content?.trim()).map((msg: any) => ({ role: msg.role, content: msg.content }));
    if (!message?.trim()) throw new Error('El mensaje no puede estar vacío');
    const userMessage = { role: 'user' as const, content: message };
    const messagesToOpenAI = [systemMessage, ...historyMessages, userMessage].filter(msg => msg.content?.trim());
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', messages: messagesToOpenAI as any,
      tools: tools as any, tool_choice: 'auto', temperature: 0.7, top_p: 0.9,
    });
    const responseMessage = completion.choices[0].message;
    if (!responseMessage.content) responseMessage.content = '';

    const responseWithTools = responseMessage as ChatCompletionMessage & { tool_calls?: ToolCall[] };
    if (responseWithTools.tool_calls?.length) {
      const toolResults = await Promise.all(
        responseWithTools.tool_calls.map(async (toolCall: ToolCall) => {
          try {
            if (toolCall.function.name === 'get_weather') {
              const args = JSON.parse(toolCall.function.arguments) as WeatherFunctionArgs;
              const weatherInfo = await getWeather(args.location, args.unit);
              return { tool_call_id: toolCall.id, role: 'tool' as const, name: 'get_weather', content: weatherInfo };
            }
          } catch (error) {
            return { tool_call_id: toolCall.id, role: 'tool' as const, name: toolCall.function.name, content: `Error: ${error instanceof Error ? error.message : String(error)}` };
          }
          return null;
        })
      );
      const validResults = toolResults.filter(Boolean);
      if (validResults.length > 0) {
        const secondResponse = await openai.chat.completions.create({
          model: 'gpt-4-turbo-preview', 
          messages: [...messagesToOpenAI, responseMessage, ...validResults as any],
          temperature: 0.7,
        });
        return NextResponse.json({ message: secondResponse.choices[0].message });
      }
    }
    return NextResponse.json({ message: responseMessage });
  } catch (error: unknown) {
    let statusCode = 500;
    let errorMessage = 'Error al procesar la solicitud';
    let errorDetails = error instanceof Error ? error.message : String(error);
    if (error instanceof SyntaxError) { statusCode = 400; errorMessage = 'Error de formato'; }
    // ... (manejo de errores de OpenAI API) ...
    return NextResponse.json({ error: errorMessage, details: errorDetails }, { status: statusCode });
  }
}
