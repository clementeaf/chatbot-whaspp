"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apiController_1 = require("../controller/apiController");
const router = express_1.default.Router();
// Definición de rutas
router.get('/verificar', apiController_1.verificar); // Solo acepta GET para verificación
router.post('/recibir', apiController_1.recibir); // Acepta POST para recibir mensajes
exports.default = router;
