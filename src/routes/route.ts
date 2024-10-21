import express from 'express';
import { verificar, recibir } from '../controller/apiController';

const router = express.Router();

// Definición de rutas
router.get('/verificar', verificar); // Solo acepta GET para verificación
router.post('/recibir', recibir);    // Acepta POST para recibir mensajes

export default router;
