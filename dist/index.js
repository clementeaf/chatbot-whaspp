"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const route_1 = __importDefault(require("./routes/route"));
// Inicializar la aplicación Express
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
// Middleware para parsear JSON
app.use(express_1.default.json());
// Usar las rutas definidas en route.ts
app.use(route_1.default);
// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
