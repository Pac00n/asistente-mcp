# Backend del Asistente de IA

Este directorio contiene los archivos esenciales del backend para el asistente de IA. Está diseñado para ser desplegado como un servicio API que puede ser consumido por cualquier frontend.

## Componentes del Backend:

1.  **`api_chat_route/route.ts`**: (Originalmente `src/app/api/chat/route.ts`)
    *   Es el endpoint principal de la API (método POST) que recibe los mensajes del usuario y el historial.
    *   Se conecta al Asistente de OpenAI.
    *   Maneja la lógica de `tool_calls` de OpenAI.
    *   Se comunica con herramientas (como el servicio de clima, ya sea directamente a Open-Meteo o a través del `mock-mcp-server.js`).
    *   Devuelve la respuesta del asistente al cliente que realiza la solicitud.

2.  **`mock_server/mock-mcp-server.js`**: (Opcional, para desarrollo/pruebas locales)
    *   Un servidor Express simple que simula un endpoint MCP para la herramienta del clima.
    *   Este servidor, a su vez, llama a la API de Open-Meteo.
    *   Si el backend (`api_chat_route/route.ts`) está configurado para usarlo (ver variable `MCP_SERVER_URL`), se comunicará con este mock.

3.  **`config/package.json` (Fragmento)**:
    *   Muestra las dependencias clave necesarias para ejecutar este backend (ej. `openai`, `express`, `cors`, `node-fetch`). El frontend consumidor necesitará su propio `package.json`.

4.  **`config/env.example`**:
    *   Variables de entorno necesarias para el backend. Renombrar a `.env.local` (o configurar en el entorno de despliegue) con los valores reales.

## Cómo Usar este Backend con Otro Frontend:

1.  **Despliegue:**
    *   Puedes desplegar el contenido de `api_chat_route/` como una función serverless (ej. Vercel, AWS Lambda, Google Cloud Functions) o dentro de un servidor Node.js más grande.
    *   El `mock-mcp-server.js` (si se usa) necesitaría ejecutarse como un proceso separado si `api_chat_route` lo espera.

2.  **Configuración de Variables de Entorno:**
    *   `OPENAI_API_KEY` o `NEXT_PUBLIC_OPENAI_API_KEY`: Tu clave API de OpenAI.
    *   `NEXT_PUBLIC_OPENAI_ASSISTANT_ID`: El ID de tu Asistente de OpenAI configurado para usar herramientas.
    *   `MCP_SERVER_URL` (Opcional): URL del `mock-mcp-server.js` si se usa (ej. `http://localhost:3001`).
    *   `USE_OPEN_METEO` (Opcional): Si se establece a `'true'`, la herramienta de clima en `api_chat_route` intentará usar Open-Meteo directamente.

3.  **Llamadas desde el Nuevo Frontend:**
    *   El nuevo frontend deberá hacer solicitudes POST al endpoint donde hayas desplegado `api_chat_route/route.ts`.
    *   El cuerpo de la solicitud debe ser un JSON con la estructura esperada por `api_chat_route` (generalmente `{ message: string, conversationHistory?: Message[] }`).
    *   La respuesta será un JSON con el mensaje del asistente o un error.

## Dependencias Clave (referencia para `package.json` del backend):

*   `openai`: Para interactuar con la API de OpenAI.
*   `express`, `cors`: Si decides ejecutar el `mock-mcp-server.js`.
*   `node-fetch`: Si usas Node.js < 18 o para consistencia en llamadas fetch en el backend.

**Nota sobre Tipos:** Los tipos de TypeScript (como `Message`, `ChatRequest`) usados en `api_chat_route` deberían ser compartidos o replicados en el nuevo frontend para asegurar la compatibilidad de las solicitudes y respuestas.
