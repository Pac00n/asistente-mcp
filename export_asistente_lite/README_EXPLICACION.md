# Explicación de la Implementación del Asistente (Estado Funcional - Rama Main)

Este directorio contiene los archivos clave de la rama `main` para comprender y replicar la funcionalidad básica de un asistente de IA con conexión a OpenAI y una herramienta de clima (simulada o directa).

## Estructura de los Archivos Exportados:

### 1. Frontend (`frontend/`)
   - `ChatInterface.tsx`: Componente principal de la interfaz de chat React (estado en `main`).
   - `page_principal.tsx`: (`src/app/page.tsx`) Renderiza `ChatInterface` en la página de inicio.
   - `layout_principal.tsx`: (`src/app/layout.tsx`) Layout raíz de Next.js.
   - `ui/`: En la rama `main`, los componentes de UI son más simples (HTML estándar o clases básicas de Tailwind), ya que la refactorización visual no se aplicó aquí.
   - `lib_utils.ts`: (Si existe en `main`, se incluirá; de lo contrario, se omitirá si no era necesario para la funcionalidad base).

### 2. Backend (`backend/`)
   - `chat_api_route.ts`: (`src/app/api/chat/route.ts`) Endpoint que maneja la lógica con OpenAI y herramientas.

### 3. Tipos (`types/`)
   - Contiene las definiciones de TypeScript (ej. `Message`, `ChatRequest`).

### 4. Servidor Mock (`mock_server/`)
   - `mock-mcp-server.js`: Servidor Express para simular el endpoint de clima MCP.

### 5. Configuración del Proyecto (`config/`)
   - `package.json`: Dependencias.
   - `tailwind.config.js`: Configuración de Tailwind CSS (estado en `main`).
   - `postcss.config.js`: Configuración de PostCSS (estado en `main`).
   - `globals.css`: Estilos CSS globales (estado en `main`).
   - `next.config.js`: Configuración de Next.js.
   - `env.example`: Plantilla para las variables de entorno.

### 6. Documentación Original (`documentacion_original/`)
   - Documentos Markdown que describen la arquitectura.

## Flujo General (Rama Main):
Similar al descrito anteriormente, pero la UI del chat es la versión más simple de la rama `main`.

## Para Implementar en Otro Proyecto:

1.  **Copiar Estructura:** Use estos archivos como referencia.
2.  **Instalar Dependencias:** Según `config/package.json`.
3.  **Variables de Entorno:** Configurar `.env.local`.
4.  **Revisar Rutas:** Ajustar importaciones.
5.  **Configuración Tailwind/PostCSS:** Usar las configuraciones de la rama `main`.
6.  **Mock Server (Opcional):** Ejecutar `node mock_server/mock-mcp-server.js`.
7.  **Ejecutar Proyecto:** `npm run dev` (o `USE_OPEN_METEO=true npm run dev` para clima directo).

Este conjunto representa la base funcional del asistente antes de los intentos de refactorización visual.
