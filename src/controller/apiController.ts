export const verificar = (req: any, res: {
    [x: string]: any; send: (arg0: string) => void
  }) => {
    try {
      const tokenClemente = "CLEMENTEFALCONE";
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];
  
      console.log(challenge);
    } catch (error) {
      console.error("Error en la verificación:", error);
      res.status(400).send("Error en la verificación");
    }
  };
  
  export const recibir = (req: any, res: {
      [x: string]: any; send: (arg0: string) => void 
}) => {
    try {
      // Loguear el payload completo recibido de WhatsApp
      console.log("Payload recibido:", JSON.stringify(req.body, null, 2));
  
      // Extraer información del mensaje
      const { entry } = req.body;
  
      // Validar si hay datos en el payload
      if (entry && entry.length > 0) {
        const changes = entry[0].changes;
  
        if (changes && changes.length > 0) {
          const message = changes[0].value.messages;
  
          if (message && message.length > 0) {
            const text = message[0].text?.body; // Obtener el contenido del mensaje de texto
            const sender = message[0].from; // Obtener el ID del remitente
  
            // Loguear el mensaje y el remitente
            console.log(`Mensaje recibido de ${sender}: ${text}`);
          }
        }
      }
  
      // Responder con 200 OK para confirmar la recepción
      res.send('Mensaje recibido y procesado.');
    } catch (error) {
      console.error("Error al procesar el mensaje:", error);
      res.status(400).send("Error al procesar el mensaje.");
    }
  };
  
