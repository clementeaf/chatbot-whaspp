export const verificar = (req: any, res: { send: (arg0: string) => void }) => {
    res.send('Verificado');
}

export const recibir = (req: any, res: { send: (arg0: string) => void }) => {
    res.send('Recibido');
}
