# Documentación del Asistente MCP

## Descripción General

Este proyecto implementa un asistente de IA con integración de herramientas siguiendo el patrón de Model Context Protocol (MCP). El asistente utiliza la API de OpenAI para conectarse a un asistente específico y simula el comportamiento de MCP para proporcionar acceso a herramientas como búsqueda web, clima y cálculos matemáticos.

La aplicación está construida con Next.js, TypeScript y Tailwind CSS, ofreciendo una interfaz fluida y agradable para interactuar con el asistente.

## Características Principales

- **Interfaz de chat intuitiva**: Diseño limpio y responsivo para una experiencia de usuario óptima
- **Integración con OpenAI**: Conexión directa con el asistente de OpenAI mediante API
- **Simulación MCP**: Implementación de herramientas siguiendo el patrón de Model Context Protocol
- **Herramientas disponibles**:
  - Búsqueda web (simulada)
  - Consulta de clima
  - Cálculos matemáticos
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
│   │   └── ChatInterface.tsx  # Componente de interfaz de chat
│   └── lib/
│       ├── openai.ts    # Integración con OpenAI
│       ├── tools.ts     # Definición de herramientas MCP
│       └── types.ts     # Tipos TypeScript
├── public/              # Archivos estáticos
└── package.json         # Dependencias y scripts
```

## Requisitos Técnicos

- Node.js 18.0.0 o superior
- NPM 8.0.0 o superior
- Cuenta de OpenAI con acceso a la API de Asistentes
- API key de OpenAI válida

## Instalación

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

## Configuración de Variables de Entorno

El archivo `.env.local` debe contener las siguientes variables:

```
# OpenAI API Key
NEXT_PUBLIC_OPENAI_API_KEY=sk-tu-api-key-aqui

# ID del Asistente de OpenAI
NEXT_PUBLIC_OPENAI_ASSISTANT_ID=asst_aB9vQf9JCz7lJL1bzZKcCM1c
```

## Uso del Asistente

1. **Iniciar una conversación**: Simplemente escribe un mensaje en el campo de texto y presiona Enter o haz clic en "Enviar".

2. **Utilizar herramientas**:
   - Para el clima: "¿Cuál es el clima en [ciudad]?"
   - Para búsquedas: "Busca información sobre [tema]"
   - Para cálculos: "Calcula [expresión matemática]"

3. **Ver resultados de herramientas**: La interfaz mostrará claramente cuando se está llamando a una herramienta y el resultado obtenido.

## Integración con MCP (Model Context Protocol)

Este proyecto simula la integración con MCP mediante la implementación de herramientas que siguen el patrón de MCP:

1. **Definición de herramientas**: Cada herramienta tiene un nombre, descripción, parámetros y un manejador.

2. **Flujo de ejecución**:
   - El asistente recibe un mensaje del usuario
   - Decide si necesita llamar a una herramienta
   - La aplicación intercepta la llamada y ejecuta la herramienta correspondiente
   - El resultado se devuelve al asistente para continuar la conversación

3. **Extensibilidad**: El sistema está diseñado para facilitar la adición de nuevas herramientas siguiendo el mismo patrón.

## Despliegue en Producción

Para desplegar la aplicación en producción:

1. Construye la aplicación:
```bash
npm run build
```

2. Inicia el servidor de producción:
```bash
npm start
```

Alternativamente, puedes desplegar la aplicación en plataformas como Vercel o Netlify, que ofrecen integración directa con Next.js.

## Personalización

### Añadir Nuevas Herramientas

Para añadir una nueva herramienta, edita el archivo `src/lib/tools.ts` y añade una nueva definición siguiendo el patrón existente:

```typescript
export const miNuevaHerramienta: Tool = {
  name: 'nombre_herramienta',
  description: 'Descripción de lo que hace la herramienta',
  parameters: {
    type: 'object',
    properties: {
      // Define los parámetros que acepta la herramienta
      parametro1: {
        type: 'string',
        description: 'Descripción del parámetro',
      },
    },
    required: ['parametro1'],
  },
  handler: async (args: { parametro1: string }) => {
    // Implementa la lógica de la herramienta
    return { resultado: `Procesado: ${args.parametro1}` };
  }
};

// No olvides añadir la herramienta a la lista de herramientas disponibles
export const availableTools: Tool[] = [
  // ... herramientas existentes
  miNuevaHerramienta
];
```

### Personalizar la Interfaz

La interfaz de chat está implementada en `src/components/ChatInterface.tsx`. Puedes modificar este archivo para cambiar el diseño, colores o comportamiento de la interfaz.

## Solución de Problemas

### Error de API Key

Si ves un error relacionado con la API key:

1. Verifica que la API key en `.env.local` sea válida y esté activa
2. Asegúrate de que la API key tenga permisos para acceder a la API de Asistentes
3. Comprueba que el formato de la API key sea correcto (debe comenzar con `sk-`)

### Error de Conexión

Si la aplicación no puede conectarse a OpenAI:

1. Verifica tu conexión a internet
2. Comprueba si hay problemas con la API de OpenAI en su página de estado
3. Asegúrate de que no estás excediendo los límites de tasa de la API

### Herramientas No Funcionan

Si las herramientas no funcionan correctamente:

1. Verifica que el asistente tenga permisos para usar herramientas
2. Comprueba los logs de la consola para ver errores específicos
3. Asegúrate de que el formato de los parámetros sea correcto

## Contribución

Si deseas contribuir a este proyecto:

1. Haz un fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Haz commit de tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Haz push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la licencia MIT - ver el archivo LICENSE para más detalles.

## Contacto

Para preguntas o soporte, por favor contacta al equipo de desarrollo o abre un issue en el repositorio de GitHub.
