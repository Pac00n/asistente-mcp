import { Tool } from './types';

// Herramienta de búsqueda web
export const searchWebTool: Tool = {
  name: 'search_web',
  description: 'Busca información en la web',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'La consulta de búsqueda',
      },
    },
    required: ['query'],
  },
  handler: async (args: { query: string }) => {
    try {
      // Simulación de búsqueda web
      console.log(`Buscando: ${args.query}`);
      
      // En una implementación real, aquí se conectaría a una API de búsqueda
      // Por ahora, devolvemos una respuesta simulada
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simular latencia
      
      return {
        results: [
          {
            title: `Resultados para: ${args.query}`,
            snippet: `Esta es información relevante sobre "${args.query}" encontrada en la web.`,
            url: `https://ejemplo.com/search?q=${encodeURIComponent(args.query)}`,
          },
          {
            title: `Más información sobre: ${args.query}`,
            snippet: `Datos adicionales relacionados con "${args.query}" de fuentes confiables.`,
            url: `https://ejemplo.com/info?topic=${encodeURIComponent(args.query)}`,
          }
        ]
      };
    } catch (error) {
      console.error('Error en search_web:', error);
      return { error: 'No se pudo completar la búsqueda' };
    }
  }
};

// Herramienta para obtener el clima
export const weatherTool: Tool = {
  name: 'get_weather',
  description: 'Obtiene el pronóstico del tiempo para una ubicación',
  parameters: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'La ubicación para la que se quiere obtener el pronóstico',
      },
    },
    required: ['location'],
  },
  handler: async (args: { location: string }) => {
    try {
      console.log(`Obteniendo clima para: ${args.location}`);
      
      // Simulación de API de clima
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const conditions = ['soleado', 'nublado', 'lluvioso', 'parcialmente nublado'];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      const temperature = Math.floor(Math.random() * 30) + 5; // Temperatura entre 5 y 35°C
      
      return {
        location: args.location,
        temperature: `${temperature}°C`,
        condition: randomCondition,
        humidity: `${Math.floor(Math.random() * 60) + 30}%`, // Humedad entre 30% y 90%
        forecast: 'Pronóstico simulado para demostración'
      };
    } catch (error) {
      console.error('Error en get_weather:', error);
      return { error: 'No se pudo obtener el pronóstico del tiempo' };
    }
  }
};

// Herramienta para calcular matemáticas
export const calculateTool: Tool = {
  name: 'calculate',
  description: 'Realiza cálculos matemáticos',
  parameters: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'La expresión matemática a calcular',
      },
    },
    required: ['expression'],
  },
  handler: async (args: { expression: string }) => {
    try {
      console.log(`Calculando: ${args.expression}`);
      
      // Evaluación segura de expresiones matemáticas
      // Nota: En producción, usar una biblioteca segura para evaluar expresiones
      const sanitizedExpression = args.expression.replace(/[^-()\d/*+.]/g, '');
      
      // eslint-disable-next-line no-eval
      const result = eval(sanitizedExpression);
      
      return {
        expression: args.expression,
        result: result
      };
    } catch (error) {
      console.error('Error en calculate:', error);
      return { error: 'No se pudo realizar el cálculo' };
    }
  }
};

// Lista de todas las herramientas disponibles
export const availableTools: Tool[] = [
  searchWebTool,
  weatherTool,
  calculateTool
];

// Función para obtener una herramienta por nombre
export function getToolByName(name: string): Tool | undefined {
  return availableTools.find(tool => tool.name === name);
}
