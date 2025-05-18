# Guía de Integración de MCP (Model Context Protocol) en un Asistente IA

Esta guía detalla los pasos necesarios para integrar el Model Context Protocol (MCP) en un asistente de IA basado en el repositorio [asistentes-ia-v02](https://github.com/Pac00n/asistentes-ia-v02), permitiendo que el asistente pueda conectarse a diferentes herramientas externas.

## Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración del Entorno](#configuración-del-entorno)
3. [Integración de MCP en el Proyecto](#integración-de-mcp-en-el-proyecto)
4. [Configuración de Herramientas MCP](#configuración-de-herramientas-mcp)
5. [Implementación del Cliente MCP](#implementación-del-cliente-mcp)
6. [Configuración del Asistente para Usar MCP](#configuración-del-asistente-para-usar-mcp)
7. [Pruebas y Depuración](#pruebas-y-depuración)
8. [Despliegue en Vercel](#despliegue-en-vercel)

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- Node.js (versión 18 o superior)
- npm o pnpm
- Git
- Una cuenta en OpenAI con acceso a la API
- Una cuenta en Supabase
- Una cuenta en GitHub
- Una cuenta en Vercel (para el despliegue)

## Configuración del Entorno

1. Clona el repositorio del asistente:

```bash
git clone https://github.com/Pac00n/asistentes-ia-v02.git
cd asistentes-ia-v02
```

2. Instala las dependencias:

```bash
npm install
# o si prefieres usar pnpm
pnpm install
```

3. Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```
# OpenAI API Key
OPENAI_API_KEY=sk-tu-clave-de-api

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon
SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role

# Configuración MCP - Modo de desarrollo
NEXT_PUBLIC_MCP_DEV_MODE=true
```

## Integración de MCP en el Proyecto

1. Instala las dependencias de MCP:

```bash
npm install @modelcontextprotocol/core @modelcontextprotocol/react
# o con pnpm
pnpm add @modelcontextprotocol/core @modelcontextprotocol/react
```

2. Crea una estructura de directorios para MCP:

```bash
mkdir -p lib/mcp
mkdir -p components/mcp
```

3. Crea un archivo de configuración MCP en `lib/mcp/config.ts`:

```typescript
// lib/mcp/config.ts
import { MCPConfig } from '@modelcontextprotocol/core';

export const mcpConfig: MCPConfig = {
  devMode: process.env.NEXT_PUBLIC_MCP_DEV_MODE === 'true',
  // Puedes agregar más configuraciones según sea necesario
};
```

## Configuración de Herramientas MCP

1. Crea un archivo para definir las herramientas MCP en `lib/mcp/tools.ts`:

```typescript
// lib/mcp/tools.ts
import { Tool } from '@modelcontextprotocol/core';

// Define tus herramientas MCP
export const mcpTools: Tool[] = [
  {
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
    handler: async ({ query }) => {
      // Implementa la lógica de búsqueda aquí
      // Por ejemplo, podrías usar una API de búsqueda
      console.log(`Buscando: ${query}`);
      return { results: [`Resultados para: ${query}`] };
    },
  },
  // Puedes agregar más herramientas según sea necesario
];
```

2. Crea un componente para el consentimiento de herramientas en `components/mcp/ToolConsent.tsx`:

```typescript
// components/mcp/ToolConsent.tsx
import React from 'react';
import { useMCP } from '@modelcontextprotocol/react';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui';

export function ToolConsent() {
  const { pendingTools, approveTool, denyTool } = useMCP();

  if (!pendingTools.length) return null;

  const tool = pendingTools[0];

  return (
    <Dialog open={!!tool}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Permiso para usar herramienta</DialogTitle>
          <DialogDescription>
            El asistente solicita permiso para usar la herramienta: <strong>{tool?.name}</strong>
            <p>{tool?.description}</p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => denyTool(tool.id)}>
            Denegar
          </Button>
          <Button onClick={() => approveTool(tool.id)}>
            Permitir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## Implementación del Cliente MCP

1. Crea un proveedor MCP en `components/mcp/MCPProvider.tsx`:

```typescript
// components/mcp/MCPProvider.tsx
import React from 'react';
import { MCPProvider as CoreMCPProvider } from '@modelcontextprotocol/react';
import { mcpConfig } from '@/lib/mcp/config';
import { mcpTools } from '@/lib/mcp/tools';
import { ToolConsent } from './ToolConsent';

export function MCPProvider({ children }: { children: React.ReactNode }) {
  return (
    <CoreMCPProvider config={mcpConfig} tools={mcpTools}>
      {children}
      <ToolConsent />
    </CoreMCPProvider>
  );
}
```

2. Integra el proveedor MCP en tu aplicación modificando `app/layout.tsx`:

```typescript
// app/layout.tsx
import { MCPProvider } from '@/components/mcp/MCPProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <MCPProvider>
          {/* Resto de tus proveedores y componentes */}
          {children}
        </MCPProvider>
      </body>
    </html>
  );
}
```

## Configuración del Asistente para Usar MCP

1. Crea un hook personalizado para usar MCP con el asistente en `hooks/useMCPAssistant.ts`:

```typescript
// hooks/useMCPAssistant.ts
import { useState, useCallback } from 'react';
import { useMCP } from '@modelcontextprotocol/react';
import OpenAI from 'openai';

// Inicializa el cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export function useMCPAssistant(assistantId: string) {
  const { registerToolCall, getToolResult } = useMCP();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (message: string, threadId?: string) => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Crear un thread si no existe
        const thread = threadId
          ? await openai.beta.threads.retrieve(threadId)
          : await openai.beta.threads.create();
        
        // Agregar el mensaje al thread
        await openai.beta.threads.messages.create(thread.id, {
          role: 'user',
          content: message,
        });
        
        // Ejecutar el asistente
        const run = await openai.beta.threads.runs.create(thread.id, {
          assistant_id: assistantId,
        });
        
        // Esperar a que el asistente complete la ejecución o requiera acción
        let currentRun = run;
        while (
          currentRun.status === 'queued' ||
          currentRun.status === 'in_progress' ||
          currentRun.status === 'requires_action'
        ) {
          if (currentRun.status === 'requires_action') {
            const toolCalls = currentRun.required_action?.submit_tool_outputs.tool_calls || [];
            
            // Procesar cada llamada a herramienta
            const toolOutputs = await Promise.all(
              toolCalls.map(async (toolCall) => {
                // Registrar la llamada a la herramienta con MCP
                const mcpToolCallId = await registerToolCall({
                  name: toolCall.function.name,
                  arguments: JSON.parse(toolCall.function.arguments),
                });
                
                // Esperar el resultado de la herramienta
                const result = await getToolResult(mcpToolCallId);
                
                return {
                  tool_call_id: toolCall.id,
                  output: JSON.stringify(result),
                };
              })
            );
            
            // Enviar los resultados de las herramientas al asistente
            currentRun = await openai.beta.threads.runs.submitToolOutputs(
              thread.id,
              currentRun.id,
              { tool_outputs: toolOutputs }
            );
          } else {
            // Esperar un momento y verificar el estado
            await new Promise((resolve) => setTimeout(resolve, 1000));
            currentRun = await openai.beta.threads.runs.retrieve(
              thread.id,
              currentRun.id
            );
          }
        }
        
        // Obtener los mensajes del asistente
        const messages = await openai.beta.threads.messages.list(thread.id);
        
        setIsLoading(false);
        return {
          threadId: thread.id,
          messages: messages.data,
        };
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
        throw err;
      }
    },
    [registerToolCall, getToolResult, assistantId]
  );

  return {
    sendMessage,
    isLoading,
    error,
  };
}
```

2. Integra el hook en tu componente de chat:

```typescript
// components/Chat.tsx
import { useState } from 'react';
import { useMCPAssistant } from '@/hooks/useMCPAssistant';

export function Chat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [threadId, setThreadId] = useState<string | undefined>();
  
  // Usa el ID de tu asistente de OpenAI
  const { sendMessage, isLoading, error } = useMCPAssistant('asst_aB9vQf9JCz7lJL1bzZKcCM1c');

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Agregar el mensaje del usuario a la UI
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: input },
    ]);
    
    const userInput = input;
    setInput('');
    
    try {
      // Enviar el mensaje al asistente
      const result = await sendMessage(userInput, threadId);
      
      // Guardar el ID del thread para futuras interacciones
      setThreadId(result.threadId);
      
      // Actualizar los mensajes en la UI
      const assistantMessages = result.messages
        .filter((msg) => msg.role === 'assistant')
        .map((msg) => ({
          role: 'assistant',
          content: msg.content[0].text.value,
        }));
      
      setMessages((prev) => [
        ...prev.filter((msg) => msg.role !== 'assistant'),
        ...assistantMessages,
      ]);
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg ${
              msg.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
            } max-w-[80%]`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="p-3 rounded-lg bg-gray-100 max-w-[80%]">
            <span className="animate-pulse">El asistente está pensando...</span>
          </div>
        )}
        {error && (
          <div className="p-3 rounded-lg bg-red-100 max-w-[80%]">
            Error: {error.message}
          </div>
        )}
      </div>
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Escribe un mensaje..."
            className="flex-1 p-2 border rounded-md"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-blue-300"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Pruebas y Depuración

1. Inicia el servidor de desarrollo:

```bash
npm run dev
# o con pnpm
pnpm dev
```

2. Abre tu navegador en `http://localhost:3000` y prueba el asistente.

3. Verifica la consola del navegador para ver los registros de depuración y posibles errores.

4. Asegúrate de que las herramientas MCP estén funcionando correctamente y que el asistente pueda acceder a ellas.

## Despliegue en Vercel

1. Crea una nueva rama para tus cambios:

```bash
git checkout -b feature/mcp-integration
```

2. Añade y confirma tus cambios:

```bash
git add .
git commit -m "Integración de MCP en el asistente"
```

3. Sube tus cambios a GitHub:

```bash
git push origin feature/mcp-integration
```

4. Configura las variables de entorno en Vercel:
   - Ve a tu proyecto en Vercel
   - Navega a "Settings" > "Environment Variables"
   - Añade todas las variables de entorno necesarias (las mismas que en `.env.local`)

5. Despliega tu aplicación:
   - Vercel detectará automáticamente los cambios en tu rama
   - Puedes forzar un despliegue desde la interfaz de Vercel si es necesario

6. Una vez desplegado, verifica que todo funcione correctamente en la URL proporcionada por Vercel.

## Consideraciones Adicionales

- **Seguridad**: Asegúrate de que las herramientas MCP tengan las restricciones adecuadas y que el usuario deba dar su consentimiento antes de que se utilicen.
- **Rendimiento**: Monitorea el rendimiento de tu aplicación, especialmente cuando se utilizan múltiples herramientas MCP.
- **Errores**: Implementa un manejo adecuado de errores para proporcionar una buena experiencia de usuario.
- **Actualizaciones**: Mantente al día con las actualizaciones de MCP y OpenAI para aprovechar las nuevas funcionalidades y mejoras.

## Recursos Adicionales

- [Documentación oficial de MCP](https://modelcontextprotocol.io)
- [Repositorio de MCP en GitHub](https://github.com/modelcontextprotocol/modelcontextprotocol)
- [Documentación de la API de OpenAI](https://platform.openai.com/docs/api-reference)
- [Documentación de Supabase](https://supabase.io/docs)
