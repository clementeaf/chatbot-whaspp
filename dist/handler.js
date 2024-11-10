"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshWhatsAppToken = exports.handler = void 0;
const https_1 = __importDefault(require("https"));
const client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
// Configuración de AWS Secrets Manager
const secretsManager = new client_secrets_manager_1.SecretsManagerClient({ region: "us-east-1" });
const SECRET_NAME = "whatsapp_token_v2";
// Tokens de verificación y acceso
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "clemente";
const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;
// Función para obtener el token de WhatsApp desde AWS Secrets Manager
const getWhatsAppToken = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const command = new client_secrets_manager_1.GetSecretValueCommand({ SecretId: SECRET_NAME, VersionStage: "AWSCURRENT" });
        console.log('Command: ', JSON.stringify(command, null, 2));
        const response = yield secretsManager.send(command);
        console.log('Response: ', JSON.stringify(response, null, 2));
        if (response.SecretString) {
            const secret = JSON.parse(response.SecretString);
            // Actualización aquí para la clave "whatsapp_token"
            if (secret.whatsapp_token) {
                return secret.whatsapp_token;
            }
            else {
                throw new Error("La clave 'whatsapp_token' no existe en el secreto.");
            }
        }
        else {
            throw new Error("El secreto no contiene datos en formato 'SecretString'.");
        }
    }
    catch (error) {
        console.error("Error al obtener el token de Secrets Manager:", error);
        throw new Error("No se pudo obtener el token de acceso de WhatsApp.");
    }
});
// Función principal del handler
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    let response;
    console.log("Evento recibido:", JSON.stringify(event, null, 2));
    const WHATSAPP_TOKEN = yield getWhatsAppToken();
    if ((event === null || event === void 0 ? void 0 : event.httpMethod) === "GET") {
        const queryParams = event.queryStringParameters;
        if (queryParams) {
            const mode = queryParams["hub.mode"];
            const verifyToken = queryParams["hub.verify_token"];
            const challenge = queryParams["hub.challenge"];
            if (mode === "subscribe" && verifyToken === VERIFY_TOKEN) {
                response = {
                    statusCode: 200,
                    headers: { 'Content-Type': 'text/plain' },
                    body: challenge || "",
                };
            }
            else {
                response = {
                    statusCode: 403,
                    body: "Error, token de verificación o modo incorrecto",
                };
            }
        }
        else {
            response = {
                statusCode: 403,
                body: "Error, no hay parámetros en la consulta",
            };
        }
    }
    else if ((event === null || event === void 0 ? void 0 : event.httpMethod) === "POST") {
        try {
            const body = JSON.parse(event.body || "{}");
            const entries = body.entry;
            for (const entry of entries) {
                for (const change of entry.changes) {
                    const value = change.value;
                    if (value && value.messages) {
                        const phoneNumberId = value.metadata.phone_number_id;
                        for (const message of value.messages) {
                            if (message.type === "text") {
                                const from = message.from;
                                const messageBody = message.text.body.toLowerCase();
                                let replyMessage;
                                if (messageBody.includes("hola")) {
                                    replyMessage = "¡Hola! ¿En qué puedo ayudarte?";
                                }
                                else if (messageBody.includes("menu")) {
                                    replyMessage = "Aquí está el menú:\n1. Opción 1\n2. Opción 2\n3. Opción 3";
                                }
                                else if (messageBody.includes("yo")) {
                                    replyMessage = "Clases de lunes a viernes en nuestra sede: Los Pinos Ote 12.\n" +
                                        "Lunes - Miércoles - Viernes de 19 a 20:30 hrs Jiujitstu (GI/Kimono)\n" +
                                        "Martes - Jueves de 20 a 21:30 hrs Jiujitstu/Grappling (NO-GI)";
                                }
                                else {
                                    replyMessage = `Recibido: ${messageBody}`;
                                }
                                yield sendReply(phoneNumberId, from, replyMessage, WHATSAPP_TOKEN);
                            }
                        }
                    }
                }
            }
            response = {
                statusCode: 200,
                body: JSON.stringify("Mensaje procesado con éxito"),
            };
        }
        catch (error) {
            console.error("Error al procesar el mensaje:", error);
            response = {
                statusCode: 500,
                body: JSON.stringify("Error interno del servidor"),
            };
        }
    }
    else {
        response = {
            statusCode: 405,
            body: "Método no permitido",
        };
    }
    return response;
});
exports.handler = handler;
// Función para renovar el token de larga duración
const refreshWhatsAppToken = () => __awaiter(void 0, void 0, void 0, function* () {
    const currentToken = yield getWhatsAppToken();
    const url = `/v12.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${FB_APP_ID}&client_secret=${FB_APP_SECRET}&fb_exchange_token=${currentToken}`;
    const options = {
        hostname: "graph.facebook.com",
        path: url,
        method: "GET",
    };
    https_1.default.request(options, (res) => __awaiter(void 0, void 0, void 0, function* () {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = JSON.parse(data);
            if (response.access_token) {
                const newToken = response.access_token;
                console.log("Nuevo token de larga duración:", newToken);
                // Actualiza el token en AWS Secrets Manager
                yield secretsManager.send(new client_secrets_manager_1.PutSecretValueCommand({
                    SecretId: SECRET_NAME,
                    SecretString: JSON.stringify({ WHATSAPP_TOKEN: newToken }),
                }));
                console.log("Token actualizado en el gestor de secretos.");
            }
            else {
                console.error("Error al renovar el token:", response);
            }
        }));
    }))
        .on("error", (error) => {
        console.error("Error en la solicitud para renovar el token:", error);
    })
        .end();
});
exports.refreshWhatsAppToken = refreshWhatsAppToken;
// Función para enviar una respuesta al cliente en WhatsApp
const sendReply = (phoneNumberId, to, replyMessage, token) => {
    return new Promise((resolve, reject) => {
        const messageData = {
            messaging_product: "whatsapp",
            to,
            text: { body: replyMessage },
        };
        const options = {
            host: "graph.facebook.com",
            path: `/v12.0/${phoneNumberId}/messages?access_token=${token}`,
            method: "POST",
            headers: { "Content-Type": "application/json" },
        };
        const req = https_1.default.request(options, (res) => {
            let response = "";
            res.on("data", (chunk) => (response += chunk));
            res.on("end", () => {
                console.log("Respuesta de WhatsApp:", response);
                resolve();
            });
        });
        req.on("error", (e) => {
            console.error("Error al enviar la respuesta:", e);
            reject(e);
        });
        req.write(JSON.stringify(messageData));
        req.end();
    });
};
