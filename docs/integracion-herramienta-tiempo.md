# Integración de la Herramienta del Tiempo en el Asistente MCP

## Visión General

Este documento detalla cómo está implementada la integración de la herramienta del tiempo en el Asistente MCP, permitiendo al asistente responder preguntas sobre el clima en diferentes ubicaciones.

## Estructura del Código

### 1. Servidor MCP Mock (`mock-mcp-server.js`)

Este servidor simula un servicio MCP que proporciona datos meteorológicos. Se ejecuta localmente en el puerto 3001.

**Funcionalidades principales:**
- Escucha peticiones POST en `/api/resources/weather`
- Obtiene datos meteorológicos de Open-Meteo
- Devuelve la información estructurada

**Ejemplo de respuesta:**
```json
{
  "location": "Madrid",
  "temperature": 22.5,
  "condition": "Soleado",
  "humidity": 45,
  "wind_speed": 10.2
}
```

### 2. Endpoint de la API de Chat (`/app/api/chat/route.ts`)

Maneja las solicitudes del chat y la integración con OpenAI.

**Flujo de procesamiento:**
1. Recibe el mensaje del usuario
2. Detecta si la consulta es sobre el tiempo
3. Si es necesario, llama al servidor MCP para obtener datos meteorológicos
4. Procesa la respuesta con OpenAI
5. Devuelve la respuesta al cliente

**Código clave:**
```typescript
// Detección de consultas sobre el tiempo
const isWeatherQuery = (content: string): boolean => {
  const weatherKeywords = ['tiempo', 'clima', 'temperatura', 'lluvia', 'sol', 'llueve'];
  return weatherKeywords.some(keyword => content.toLowerCase().includes(keyword));
};

// Obtención de datos meteorológicos
const getWeatherData = async (location: string) => {
  const response = await fetch('http://localhost:3001/api/resources/weather', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location })
  });
  return await response.json();
};
```

### 3. Interfaz de Usuario (`/components/ChatInterface.tsx`)

Maneja la visualización de mensajes y la interacción del usuario.

**Características principales:**
- Muestra mensajes del usuario y del asistente
- Maneja el estado de carga
- Soporta mensajes con formato
- Muestra información meteorológica de manera estructurada

## Configuración Requerida

1. **Variables de entorno** (`.env.local`):
   ```
   # Clave de API de OpenAI (requerida)
   OPENAI_API_KEY=tu_clave_de_openai
   
   # URL del servidor MCP (solo desarrollo)
   MCP_SERVER_URL=http://localhost:3001/api
   
   # Opcional: Forzar el uso de Open-Meteo incluso en desarrollo
   # USE_OPEN_METEO=true
   ```

## Modos de Operación

### 1. Modo Producción (Recomendado)

En producción, la aplicación usa automáticamente la API de Open-Meteo directamente, sin necesidad de un servidor MCP.

**Ventajas:**
- No requiere servidor adicional
- Mayor disponibilidad
- Menor latencia

**Configuración:**
```bash
# No se necesita configuración especial
# La aplicación detecta automáticamente que está en producción
NODE_ENV=production
```

### 2. Modo Desarrollo con Open-Meteo

Para desarrollo, puedes optar por usar Open-Meteo directamente:

```bash
# Iniciar en modo desarrollo usando Open-Meteo
USE_OPEN_METEO=true npm run dev
```

**Ventajas:**
- No necesitas ejecutar el servidor mock
- Datos meteorológicos reales
- Útil para probar la integración con Open-Meteo

### 3. Modo Desarrollo con Servidor Mock (Por defecto)

Usa un servidor mock local para desarrollo sin depender de servicios externos:

```bash
# Iniciar el servidor mock (en una terminal separada)
node mock-mcp-server.js

# Iniciar la aplicación
npm run dev
```

## Requisitos del Servidor Mock

### Servidor MCP en Desarrollo

Para que la funcionalidad del tiempo funcione correctamente, **es necesario** tener en ejecución el servidor mock de MCP:

1. **Requisitos previos**:
   - Node.js instalado
   - Dependencias instaladas (`npm install`)

2. **Iniciar el servidor**:
   ```bash
   # En una terminal separada
   node mock-mcp-server.js
   ```
   El servidor se iniciará en `http://localhost:3001`

3. **Verificar el estado**:
   ```bash
   curl http://localhost:3001/api/health
   ```
   Deberías ver: `{"status":"ok","service":"mock-mcp-server"}`

### Notas importantes

- El servidor mock **debe estar en ejecución** para que las consultas sobre el clima funcionen.
- Si el servidor no está disponible, verás un mensaje de error en la consola y la aplicación no podrá obtener información meteorológica.
- En producción, deberías reemplazar este servidor mock por un servicio real de clima o desplegar este servidor en un entorno accesible.

### Solución de problemas

#### Con Servidor Mock
- **Error de conexión**: Asegúrate de que el puerto 3001 no esté siendo usado por otra aplicación.
- **Sin datos de clima**: Verifica que el servidor esté devolviendo datos correctamente con:
  ```bash
  curl -X POST http://localhost:3001/api/weather -H "Content-Type: application/json" -d '{"location":"Madrid"}'
  ```

#### Con Open-Meteo
- **Ubicación no encontrada**: La aplicación solo soporta ubicaciones predefinidas. Verifica que la ubicación esté en la lista de ubicaciones conocidas.
- **Error de API**: Si hay problemas con la API de Open-Meteo, verifica tu conexión a internet o espera unos minutos antes de reintentar.

