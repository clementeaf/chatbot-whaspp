"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recibir = exports.verificar = void 0;
const verificar = (req, res) => {
    try {
        const tokenClemente = "CLEMENTEFALCONE";
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];
        res.send(challenge);
    }
    catch (error) {
        console.error("Error en la verificación:", error);
        res.status(400).send("Error en la verificación");
    }
};
exports.verificar = verificar;
const recibir = (req, res) => {
    var _a;
    try {
        // Loguear el payload completo recibido de WhatsApp
        console.log("Payload completo recibido:", JSON.stringify(req.body, null, 2));
        // Extraer información del mensaje
        const { entry } = req.body;
        // Validar si hay datos en el payload
        if (entry && entry.length > 0) {
            const changes = entry[0].changes;
            if (changes && changes.length > 0) {
                const message = changes[0].value.messages;
                if (message && message.length > 0) {
                    const text = (_a = message[0].text) === null || _a === void 0 ? void 0 : _a.body; // Obtener el contenido del mensaje de texto
                    const sender = message[0].from; // Obtener el ID del remitente
                    // Loguear el mensaje y el remitente
                    console.log(`Mensaje recibido de ${sender}: ${text}`);
                }
                else {
                    console.log("No se encontraron mensajes en el payload.");
                }
            }
            else {
                console.log("No se encontraron cambios en el payload.");
            }
        }
        else {
            console.log("No se encontró información de entrada en el payload.");
        }
        // Responder con 200 OK para confirmar la recepción
        res.send('Mensaje recibido y procesado.');
    }
    catch (error) {
        console.error("Error al procesar el mensaje:", error);
        res.status(400).send("Error al procesar el mensaje.");
    }
};
exports.recibir = recibir;
