import express from 'express';
import { verificar, recibir } from '../controller/apiController';

const router = express.Router();

// Definición de rutas
router.get('/', verificar);
router.post('/', recibir);

export default router;
