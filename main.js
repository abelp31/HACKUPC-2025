import express from 'express';
import { generateContent } from './question_generator.js';

const app = express();
const port = 3000;

let rooms = []

// Middleware para parsear el cuerpo de la solicitud como JSON
app.use(express.json());


// inputs: {questions: "text que utilitzarem per generar les preguntes+respostes"}
// outputs: {code: "12345"}
app.post('/create-session', (req, res) => {
    const { questions } = req.body;
    if (questions) {
        // Generate a 6 digit/character code, mix of 3 letters and then 3 numbers
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const randomLetters = Array.from({ length: 3 }, () => letters.charAt(Math.floor(Math.random() * letters.length))).join('');
        const randomNumbers = Array.from({ length: 3 }, () => numbers.charAt(Math.floor(Math.random() * numbers.length))).join('');
        const roomCode = randomLetters + randomNumbers;
        res.status(200).json({ code: roomCode });
    } else {
        res.status(400).json({ error: 'Questions can not be null' });
    }
});

app.get("/test", async (req, res) => {
    const response = await generateContent();
    res.status(200).json({ text: response.text });
});

app.post("/start-game", (req, res) => {
    const { gameCode } = req.body;
    if (gameCode) {
        res.status(200).json({ message: 'Game started' });
    } else {
        res.status(400).json({ error: 'Game code can not be null' });
    }
});

// Endpoint para empezar una partida
app.post('/start-session', (req, res) => {
    const { user_name, game_code } = req.body;
    if (user_name && game_code) {
        //comprobar que la sessio existeix, sino existeix retornar false -> enviar error
        //add user to test and summ number of users joined
        //if user was last user start game
        res.status(200).json({ message: `${username} joined, waiting for more users` });
    } else {

    }
});

app.post('/', (req, res) => {
});

app.listen(port, () => {
    console.log(`Servidor está corriendo en http://localhost:${port}`);
});
