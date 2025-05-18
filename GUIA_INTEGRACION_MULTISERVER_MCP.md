# Guía de Integración con Múltiples Servidores MCP

Este documento proporciona instrucciones detalladas para conectar tu aplicación con diferentes servidores MCP (Model Context Protocol) para acceder a diversas herramientas y funcionalidades.

## Índice
1. [Introducción a MCP](#introducción-a-mcp)
2. [Servidor MCP de Clima (Weather)](#servidor-mcp-de-clima-weather)
3. [Servidor MCP de Sistema de Archivos (Filesystem)](#servidor-mcp-de-sistema-de-archivos-filesystem)
4. [Otros Servidores MCP Populares](#otros-servidores-mcp-populares)
5. [Integración en Aplicaciones Next.js](#integración-en-aplicaciones-nextjs)
6. [Pruebas y Depuración](#pruebas-y-depuración)
7. [Mejores Prácticas](#mejores-prácticas)

## Introducción a MCP

El Model Context Protocol (MCP) es un protocolo abierto que permite a las aplicaciones de IA, como asistentes basados en LLM, acceder a herramientas y datos externos de manera estandarizada y segura.

### Componentes Principales de MCP

1. **Servidores MCP**: Proporcionan acceso a herramientas y datos específicos
2. **Clientes MCP**: Conectan aplicaciones con servidores MCP
3. **Herramientas (Tools)**: Funcionalidades específicas expuestas por los servidores

### Beneficios de Usar MCP

- Acceso estandarizado a diversas herramientas
- Seguridad y control de acceso
- Extensibilidad y modularidad
- Compatibilidad con múltiples asistentes de IA

## Servidor MCP de Clima (Weather)

### Instalación y Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/szypetike/weather-mcp-server.git
   cd weather-mcp-server
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Construir el servidor**:
   ```bash
   npm run build
   ```

4. **Configurar API Key (opcional)**:
   Si deseas usar datos reales de clima en lugar de datos simulados, necesitas una API key de OpenWeather:
   ```bash
   export OPENWEATHER_API_KEY="tu-api-key-aquí"
   ```

5. **Ejecutar el servidor**:
   ```bash
   node build/index.js
   ```

### Herramientas Disponibles

El servidor MCP de clima proporciona la siguiente herramienta:

- **get_weather**: Obtiene información del clima para una ciudad específica
  - Parámetros: `{ "city": "nombre_ciudad" }`
  - Ejemplo de respuesta:
    ```json
    {
      "location": "Madrid, ES",
      "date": "Sunday, May 18, 2025",
      "time": "4:49:00 PM",
      "temperature": {
        "current": "22°C",
        "feelsLike": "21°C"
      },
      "weather": {
        "main": "Clear",
        "description": "Cielo despejado",
        "icon": "https://openweathermap.org/img/wn/01d@2x.png"
      },
      "details": {
        "humidity": "45%",
        "pressure": "1015 hPa",
        "windSpeed": "3.5 m/s",
        "windDirection": "210°",
        "cloudiness": "5%",
        "sunrise": "6:45 AM",
        "sunset": "9:30 PM"
      },
      "source": "OpenWeather API"
    }
    ```

### Prueba de Funcionamiento

Para probar el servidor MCP de clima directamente:

```bash
# Crear un archivo de prueba
cat > test-weather.js << 'EOL'
const { spawn } = require('child_process');
const path = require('path');

// Iniciar el servidor MCP
const serverProcess = spawn('node', [path.join(__dirname, 'build/index.js')]);

// Preparar el mensaje de solicitud
const request = {
  jsonrpc: '2.0',
  id: '1',
  method: 'callTool',
  params: {
    name: 'get_weather',
    arguments: {
      city: 'Madrid'
    }
  }
};

// Enviar la solicitud al servidor
serverProcess.stdin.write(JSON.stringify(request) + '\n');

// Procesar la respuesta
serverProcess.stdout.on('data', (data) => {
  const responses = data.toString().trim().split('\n');
  responses.forEach(response => {
    try {
      const parsedResponse = JSON.parse(response);
      console.log('Respuesta del servidor MCP:');
      console.log(JSON.stringify(parsedResponse, null, 2));
      
      // Terminar el proceso después de recibir la respuesta
      setTimeout(() => {
        serverProcess.kill();
        process.exit(0);
      }, 100);
    } catch (e) {
      console.error('Error al parsear la respuesta:', e);
    }
  });
});

// Manejar errores
serverProcess.stderr.on('data', (data) => {
  console.error(`Error del servidor: ${data}`);
});
EOL

# Ejecutar la prueba
node test-weather.js
```

## Servidor MCP de Sistema de Archivos (Filesystem)

### Instalación y Configuración

1. **Instalar el paquete**:
   ```bash
   npm install -g @modelcontextprotocol/server-filesystem
   ```

2. **Crear un directorio para pruebas**:
   ```bash
   mkdir -p ~/mcp-test-files
   ```

3. **Ejecutar el servidor**:
   ```bash
   npx @modelcontextprotocol/server-filesystem ~/mcp-test-files
   ```

### Herramientas Disponibles

El servidor MCP de sistema de archivos proporciona las siguientes herramientas:

- **read_file**: Lee el contenido de un archivo
  - Parámetros: `{ "path": "ruta/al/archivo.txt" }`

- **write_file**: Crea o sobrescribe un archivo
  - Parámetros: `{ "path": "ruta/al/archivo.txt", "content": "contenido del archivo" }`

- **list_directory**: Lista el contenido de un directorio
  - Parámetros: `{ "path": "ruta/al/directorio" }`

- **create_directory**: Crea un nuevo directorio
  - Parámetros: `{ "path": "ruta/al/nuevo/directorio" }`

- **search_files**: Busca archivos que coincidan con un patrón
  - Parámetros: `{ "path": "ruta/base", "pattern": "*.txt" }`

### Prueba de Funcionamiento

Para probar el servidor MCP de sistema de archivos directamente:

```bash
# Crear un archivo de prueba
cat > test-filesystem.js << 'EOL'
const { spawn } = require('child_process');

// Iniciar el servidor MCP
const serverProcess = spawn('npx', [
  '@modelcontextprotocol/server-filesystem',
  process.env.HOME + '/mcp-test-files'
]);

// Preparar el mensaje de solicitud para escribir un archivo
const writeRequest = {
  jsonrpc: '2.0',
  id: '1',
  method: 'callTool',
  params: {
    name: 'write_file',
    arguments: {
      path: 'test.txt',
      content: 'Este es un archivo de prueba creado a través del servidor MCP.'
    }
  }
};

// Enviar la solicitud al servidor
serverProcess.stdin.write(JSON.stringify(writeRequest) + '\n');

// Esperar un momento y luego leer el archivo
setTimeout(() => {
  const readRequest = {
    jsonrpc: '2.0',
    id: '2',
    method: 'callTool',
    params: {
      name: 'read_file',
      arguments: {
        path: 'test.txt'
      }
    }
  };
  
  serverProcess.stdin.write(JSON.stringify(readRequest) + '\n');
}, 1000);

// Procesar la respuesta
serverProcess.stdout.on('data', (data) => {
  const responses = data.toString().trim().split('\n');
  responses.forEach(response => {
    try {
      const parsedResponse = JSON.parse(response);
      console.log('Respuesta del servidor MCP:');
      console.log(JSON.stringify(parsedResponse, null, 2));
      
      // Terminar después de la segunda respuesta
      if (parsedResponse.id === '2') {
        setTimeout(() => {
          serverProcess.kill();
          process.exit(0);
        }, 100);
      }
    } catch (e) {
      console.error('Error al parsear la respuesta:', e);
    }
  });
});

// Manejar errores
serverProcess.stderr.on('data', (data) => {
  console.error(`Error del servidor: ${data}`);
});
EOL

# Ejecutar la prueba
node test-filesystem.js
```

## Otros Servidores MCP Populares

### GitHub MCP Server

Proporciona acceso a repositorios, issues, pull requests y más.

```bash
# Instalación
npm install -g @modelcontextprotocol/server-github

# Ejecución
GITHUB_TOKEN=tu_token_personal npx @modelcontextprotocol/server-github
```

### Google Maps MCP Server

Proporciona acceso a búsqueda de lugares, direcciones y más.

```bash
# Instalación
npm install -g @modelcontextprotocol/server-google-maps

# Ejecución
GOOGLE_MAPS_API_KEY=tu_api_key npx @modelcontextprotocol/server-google-maps
```

### Brave Search MCP Server

Proporciona capacidades de búsqueda web.

```bash
# Instalación
npm install -g @modelcontextprotocol/server-brave-search

# Ejecución
BRAVE_API_KEY=tu_api_key npx @modelcontextprotocol/server-brave-search
```

## Integración en Aplicaciones Next.js

### Instalación de Dependencias

```bash
npm install @modelcontextprotocol/sdk
```

### Creación de un Cliente MCP Universal

```typescript
// src/lib/mcp-client.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { SseClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

export interface MCPServerConfig {
  type: 'stdio' | 'sse';
  name: string;
  command?: string;
  args?: string[];
  url?: string;
}

export async function createMCPClient(config: MCPServerConfig) {
  try {
    // Crear el cliente MCP
    const client = new Client({ name: 'mcp-asistente-app', version: '1.0.0' });
    
    // Configurar el transporte según el tipo
    let transport;
    if (config.type === 'stdio' && config.command) {
      transport = new StdioClientTransport({
        command: config.command,
        args: config.args || [],
      });
    } else if (config.type === 'sse' && config.url) {
      transport = new SseClientTransport({
        url: config.url,
      });
    } else {
      throw new Error('Configuración de transporte inválida');
    }
    
    // Conectar el cliente al transporte
    client.connect(transport);
    
    // Listar las herramientas disponibles
    const toolsResult = await client.listTools();
    console.log(`Herramientas disponibles en ${config.name}:`, 
      toolsResult.tools.map(tool => tool.name));
    
    return {
      client,
      transport,
      tools: toolsResult.tools,
      name: config.name
    };
  } catch (error) {
    console.error(`Error al crear cliente MCP para ${config.name}:`, error);
    throw error;
  }
}

export async function callMCPTool(client: any, toolName: string, args: any) {
  try {
    const result = await client.callTool(toolName, args);
    return result;
  } catch (error) {
    console.error(`Error al llamar a la herramienta ${toolName}:`, error);
    throw error;
  }
}
```

### Componente de Selección de Servidor MCP

```typescript
// src/components/MCPServerSelector.tsx
'use client';

import { useState } from 'react';
import { createMCPClient, MCPServerConfig } from '@/lib/mcp-client';

const predefinedServers: MCPServerConfig[] = [
  {
    type: 'stdio',
    name: 'weather',
    command: 'node',
    args: ['/ruta/a/weather-mcp-server/build/index.js']
  },
  {
    type: 'stdio',
    name: 'filesystem',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/ruta/a/archivos']
  },
  {
    type: 'sse',
    name: 'github',
    url: 'http://localhost:3002/mcp'
  }
];

export default function MCPServerSelector({ onClientCreated }) {
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const serverConfig = predefinedServers.find(s => s.name === selectedServer);
      if (!serverConfig) {
        throw new Error('Servidor no encontrado');
      }
      
      const mcpClient = await createMCPClient(serverConfig);
      onClientCreated(mcpClient);
    } catch (err) {
      setError(`Error al conectar: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium mb-3">Conectar a Servidor MCP</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Seleccionar Servidor
        </label>
        <select
          value={selectedServer}
          onChange={(e) => setSelectedServer(e.target.value)}
          className="w-full p-2 border rounded"
          disabled={isConnecting}
        >
          <option value="">-- Seleccionar --</option>
          {predefinedServers.map(server => (
            <option key={server.name} value={server.name}>
              {server.name}
            </option>
          ))}
        </select>
      </div>
      
      <button
        onClick={handleConnect}
        disabled={!selectedServer || isConnecting}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
      >
        {isConnecting ? 'Conectando...' : 'Conectar'}
      </button>
      
      {error && (
        <div className="mt-3 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
```

### Integración con el Flujo de Chat

```typescript
// Modificación en ChatInterface.tsx
import { useState, useEffect } from 'react';
import MCPServerSelector from './MCPServerSelector';
import { callMCPTool } from '@/lib/mcp-client';

// Dentro del componente ChatInterface
const [mcpClients, setMcpClients] = useState<any[]>([]);

const handleMCPClientCreated = (newClient) => {
  setMcpClients(prev => [...prev, newClient]);
};

// Función para encontrar un cliente MCP adecuado para una herramienta
const findMCPClientForTool = (toolName) => {
  for (const client of mcpClients) {
    const hasTool = client.tools.some(tool => tool.name === toolName);
    if (hasTool) {
      return client;
    }
  }
  return null;
};

// Modificación en la función handleSendMessage
const handleSendMessage = async () => {
  // ... código existente ...
  
  try {
    // Si hay una llamada a herramienta
    if (toolCall) {
      // Buscar un cliente MCP que tenga la herramienta solicitada
      const mcpClient = findMCPClientForTool(toolCall.name);
      
      if (mcpClient) {
        console.log(`Usando cliente MCP "${mcpClient.name}" para la herramienta "${toolCall.name}"`);
        
        // Usar el cliente MCP para llamar a la herramienta
        const result = await callMCPTool(mcpClient.client, toolCall.name, toolCall.arguments);
        
        // Notificar sobre el resultado de la herramienta
        handleToolResult({
          toolCallId: toolCall.id,
          content: JSON.stringify(result),
        });
        
        // No ejecutar la herramienta simulada
        return;
      }
    }
    
    // Continuar con el flujo normal para herramientas simuladas
    // ... código existente ...
  } catch (err) {
    console.error('Error al procesar mensaje con MCP:', err);
    setError('Error al comunicarse con el servidor MCP. Revisa la consola para más detalles.');
  }
};

// Añadir el selector de servidor MCP al componente
return (
  <div>
    {/* ... código existente ... */}
    
    <div className="mb-4">
      <MCPServerSelector onClientCreated={handleMCPClientCreated} />
      
      {mcpClients.length > 0 && (
        <div className="mt-2">
          <h4 className="font-medium">Servidores MCP conectados:</h4>
          <ul className="list-disc pl-5">
            {mcpClients.map((client, index) => (
              <li key={index}>
                {client.name} - {client.tools.length} herramientas disponibles
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
    
    {/* ... resto del componente ... */}
  </div>
);
```

## Pruebas y Depuración

### Verificación de Conexión

Para verificar que la conexión con un servidor MCP está funcionando correctamente:

```typescript
async function testMCPConnection(config) {
  try {
    const { client, tools } = await createMCPClient(config);
    console.log('Conexión exitosa');
    console.log('Herramientas disponibles:', tools.map(t => t.name));
    return true;
  } catch (error) {
    console.error('Error de conexión:', error);
    return false;
  }
}
```

### Depuración de Llamadas a Herramientas

Para depurar llamadas a herramientas MCP:

```typescript
async function debugMCPToolCall(client, toolName, args) {
  console.log(`Llamando a herramienta "${toolName}" con argumentos:`, args);
  
  try {
    const startTime = Date.now();
    const result = await callMCPTool(client, toolName, args);
    const endTime = Date.now();
    
    console.log(`Herramienta "${toolName}" ejecutada en ${endTime - startTime}ms`);
    console.log('Resultado:', result);
    
    return result;
  } catch (error) {
    console.error(`Error al llamar a herramienta "${toolName}":`, error);
    throw error;
  }
}
```

## Mejores Prácticas

### Gestión de Múltiples Servidores MCP

1. **Priorización de servidores**: Define un orden de prioridad para los servidores cuando múltiples servidores ofrecen la misma herramienta.

2. **Caché de resultados**: Implementa un sistema de caché para evitar llamadas repetidas a herramientas con los mismos argumentos.

3. **Manejo de errores robusto**: Implementa reintentos y fallbacks cuando un servidor MCP no responde o falla.

### Seguridad

1. **Validación de entradas**: Valida siempre los argumentos antes de pasarlos a las herramientas MCP.

2. **Control de acceso**: Limita qué herramientas pueden ser llamadas según el contexto de la aplicación.

3. **Monitoreo**: Registra todas las llamadas a herramientas MCP para auditoría y depuración.

### Rendimiento

1. **Conexión perezosa**: Conecta a los servidores MCP solo cuando sea necesario.

2. **Paralelización**: Ejecuta llamadas a herramientas en paralelo cuando sea posible.

3. **Tiempo de espera**: Establece tiempos de espera adecuados para evitar bloqueos.

## Conclusión

La integración con múltiples servidores MCP permite a tu aplicación acceder a una amplia gama de herramientas y funcionalidades de manera estandarizada y segura. Siguiendo esta guía, podrás conectar tu aplicación con servidores MCP para clima, sistema de archivos y muchas otras funcionalidades, enriqueciendo la experiencia de tus usuarios.

Para más información, consulta la [documentación oficial de MCP](https://modelcontextprotocol.io) y los repositorios de referencia en [GitHub](https://github.com/modelcontextprotocol).
