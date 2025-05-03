import express from 'express';
import http from 'http';
import { Server } from "socket.io";

import { generateContent } from './question_generator.js';

const app = express();
const port = 3000;

let rooms = {}

class Room {
    //  players = nicknames
    // questions = [{question: "text", choices: ["text"], answers: [1,2,3,4]}]

    // attributes: code, questions + answers, number of players, players
    constructor(code, questions) {
        this.code = code;
        this.questions = questions;
        this.players = [];
        this.started = false;
    }
    addPlayer(playerName) {
        this.players.push(playerName);
    }
    removePlayer(playerName) {
        this.players = this.players.filter(p => p !== playerName);
    }
    getPlayerCount() {
        return this.players.length;
    }
    getCode() {
        return this.code;
    }
    getQuestions() {
        return this.questions;
    }
    isStarted() {
        return this.started;
    }
    startGame() {
        this.started = true;
    }
}

// Middleware para parsear el cuerpo de la solicitud como JSON
app.use(express.json());


// inputs: {questions: "text que utilitzarem per generar les preguntes+respostes"}
// outputs: {code: "12345"}
app.post('/game/create', (req, res) => {
    const { questions } = req.body;
    if (questions) {
        // Generate a 6 digit/character code, mix of 3 letters and then 3 numbers
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const randomLetters = Array.from({ length: 3 }, () => letters.charAt(Math.floor(Math.random() * letters.length))).join('');
        const randomNumbers = Array.from({ length: 3 }, () => numbers.charAt(Math.floor(Math.random() * numbers.length))).join('');
        const roomCode = randomLetters + randomNumbers;


        const room = new Room(roomCode,
            [
                {
                    question: "Do you like AI?",
                    choices: ["Yes", "No", "Maybe"],
                }
            ]
        );

        rooms[roomCode] = room;

        console.log(`Created room with code: ${roomCode}: ${room}`);

        res.status(200).json({ code: roomCode });
    } else {
        res.status(400).json({ error: 'Questions can not be null' });
    }
});

app.post("/game/:id/start", (req, res) => {
    const { id } = req.params;

    const room = rooms[id];
    if (room) {
        room.startGame();
        console.log(`Room ${id} started`);
        res.status(200).json({ message: "Game started" });
    } else {
        res.status(404).json({ error: "Room not found" });
    }
});


app.get("/test", async (req, res) => {
    const response = await generateContent();
    res.status(200).json({ text: response.text });
});


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (adjust for production)
        methods: ["GET", "POST"]
    }
});

server.listen(port, () => {
    console.log(`Servidor está corriendo en http://localhost:${port}`);
});
