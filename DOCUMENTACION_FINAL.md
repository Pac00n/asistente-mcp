# Documentación Final: Asistente MCP con Integración Multiservidor

## Resumen del Proyecto

Este proyecto implementa un asistente de IA con integración de Model Context Protocol (MCP) que permite conectar con múltiples servidores MCP para acceder a diversas herramientas y funcionalidades. El asistente utiliza la API de OpenAI para conectarse a un asistente específico y puede alternar entre simulación de herramientas y conexión con servidores MCP reales.

## Características Principales

- **Interfaz de chat fluida y agradable**: Diseño limpio y responsivo para una experiencia de usuario óptima
- **Integración con OpenAI**: Conexión directa con el asistente de OpenAI mediante API
- **Soporte para múltiples servidores MCP**: Capacidad para conectar con diferentes servidores MCP simultáneamente
- **Herramientas disponibles**:
  - Simuladas: Búsqueda web, clima, cálculos matemáticos
  - Reales (vía MCP): Clima (weather), sistema de archivos (filesystem), y más
- **Manejo robusto de errores**: Gestión adecuada de problemas de conexión, autenticación y ejecución
- **Visualización de llamadas a herramientas**: Interfaz que muestra claramente las llamadas y resultados de herramientas

## Estructura del Proyecto

```
mcp_asistente_app/
├── .env.local           # Variables de entorno (API keys)
├── .env.example         # Ejemplo de variables de entorno
├── src/
│   ├── app/
│   │   └── page.tsx     # Página principal
│   ├── components/
│   │   ├── ChatInterface.tsx  # Componente de interfaz de chat
│   │   └── MCPServerSelector.tsx # Selector de servidores MCP
│   └── lib/
│       ├── openai.ts    # Integración con OpenAI
│       ├── mcp-client.ts # Cliente MCP universal
│       ├── tools.ts     # Definición de herramientas simuladas
│       └── types.ts     # Tipos TypeScript
├── mcp-server-test/     # Pruebas con servidores MCP reales
│   ├── files/           # Directorio para pruebas de filesystem
│   ├── weather-mcp-server/ # Servidor MCP de clima clonado
│   ├── GUIA_INTEGRACION_MULTISERVER_MCP.md # Guía detallada de integración
│   └── PRUEBA_FUNCIONAL_WEATHER_MCP.md # Resultados de pruebas
├── public/              # Archivos estáticos
└── package.json         # Dependencias y scripts
```

## Servidores MCP Integrados y Probados

### 1. Servidor MCP de Clima (Weather)

