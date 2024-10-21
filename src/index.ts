import express from 'express';
import route from './routes/route';

// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware para parsear JSON
app.use(express.json());

// Usar las rutas definidas en route.ts
app.use(route);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
