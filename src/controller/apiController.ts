export const verificar = (req: any, res: {
    [x: string]: any; send: (arg0: string) => void 
}) => {
    try {
        const tokenClemente = "CLEMENTEFALCONE";
        const token = req.query["hub.verify_token"];
        const chanllenge = req.query["hub.challenge"];

        res.send(chanllenge);

        console.log(req);
    } catch (error) {
        res.status(400).send();
    }
}

export const recibir = (req: any, res: { send: (arg0: string) => void }) => {
    res.send('Recibido clemente');
}