- **Repositorio**: [szypetike/weather-mcp-server](https://github.com/szypetike/weather-mcp-server)
- **Funcionalidad**: Proporciona información del clima para ciudades de todo el mundo
- **Herramientas**: `get_weather`
- **Estado**: Integrado y probado con éxito

### 2. Servidor MCP de Sistema de Archivos (Filesystem)

- **Paquete**: [@modelcontextprotocol/server-filesystem](https://www.npmjs.com/package/@modelcontextprotocol/server-filesystem)
- **Funcionalidad**: Operaciones de archivos y directorios en un entorno controlado
- **Herramientas**: `read_file`, `write_file`, `list_directory`, `create_directory`, `search_files`
- **Estado**: Documentado con instrucciones detalladas de integración

## Guía de Instalación y Configuración

### Requisitos Previos

- Node.js 18.0.0 o superior
- NPM 8.0.0 o superior
- Cuenta de OpenAI con acceso a la API de Asistentes
- API key de OpenAI válida

### Instalación del Proyecto Base

1. Clona el repositorio:
```bash
git clone <URL_DEL_REPOSITORIO>
cd mcp_asistente_app
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
   - Copia el archivo `.env.example` a `.env.local`
   - Actualiza las variables con tu API key de OpenAI y el ID del asistente
```bash
cp .env.example .env.local
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

### Instalación de Servidores MCP

#### Servidor MCP de Clima (Weather)

1. Clona el repositorio:
```bash
git clone https://github.com/szypetike/weather-mcp-server.git
cd weather-mcp-server
```

2. Instala las dependencias:
```bash
npm install
```

3. Construye el servidor:
```bash
npm run build
```

4. Ejecuta el servidor:
```bash
node build/index.js
```

#### Servidor MCP de Sistema de Archivos (Filesystem)

1. Instala el paquete globalmente:
```bash
npm install -g @modelcontextprotocol/server-filesystem
```

2. Crea un directorio para pruebas:
```bash
mkdir -p ~/mcp-test-files
```

3. Ejecuta el servidor:
```bash
npx @modelcontextprotocol/server-filesystem ~/mcp-test-files
```

## Uso del Asistente con Servidores MCP

### Modo Simulación (Predeterminado)

Por defecto, el asistente utiliza simulación de herramientas MCP. Puedes interactuar con él normalmente:

1. Escribe un mensaje en el campo de texto y presiona Enter o haz clic en "Enviar".
2. El asistente responderá y utilizará herramientas simuladas cuando sea necesario.

### Modo Servidor MCP Real

Para utilizar servidores MCP reales:

1. Inicia uno o más servidores MCP como se describe en la sección anterior.
2. En la interfaz del asistente, utiliza el selector de servidores MCP para conectarte a los servidores disponibles.
3. Una vez conectado, el asistente utilizará automáticamente las herramientas del servidor MCP real cuando estén disponibles.

### Ejemplos de Uso

#### Consulta del Clima (Servidor Weather MCP)

Usuario: "¿Cuál es el clima en Madrid?"

Respuesta: El asistente utilizará el servidor MCP de clima para obtener información actualizada sobre el clima en Madrid, incluyendo temperatura, condiciones, humedad, etc.

#### Operaciones de Archivos (Servidor Filesystem MCP)

Usuario: "Crea un archivo llamado notas.txt con el contenido 'Recordatorio: reunión mañana'"

Respuesta: El asistente utilizará el servidor MCP de sistema de archivos para crear el archivo solicitado y confirmará la operación.

## Depuración y Solución de Problemas

### Errores Comunes

#### Error de Conexión con Servidor MCP

**Síntoma**: "Error al conectar con el servidor MCP"

**Soluciones**:
- Verifica que el servidor MCP esté en ejecución
- Comprueba que no haya otro proceso utilizando el mismo puerto
- Revisa los logs del servidor MCP para identificar errores específicos

#### Error de Autenticación con OpenAI

**Síntoma**: "Error 401: Incorrect API key provided"

**Soluciones**:
- Verifica que la API key en `.env.local` sea válida y esté activa
- Asegúrate de que la API key tenga permisos para acceder a la API de Asistentes
- Comprueba que el formato de la API key sea correcto (debe comenzar con `sk-`)

#### Herramienta No Disponible

**Síntoma**: "La herramienta solicitada no está disponible"

**Soluciones**:
- Verifica que estés conectado al servidor MCP correcto
- Comprueba que el servidor MCP exponga la herramienta solicitada
- Revisa los permisos y configuración del servidor MCP

### Logs y Diagnóstico

Para un diagnóstico más detallado:

1. Abre la consola del navegador (F12 o Ctrl+Shift+I)
2. Revisa los mensajes en la pestaña "Console"
3. Los errores y mensajes de depuración proporcionarán información sobre problemas específicos

## Mejoras y Extensiones Futuras

### Añadir Nuevos Servidores MCP

Para añadir soporte para nuevos servidores MCP:

1. Instala y configura el servidor MCP deseado
2. Actualiza el componente `MCPServerSelector.tsx` para incluir el nuevo servidor
3. Añade la configuración correspondiente en el array `predefinedServers`

### Personalizar la Interfaz

La interfaz de chat está implementada en `src/components/ChatInterface.tsx`. Puedes modificar este archivo para cambiar el diseño, colores o comportamiento de la interfaz.

### Implementar Caché de Resultados

Para mejorar el rendimiento, considera implementar un sistema de caché para los resultados de las herramientas MCP:

```typescript
// Ejemplo simplificado de implementación de caché
const mcpResultsCache = new Map();

async function callMCPToolWithCache(client, toolName, args) {
  // Crear una clave única basada en la herramienta y los argumentos
  const cacheKey = `${toolName}:${JSON.stringify(args)}`;
  
  // Verificar si el resultado está en caché
  if (mcpResultsCache.has(cacheKey)) {
    return mcpResultsCache.get(cacheKey);
  }
  
  // Llamar a la herramienta y almacenar el resultado en caché
  const result = await callMCPTool(client, toolName, args);
  mcpResultsCache.set(cacheKey, result);
  
  return result;
}
```

## Conclusiones y Recomendaciones

La integración de servidores MCP en el asistente proporciona una gran flexibilidad y potencia, permitiendo acceder a diversas herramientas y funcionalidades de manera estandarizada y segura. Basándonos en nuestras pruebas y experiencia, recomendamos:

1. **Comenzar con servidores simples**: Inicia con servidores MCP bien documentados y probados como Weather y Filesystem.

2. **Implementar manejo robusto de errores**: Los servidores MCP pueden fallar por diversas razones, es importante manejar estos casos adecuadamente.

3. **Considerar la experiencia de usuario**: Proporciona retroalimentación clara sobre el estado de la conexión con los servidores MCP y las operaciones en curso.

4. **Explorar el ecosistema MCP**: El ecosistema de servidores MCP está en constante crecimiento, explora nuevas opciones regularmente.

5. **Contribuir a la comunidad**: Si desarrollas mejoras o nuevos servidores MCP, considera compartirlos con la comunidad.

## Referencias y Recursos Adicionales

- [Documentación oficial de MCP](https://modelcontextprotocol.io)
- [Repositorio oficial de servidores MCP](https://github.com/modelcontextprotocol/servers)
- [SDK de MCP para JavaScript/TypeScript](https://github.com/modelcontextprotocol/typescript-sdk)
- [Guía detallada de integración multiserver](./mcp-server-test/GUIA_INTEGRACION_MULTISERVER_MCP.md)
- [Resultados de pruebas con servidor Weather MCP](./mcp-server-test/PRUEBA_FUNCIONAL_WEATHER_MCP.md)

---

Este proyecto demuestra la potencia y flexibilidad del protocolo MCP para conectar asistentes de IA con servicios externos, proporcionando una base sólida para futuras extensiones y mejoras.
