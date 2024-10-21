export const verificar = (req: any, res: {
    [x: string]: any; send: (arg0: string) => void
  }) => {
    try {
      const tokenClemente = "CLEMENTEFALCONE";
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];
  
      res.send(challenge);
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
      console.log("Payload completo recibido:", JSON.stringify(req.body, null, 2));
  
      console.log(req);
  
      // Responder con 200 OK para confirmar la recepción
      res.send(req.body);
    } catch (error) {
      console.error("Error al procesar el mensaje:", error);
      res.status(400).send("Error al procesar el mensaje.");
    }
  };
  
