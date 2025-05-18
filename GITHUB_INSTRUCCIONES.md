# Instrucciones para Crear y Subir el Repositorio en GitHub

Este documento proporciona instrucciones paso a paso para crear un nuevo repositorio en GitHub y subir el proyecto del Asistente MCP.

## Requisitos Previos

1. Una cuenta de GitHub
2. Git instalado en tu ordenador
3. Token de acceso personal de GitHub con permisos adecuados (scope: `repo` y `workflow`)

## Paso 1: Crear un Nuevo Repositorio en GitHub

1. Inicia sesión en tu cuenta de GitHub (https://github.com)
2. Haz clic en el botón "+" en la esquina superior derecha y selecciona "New repository"
3. Completa la información del repositorio:
   - **Nombre del repositorio**: `asistente-mcp` (o el nombre que prefieras)
   - **Descripción**: "Asistente de IA con integración MCP y herramientas"
   - **Visibilidad**: Público o Privado según tus preferencias
   - **Inicializar con README**: No (ya tenemos nuestros archivos)
4. Haz clic en "Create repository"

## Paso 2: Configurar Git en el Proyecto Local

1. Abre una terminal y navega al directorio del proyecto:
```bash
cd /ruta/a/mcp_asistente_app
```

2. Inicializa Git en el directorio del proyecto (si no está ya inicializado):
```bash
git init
```

3. Añade todos los archivos al staging:
```bash
git add .
```

4. Crea el primer commit:
```bash
git commit -m "Versión inicial del Asistente MCP"
```

## Paso 3: Conectar y Subir al Repositorio Remoto

1. Conecta tu repositorio local con el repositorio remoto de GitHub:
```bash
git remote add origin https://github.com/TU_USUARIO/asistente-mcp.git
```
(Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub y `asistente-mcp` con el nombre que elegiste para el repositorio)

2. Sube el código al repositorio remoto:
```bash
git push -u origin main
```
(Si estás usando una rama diferente, reemplaza `main` con el nombre de tu rama)

## Paso 4: Autenticación con Token de Acceso Personal

Si se te solicita autenticación, utiliza tu nombre de usuario de GitHub y el token de acceso personal como contraseña:

1. Si aún no tienes un token de acceso personal:
   - Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Haz clic en "Generate new token" → "Generate new token (classic)"
   - Asigna un nombre descriptivo como "Asistente MCP"
   - Selecciona los permisos `repo` y `workflow`
   - Haz clic en "Generate token"
   - **¡Importante!** Copia el token generado inmediatamente, ya que no podrás verlo de nuevo

2. Cuando Git solicite tus credenciales:
   - Usuario: Tu nombre de usuario de GitHub
   - Contraseña: El token de acceso personal que generaste

## Paso 5: Configurar Secretos para Despliegue (Opcional)

Si planeas desplegar la aplicación usando GitHub Actions o servicios como Vercel o Netlify, deberás configurar los secretos:

1. En GitHub, ve a tu repositorio → Settings → Secrets and variables → Actions
2. Haz clic en "New repository secret"
3. Añade los siguientes secretos:
   - Nombre: `OPENAI_API_KEY`, Valor: Tu API key de OpenAI
   - Nombre: `OPENAI_ASSISTANT_ID`, Valor: El ID del asistente

## Paso 6: Configurar Despliegue Automático con Vercel (Opcional)

Para configurar el despliegue automático con Vercel:

1. Inicia sesión en [Vercel](https://vercel.com)
2. Haz clic en "Add New..." → "Project"
3. Importa el repositorio de GitHub
4. Configura las variables de entorno:
   - `NEXT_PUBLIC_OPENAI_API_KEY`: Tu API key de OpenAI
   - `NEXT_PUBLIC_OPENAI_ASSISTANT_ID`: El ID del asistente
5. Haz clic en "Deploy"

## Paso 7: Verificar el Repositorio

1. Visita `https://github.com/TU_USUARIO/asistente-mcp` para verificar que todos los archivos se hayan subido correctamente
2. Asegúrate de que el archivo `.env.local` esté incluido en `.gitignore` para no exponer tus claves API

## Solución de Problemas Comunes

### Error de Autenticación

Si recibes un error de autenticación al intentar hacer push:

1. Verifica que estás usando el token de acceso personal correcto
2. Asegúrate de que el token tenga los permisos necesarios
3. Intenta almacenar tus credenciales:
```bash
git config --global credential.helper store
```

### Error de Rama Principal

Si recibes un error sobre la rama principal:

1. Verifica el nombre de la rama principal en GitHub
2. Si la rama principal es "main" pero estás en "master" localmente:
```bash
git branch -M main
git push -u origin main
```

### Archivos Grandes

Si tienes problemas al subir archivos grandes:

1. Considera usar Git LFS para archivos grandes
2. O añade los archivos grandes a `.gitignore`

## Próximos Pasos

Una vez que hayas subido el repositorio:

1. Configura la protección de ramas si es un proyecto colaborativo
2. Añade colaboradores si es necesario
3. Configura GitHub Pages o un servicio de despliegue continuo
4. Considera añadir GitHub Actions para pruebas automáticas

## Recursos Adicionales

- [Documentación de GitHub](https://docs.github.com)
- [Guía de Git](https://git-scm.com/book/en/v2)
- [Documentación de Vercel para Next.js](https://nextjs.org/docs/deployment)
