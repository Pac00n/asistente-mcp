# Pruebas con Servidor MCP Real: Filesystem

Este documento detalla el proceso de configuración, conexión y pruebas con un servidor MCP real (Filesystem) para validar la integración con nuestro asistente.

## 1. Selección del Servidor MCP

Después de investigar los servidores MCP disponibles en el repositorio oficial [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers), hemos seleccionado el servidor **Filesystem** por las siguientes razones:

- Es uno de los servidores de referencia oficiales
- Proporciona funcionalidad útil y fácil de probar (operaciones de archivos)
- Tiene documentación clara sobre su instalación y uso
- Se puede ejecutar localmente con Docker o NPX
- Tiene herramientas bien definidas que podemos integrar con nuestro asistente

## 2. Instalación del Servidor MCP Filesystem

### Opción 1: Instalación con Docker

```bash
# Clonar el repositorio de servidores MCP
git clone https://github.com/modelcontextprotocol/servers.git
cd servers

# Construir la imagen Docker del servidor Filesystem
docker build -t mcp/filesystem -f src/filesystem/Dockerfile .

# Ejecutar el servidor, montando un directorio para pruebas
docker run -i --rm \
  --mount type=bind,src=/home/ubuntu/mcp_asistente_app/mcp-server-test,dst=/projects/test \
  mcp/filesystem \
  /projects
```

### Opción 2: Instalación con NPX (más sencilla)

```bash
# Crear un directorio para pruebas
mkdir -p /home/ubuntu/mcp_asistente_app/mcp-server-test/files

# Ejecutar el servidor MCP Filesystem con NPX
npx -y @modelcontextprotocol/server-filesystem /home/ubuntu/mcp_asistente_app/mcp-server-test/files
```

## 3. Modificación de la Aplicación para Conectar con el Servidor MCP Real

Para conectar nuestra aplicación con el servidor MCP real, necesitamos modificar el código para establecer una conexión con el servidor a través del protocolo adecuado. A continuación se muestra cómo implementar esta conexión:

### 3.1. Instalación de Dependencias Necesarias

```bash
cd /home/ubuntu/mcp_asistente_app
npm install @modelcontextprotocol/sdk
```

### 3.2. Creación del Cliente MCP

Creamos un nuevo archivo para la integración con el servidor MCP real:

```typescript
// src/lib/mcp-client.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export async function createMCPClient(serverCommand: string, serverArgs: string[]) {
  try {
    // Crear el cliente MCP
    const client = new Client({ name: 'mcp-asistente-app', version: '1.0.0' });
    
    // Configurar el transporte para conectar con el servidor
    const transport = new StdioClientTransport({
      command: serverCommand,
      args: serverArgs,
    });
    
    // Conectar el cliente al transporte
    client.connect(transport);
    
    // Listar las herramientas disponibles
    const toolsResult = await client.listTools();
    console.log('Herramientas MCP disponibles:', toolsResult.tools.map(tool => tool.name));
    
    return {
      client,
      transport,
      tools: toolsResult.tools
    };
  } catch (error) {
    console.error('Error al crear cliente MCP:', error);
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

### 3.3. Integración con el Asistente

Modificamos nuestro componente de chat para incluir la opción de usar el servidor MCP real:

```typescript
// Añadir a ChatInterface.tsx
import { createMCPClient, callMCPTool } from '@/lib/mcp-client';
import { useState, useEffect } from 'react';

// Dentro del componente ChatInterface
const [mcpClient, setMcpClient] = useState<any>(null);
const [mcpTools, setMcpTools] = useState<any[]>([]);
const [usingRealMCP, setUsingRealMCP] = useState<boolean>(false);

// Función para inicializar el cliente MCP
const initMCPClient = async () => {
  try {
    // Configuración para el servidor Filesystem
    const serverCommand = 'npx';
    const serverArgs = [
      '-y',
      '@modelcontextprotocol/server-filesystem',
      '/home/ubuntu/mcp_asistente_app/mcp-server-test/files'
    ];
    
    const { client, tools } = await createMCPClient(serverCommand, serverArgs);
    setMcpClient(client);
    setMcpTools(tools);
    setUsingRealMCP(true);
    console.log('Cliente MCP inicializado correctamente');
  } catch (error) {
    console.error('Error al inicializar cliente MCP:', error);
    setError('No se pudo conectar al servidor MCP real. Usando simulación.');
  }
};

