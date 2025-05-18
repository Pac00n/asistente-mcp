import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Configuración de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Necesario para el entorno de ejecución de Next.js
});

// URL del servidor MCP (ajusta según tu configuración)
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3001';

// ID del asistente de OpenAI
const ASSISTANT_ID = process.env.NEXT_PUBLIC_OPENAI_ASSISTANT_ID || 'asst_aB9vQf9JCz7lJL1bzZKcCM1c';

// Función para verificar si el mensaje es una consulta de clima
function isWeatherQuery(message: string): boolean {
  const weatherKeywords = [
    'clima', 'tiempo', 'temperatura', 'lluvia', 'soleado',
    'pronóstico', 'meteorología', 'grados', 'hoy hace', 'qué tiempo hace'
  ];
  const query = message.toLowerCase();
  return weatherKeywords.some(keyword => query.includes(keyword));
}

// Función para manejar consultas de clima con MCP
async function handleWeatherQuery(location: string): Promise<string> {
  try {
    const response = await fetch(`${MCP_SERVER_URL}/weather`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: location || 'Madrid', // Por defecto Madrid si no se especifica ubicación
        units: 'metric', // Usar grados Celsius
      }),
    });

    if (!response.ok) {
      throw new Error('No se pudo obtener la información del clima');
    }

    const data = await response.json();
    return `El clima en ${data.location} es ${data.condition} con una temperatura de ${data.temperature}°C. ${data.forecast || ''}`;
  } catch (error) {
    console.error('Error al consultar el clima:', error);
    return 'Lo siento, no pude obtener la información del clima en este momento. Por favor, inténtalo de nuevo más tarde.';
  }
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // Verificar si es una consulta de clima
    if (isWeatherQuery(message)) {
      const weatherResponse = await handleWeatherQuery(message);
      return NextResponse.json({
        response: weatherResponse,
        source: 'mcp-weather',
      });
    }

    // Si no es una consulta de clima, usar OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Eres un asistente útil que responde preguntas sobre MCP (Model Context Protocol). 
          Si el usuario pregunta sobre el clima, asegúrate de que la consulta se enrute al servicio MCP correspondiente.`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
    });

    return NextResponse.json({
      response: completion.choices[0]?.message?.content || 'No se pudo generar una respuesta.',
      source: 'openai',
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
