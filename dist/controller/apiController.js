"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recibir = exports.verificar = void 0;
const verificar = (req, res) => {
    try {
        const tokenClemente = "CLEMENTEFALCONE";
        const token = req.query["hub.verify_token"];
        const chanllenge = req.query["hub.challenge"];
        res.send(chanllenge);
        console.log(req);
    }
    catch (error) {
        res.status(400).send();
    }
};
exports.verificar = verificar;
const recibir = (req, res) => {
    res.send('Recibido clemente');
};
exports.recibir = recibir;
