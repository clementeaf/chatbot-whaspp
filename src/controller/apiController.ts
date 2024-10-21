export const verificar = (req: any, res: {
    [x: string]: any; send: (arg0: string) => void
  }) => {
    try {
      const tokenClemente = "CLEMENTEFALCONE";
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];
  
      console.log("Token recibido:", token);
      console.log("Challenge recibido:", challenge);
  
      if (token === tokenClemente) {
        res.send(challenge);
      } else {
        res.status(403).send("Token inválido");
      }
    } catch (error) {
      console.error("Error en la verificación:", error);
      res.status(400).send("Error en la verificación");
    }
  };
  
export const recibir = (req: any, res: { send: (arg0: string) => void }) => {
    res.send('Recibido clemente');
}
