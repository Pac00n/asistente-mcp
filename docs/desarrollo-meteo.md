# Configuración del Clima en Desarrollo

Este documento explica cómo funciona la integración con Open-Meteo y las diferentes configuraciones disponibles para el desarrollo.

## Modos de Operación

### 1. Usando Open-Meteo (Recomendado)

**Ventajas:**
- No requiere servidor MCP en ejecución
- Más rápido para desarrollo
- Usa datos reales de Open-Meteo

**Cómo usarlo:**
```bash
# En desarrollo
USE_OPEN_METEO=true npm run dev

# En producción (configuración por defecto)
npm run build
npm start
```

### 2. Usando el Servidor MCP Mock

**Cuándo usarlo:**
- Para probar integración con MCP
- Para desarrollo de nuevas características de MCP

**Requisitos:**
1. Tener el servidor mock en ejecución:
   ```bash
   node mock-mcp-server.js
   ```
2. En otra terminal:
   ```bash
   npm run dev
   # o sin la variable USE_OPEN_METEO
   # o con USE_OPEN_METEO=false
   ```

## Variables de Entorno

| Variable | Valor por defecto | Descripción |
|----------|------------------|-------------|
| `USE_OPEN_METEO` | `false` | Cuando es `true`, usa Open-Meteo directamente |
| `MCP_SERVER_URL` | `http://localhost:3001` | URL del servidor MCP |

## Solución de Problemas

### No se obtiene información del clima
1. Verifica que el servidor MCP esté en ejecución si estás usando el modo MCP
2. Revisa la consola del navegador y del servidor para ver mensajes de error
3. Prueba con `USE_OPEN_METEO=true` para aislar el problema

### Errores de conexión
1. Verifica que no haya bloqueos de firewall
2. Asegúrate de que el puerto 3001 esté disponible para el servidor MCP
3. Revisa que la URL del servidor MCP sea correcta en `.env.local`

## Notas de Desarrollo

- La aplicación está configurada para usar Open-Meteo por defecto en producción
- En desarrollo, se puede forzar el modo MCP con `USE_OPEN_METEO=false`
- Los cambios en las variables de entorno requieren reiniciar el servidor de desarrollo
