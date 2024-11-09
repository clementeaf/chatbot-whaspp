import https from "https";

// Tokens de verificación y acceso
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "clemente";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "EAA172rea1mEBO0vr9nGljmPpkpinqm8K9pzbjhAZCezEX4XB09VUVzTE7grRSCTBCr2rNZBAc9LSkINIaTZAY1s2PZAQLpVywXz18PX07WK0sbn7XZAB7G4T9wqFy5Ee82F6MGGJxMJwPTn51XqOWYWcemj0CtT9jcEskwRkXe7dzZA4mNbVsrp0wyZC7trBdopmZCthbouv6Uq8pBpO0d6QidxGiZCtGAT0rNq0ZD";

export const handler = async (event: any) => {
  let response;
  console.log("Evento recibido:", JSON.stringify(event, null, 2));

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

                await sendReply(phoneNumberId, from, replyMessage);
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

const sendReply = (phoneNumberId: string, to: string, replyMessage: string) => {
  return new Promise((resolve, reject) => {
    const messageData = {
      messaging_product: "whatsapp",
      to,
      text: { body: replyMessage },
    };

    const options = {
      host: "graph.facebook.com",
      path: `/v12.0/${phoneNumberId}/messages?access_token=${WHATSAPP_TOKEN}`,
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