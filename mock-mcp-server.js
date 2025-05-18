const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Ruta para consultar el clima
app.post('/weather', (req, res) => {
  try {
    const { location = 'Madrid', units = 'metric' } = req.body;
    
    // Datos simulados del clima
    const weatherData = {
      location,
      temperature: Math.floor(Math.random() * 30) + 10, // Temperatura aleatoria entre 10 y 40
      condition: ['soleado', 'parcialmente nublado', 'nublado', 'lluvia ligera'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 50) + 30, // Humedad entre 30% y 80%
      wind_speed: (Math.random() * 20).toFixed(1), // Velocidad del viento entre 0 y 20 km/h
      units: units === 'metric' ? '°C' : '°F',
      forecast: 'El pronóstico para mañana es similar con posibles lluvias por la tarde.'
    };

    console.log(`Consulta de clima para: ${location}`);
    res.json(weatherData);
  } catch (error) {
    console.error('Error en el servidor MCP:', error);
    res.status(500).json({ error: 'Error interno del servidor MCP' });
  }
});

// Ruta de verificación de estado
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mock-mcp-server' });
});

app.listen(PORT, () => {
  console.log(`Servidor MCP de prueba ejecutándose en http://localhost:${PORT}`);
  console.log('Endpoints disponibles:');
  console.log(`- POST http://localhost:${PORT}/weather`);
  console.log(`- GET  http://localhost:${PORT}/health`);
});