#### General
- **Verifica los logs**: Los mensajes de error detallados se muestran en la consola del servidor.
- **Estado de Open-Meteo**: Si usas Open-Meteo, verifica su estado en [Open-Meteo Status](https://open-meteo.com/status)

2. **Dependencias** (`package.json`):
   ```json
   {
     "dependencies": {
       "next": "^14.0.0",
       "react": "^18.0.0",
       "react-dom": "^18.0.0",
       "openai": "^4.0.0"
     }
   }
   ```

## Añadir Nuevas Herramientas al Asistente

La arquitectura del asistente está diseñada para facilitar la adición de nuevas herramientas. Sigue estos pasos para integrar una nueva funcionalidad:

### 1. Definir la Herramienta

Añade la definición de la herramienta en el array `tools` en `src/app/api/chat/route.ts`:

```typescript
const tools = [
  // ... herramientas existentes ...
  {
    type: 'function',
    function: {
      name: 'nombre_de_la_herramienta',
      description: 'Descripción clara de lo que hace la herramienta',
      parameters: {
        type: 'object',
        properties: {
          parametro1: { 
            type: 'string',
            description: 'Descripción del parámetro 1'
          },
          parametro2: {
            type: 'number',
            description: 'Descripción del parámetro 2'
          }
          // Añade más parámetros según sea necesario
        },
        required: ['parametro1'] // Parámetros obligatorios
      }
    }
  }
] as const;
```

### 2. Implementar la Función de la Herramienta

Crea una función asíncrona que implemente la lógica de la herramienta:

```typescript
async function nombreDeLaFuncion({ parametro1, parametro2 }: { 
  parametro1: string;
  parametro2?: number;
}): Promise<string> {
  try {
    // Lógica de la herramienta aquí
    // Puedes hacer llamadas a APIs externas, procesar datos, etc.
    
    // Devuelve un string con la respuesta formateada
    return `Resultado: ${parametro1} procesado correctamente`;
  } catch (error) {
    console.error('Error en nombreDeLaFuncion:', error);
    return 'No se pudo completar la operación. Por favor, inténtalo de nuevo más tarde.';
  }
}
```

### 3. Manejar la Llamada a la Herramienta

En el switch que maneja las llamadas a herramientas, añade un nuevo caso:

```typescript
// Dentro del bucle for de toolCalls
for (const toolCall of toolCalls) {
  const { name, arguments: args } = toolCall.function;
  
  try {
    const parsedArgs = JSON.parse(args);
    
    switch (name) {
      // ... casos existentes ...
      
      case 'nombre_de_la_herramienta':
        console.log(`Llamando a ${name} con args:`, parsedArgs);
        result = await nombreDeLaFuncion(parsedArgs);
        break;
        
      // ... más casos ...
    }
  } catch (error) {
    console.error(`Error al procesar la herramienta ${name}:`, error);
    result = `Error al procesar la herramienta ${name}`;
  }
  
  // ... resto del código existente ...
}
```

### 4. Probar la Nueva Herramienta

1. Asegúrate de que la herramienta esté correctamente definida e implementada.
2. Inicia la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```
3. Prueba la herramienta haciendo una pregunta que active su funcionalidad.
4. Verifica los logs para asegurarte de que todo funciona como se espera.

### 5. Documentación de la Herramienta

Asegúrate de documentar:
- El propósito de la herramienta
- Los parámetros que acepta
- Los valores de retorno
- Posibles errores
- Ejemplos de uso

## Ejecución del Sistema

### Opción 1: Desarrollo con Servidor Mock (Por defecto)

1. Iniciar el servidor MCP mock en una terminal:
   ```bash
   node mock-mcp-server.js
   ```

2. En otra terminal, iniciar la aplicación Next.js:
   ```bash
   npm run dev
   ```

### Opción 2: Desarrollo con Open-Meteo

```bash
# Usar Open-Meteo directamente en desarrollo
USE_OPEN_METEO=true npm run dev
```

### Opción 3: Producción

En producción, la aplicación usa automáticamente Open-Meteo sin configuración adicional.

```bash
# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

## Acceso a la aplicación

- Desarrollo: `http://localhost:3000`
- Servidor mock: `http://localhost:3001` (solo en modo desarrollo con servidor mock)

## Ejemplos de Uso

1. **Consulta simple:**
   - Usuario: "¿Qué tiempo hace en Madrid?"
   - Asistente: "Actualmente en Madrid está soleado con 22°C, humedad del 45% y viento a 10 km/h."

2. **Consulta con detalles específicos:**
   - Usuario: "¿Voy a necesitar paraguas mañana en Barcelona?"
   - Asistente: "Mañana en Barcelona habrá lluvias ligeras con una probabilidad del 70%. Te recomiendo llevar paraguas."

## Limitaciones Conocidas

1. El servidor MCP actual solo soporta un conjunto limitado de ubicaciones
2. Los datos meteorológicos son simulados y no en tiempo real
3. No hay persistencia de mensajes entre recargas de página

## Próximos Pasos

1. Integrar con un servicio meteorológico real
2. Añadir soporte para pronósticos extendidos
3. Mejorar la detección de ubicaciones en consultas
4. Añadir visualizaciones gráficas del clima