// Botón para activar MCP real
<button 
  onClick={initMCPClient}
  disabled={usingRealMCP}
  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
>
  {usingRealMCP ? 'Usando MCP Real' : 'Activar MCP Real'}
</button>
```

## 4. Pruebas Funcionales con el Servidor MCP Real

Una vez configurada la conexión, realizamos las siguientes pruebas para validar la integración:

### 4.1. Prueba de Listado de Herramientas

Verificamos que podemos obtener la lista de herramientas disponibles en el servidor MCP Filesystem:

```typescript
// Código de prueba
const { tools } = await createMCPClient('npx', [
  '-y',
  '@modelcontextprotocol/server-filesystem',
  '/home/ubuntu/mcp_asistente_app/mcp-server-test/files'
]);

console.log('Herramientas disponibles:');
tools.forEach(tool => {
  console.log(`- ${tool.name}: ${tool.description}`);
});
```

**Resultado esperado**: Lista de herramientas como `read_file`, `write_file`, `list_directory`, etc.

### 4.2. Prueba de Escritura de Archivo

Probamos la funcionalidad de escritura de archivos:

```typescript
// Código de prueba
const result = await callMCPTool(mcpClient, 'write_file', {
  path: 'test.txt',
  content: 'Este es un archivo de prueba creado a través del servidor MCP real.'
});

console.log('Resultado de escritura:', result);
```

**Resultado esperado**: Archivo `test.txt` creado en el directorio de pruebas.

### 4.3. Prueba de Lectura de Archivo

Verificamos que podemos leer el archivo creado:

```typescript
// Código de prueba
const result = await callMCPTool(mcpClient, 'read_file', {
  path: 'test.txt'
});

console.log('Contenido del archivo:', result.content);
```

**Resultado esperado**: Contenido del archivo `test.txt`.

### 4.4. Prueba de Listado de Directorio

Probamos la funcionalidad de listar directorios:

```typescript
// Código de prueba
const result = await callMCPTool(mcpClient, 'list_directory', {
  path: '.'
});

console.log('Contenido del directorio:', result.entries);
```

**Resultado esperado**: Lista de archivos y directorios en el directorio de pruebas.

## 5. Integración con el Flujo de Chat

Para integrar completamente el servidor MCP real con nuestro asistente, modificamos la función de procesamiento de mensajes:

```typescript
// Modificación en la función handleSendMessage en ChatInterface.tsx
const handleSendMessage = async () => {
  // ... código existente ...
  
  try {
    // Si estamos usando MCP real y la herramienta solicitada está disponible
    if (usingRealMCP && mcpClient && toolCall) {
      const mcpTool = mcpTools.find(t => t.name === toolCall.name);
      
      if (mcpTool) {
        // Usar el servidor MCP real en lugar de la simulación
        const result = await callMCPTool(mcpClient, toolCall.name, toolCall.arguments);
        
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
    console.error('Error al procesar mensaje con MCP real:', err);
    setError('Error al comunicarse con el servidor MCP. Revisa la consola para más detalles.');
  }
};
```

## 6. Resultados y Conclusiones

### 6.1. Ventajas de la Integración con MCP Real

- **Funcionalidad real**: Las operaciones de archivo se realizan realmente en el sistema de archivos, no son simuladas.
- **Extensibilidad**: Se pueden añadir más servidores MCP siguiendo el mismo patrón de integración.
- **Seguridad**: El servidor MCP proporciona un entorno aislado y controlado para las operaciones.
- **Estándar abierto**: Seguimos un protocolo estándar que es compatible con múltiples clientes y servidores.

### 6.2. Desafíos Encontrados

- **Configuración inicial**: La configuración del servidor MCP requiere pasos adicionales.
- **Dependencias**: Es necesario instalar dependencias adicionales para la integración.
- **Gestión de errores**: Es importante manejar adecuadamente los errores de conexión y ejecución.

### 6.3. Mejoras Futuras

- **Interfaz de configuración**: Añadir una interfaz para configurar y seleccionar diferentes servidores MCP.
- **Caché de resultados**: Implementar un sistema de caché para mejorar el rendimiento.
- **Integración con más servidores**: Añadir soporte para otros servidores MCP como GitHub, Google Maps, etc.

## 7. Referencias

- [Repositorio oficial de servidores MCP](https://github.com/modelcontextprotocol/servers)
- [Documentación del servidor Filesystem](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)
- [SDK de MCP para JavaScript/TypeScript](https://github.com/modelcontextprotocol/typescript-sdk)
