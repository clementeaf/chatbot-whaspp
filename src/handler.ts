import https from "https";
import { SecretsManagerClient, GetSecretValueCommand, PutSecretValueCommand } from "@aws-sdk/client-secrets-manager";

// Configuración de AWS Secrets Manager
const secretsManager = new SecretsManagerClient({ region: "us-east-1" });
const SECRET_NAME = "EAA172rea1mEBOZCrD58WEvPS80k4CxQPccqSRGelnoc7YIqI4Vjz2zLZB3CDuZBD0ZBZB0GrIC6ZBr5v9gphF9YXWGigzyy59CP1XZCY2GScBfothZBQzVjH5yT6517X1hURKjZBnZC7tjX698VtpZBtTNq32Ch5GiMoZCr9KSPvMucYuIDosW4B7b3VqQ2KpSbFrxFjiZAgvirnhtjKXwtDGeDQnZCzpy362aHhkARVqLGa5H19lFvvLZCaMIZD";

// Tokens de verificación y acceso
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "clemente";
const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;

// Función principal del handler
export const handler = async (event: any) => {
  let response;
  console.log("Evento recibido:", JSON.stringify(event, null, 2));

  const WHATSAPP_TOKEN = SECRET_NAME;

  if (event?.httpMethod === "GET") {
    const queryParams = event.queryStringParameters;
    if (queryParams) {
      const mode = queryParams["hub.mode"];
      const verifyToken = queryParams["hub.verify_token"];
      const challenge = queryParams["hub.challenge"];
  
      if (mode === "subscribe" && verifyToken === VERIFY_TOKEN) {
        response = {
          statusCode: 200,
          headers: { 'Content-Type': 'text/plain' },
          body: challenge,
        };
      } else {
        response = {
          statusCode: 403,
          body: "Error, token de verificación o modo incorrecto",
        };
      }
    } else {
      response = {
        statusCode: 403,
        body: "Error, no hay parámetros en la consulta",
      };
    }
  } else if (event?.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body);
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

                // Lógica de respuesta automatizada
                let replyMessage;
                if (messageBody.includes("hola")) {
                  replyMessage = "¡Hola! ¿En qué puedo ayudarte?";
                } else if (messageBody.includes("menu")) {
                  replyMessage = "Aquí está el menú:\n1. Opción 1\n2. Opción 2\n3. Opción 3";
                } else if (messageBody.includes("yo")) {
                  replyMessage = "Clases de lunes a viernes en nuestra sede: Los Pinos Ote 12.\n" +
                                 "Lunes - Miércoles - Viernes de 19 a 20:30 hrs Jiujitstu (GI/Kimono)\n" +
                                 "Martes - Jueves de 20 a 21:30 hrs Jiujitstu/Grappling (NO-GI)";
                } else {
                  replyMessage = `Recibido: ${messageBody}`;
                }

                await sendReply(phoneNumberId, from, replyMessage, WHATSAPP_TOKEN);
              }
            }
          }
        }
      }
      response = {
        statusCode: 200,
        body: JSON.stringify("Mensaje procesado con éxito"),
      };
    } catch (error) {
      console.error("Error al procesar el mensaje:", error);
      response = {
        statusCode: 500,
        body: JSON.stringify("Error interno del servidor"),
      };
    }
  } else {
    response = {
      statusCode: 405,
      body: JSON.stringify("Método no permitido"),
    };
  }

  return response;
};

// Función para renovar el token de larga duración
export const refreshWhatsAppToken = async () => {
  const currentToken = SECRET_NAME;

  const url = `/v12.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${FB_APP_ID}&client_secret=${FB_APP_SECRET}&fb_exchange_token=${currentToken}`;

  const options = {
    hostname: "graph.facebook.com",
    path: url,
    method: "GET",
  };

  https.request(options, async (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", async () => {
      const response = JSON.parse(data);
      if (response.access_token) {
        const newToken = response.access_token;
        console.log("Nuevo token de larga duración:", newToken);

        // Actualiza el token en AWS Secrets Manager
        await secretsManager.send(
          new PutSecretValueCommand({
            SecretId: SECRET_NAME,
            SecretString: JSON.stringify({ WHATSAPP_TOKEN: newToken }),
          })
        );

        console.log("Token actualizado en el gestor de secretos.");
      } else {
        console.error("Error al renovar el token:", response);
      }
    });
  })
  .on("error", (error) => {
    console.error("Error en la solicitud para renovar el token:", error);
  })
  .end();
};

// Función para enviar una respuesta al cliente en WhatsApp
const sendReply = (phoneNumberId: string, to: string, replyMessage: string, token: string) => {
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

    const req = https.request(options, (res) => {
      let response = "";
      res.on("data", (chunk) => (response += chunk));
      res.on("end", () => {
        console.log("Respuesta de WhatsApp:", response);
        resolve(response);
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
