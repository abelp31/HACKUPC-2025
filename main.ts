// Import necessary types from express and socket.io
import express, { Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from "socket.io";
import { Game, Question, PlayerAnswer, predefinedQuestions } from './types';
// Import the cors middleware
import cors from 'cors';
// Import path module for resolving file paths
import path from 'path';
import lookupRouter from './api';
import { processGameResults } from './game';
import { getNearestAirportIata } from './skyscanner';

interface CustomSocket extends Socket {
    gameId?: string;
    playerName?: string;
}

// --- Server Setup ---

const app = express();
const games = new Map<string, Game>();

// Apply CORS middleware first
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// *** Middleware to serve static files from the 'static' directory ***
const staticPath = path.join(__dirname, 'static'); // Resolve the absolute path to 'static'
console.log(`Serving static files from: ${staticPath}`);
app.use(express.static(staticPath));


// Function to generate a unique 6-character game ID
const generateGameId = (): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let gameId = '';
    for (let i = 0; i < 6; i++) {
        gameId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    if (games.has(gameId)) {
        return generateGameId();
    }
    return gameId;
};

// --- HTTP Routes ---

// POST /game/create
app.post("/game/create", (req: Request, res: Response) => {
    const gameId = generateGameId();
    const newGame: Game = {
        id: gameId,
        questions: predefinedQuestions,
        currentQuestionIndex: 0,
        state: 'waiting',
        players: {},
        startDate: req.body.startDate,
        endDate: req.body.endDate
    };
    games.set(gameId, newGame);
    console.log(`Game created with ID: ${gameId}`);
    res.status(201).json({ gameId: newGame.id });
});

// GET /game/:id
app.get("/game/:id", (req: Request, res: Response) => {
    const gameId = req.params.id;
    const game = games.get(gameId);
    if (!game) {
        res.status(404).json({ error: "Game not found" });
        return;
    }
    res.json({ id: game.id, state: game.state, playerCount: Object.keys(game.players).length });
});

app.use(lookupRouter)

// --- Socket.IO Setup ---

const server: http.Server = http.createServer(app);
export const socketServer = new SocketIOServer(server, {
    cors: { origin: "*", methods: ["GET", "POST"] } // CORS for Socket.IO connections
});





// --- Game Logic Functions ---




// Function to send the next question or end the game
const sendQuestions = (gameId: string) => {
    const game = games.get(gameId);
    if (!game || game.state !== 'playing') {
        console.warn(`[sendQuestions] Cannot send question for game ${gameId}. State: ${game?.state}`);
        return;
    }

    if (game.currentQuestionIndex >= game.questions.length) {
        game.state = 'finished';
        console.log(`Game ${gameId} state set to finished.`);
        processGameResults(game); // Errors handled internally, emits 'gameFinished'
        return; // Stop sending questions
    }

    // --- Sending next question logic ---
    const currentQuestion = game.questions[game.currentQuestionIndex];
    console.log(`Sending question ${game.currentQuestionIndex + 1} (ID: ${currentQuestion.id}) to game ${gameId}`);

    socketServer.to(gameId).emit('newQuestion', {
        index: game.currentQuestionIndex,
        id: currentQuestion.id,
        text: currentQuestion.text,
        options: currentQuestion.options,
        allowMultiple: currentQuestion.allowMultiple
    });

    game.currentQuestionIndex++;
};


socketServer.on('connection', (clientSocket: CustomSocket) => {
    console.log(`Client connected: ${clientSocket.id}. Waiting for join details...`);

    // Event Listener for Joining a Game
    clientSocket.on('joinGame', async ({ gameId, playerName, coords, maxBudget }: { gameId: string, playerName: string, coords: { lat: number, lng: number }, maxBudget: number }) => {
        console.log(`[joinGame] Attempt by ${clientSocket.id}: GameID=${gameId}, PlayerName=${playerName}, Coords=${coords}, MaxBudget=${maxBudget}`);

        // Validation...
        if (!gameId || !playerName || !coords || !maxBudget) { clientSocket.emit('error', 'Game ID, Player Name, coords, desired dates and maxBudget are required.'); return; }
        console.log({ gameId, games })
        const game = games.get(gameId);
        if (!game) { clientSocket.emit('error', 'Game not found.'); return; }
        if (game.state !== 'waiting') { clientSocket.emit('error', 'Game has already started or finished.'); return; }
        if (clientSocket.gameId) { clientSocket.emit('error', 'You are already in a game.'); return; }


        // Extract nearest airport ID from coordinates
        const originIata = await getNearestAirportIata(coords.lat, coords.lng)

        // Successful Join...
        console.log(`[joinGame] Success: ${clientSocket.id} | Player: ${playerName} | Game: ${gameId} | originIata: ${originIata} | maxBudget: ${maxBudget}`);
        clientSocket.gameId = gameId;
        clientSocket.playerName = playerName;
        game.players[clientSocket.id] = { name: playerName, originIata, answers: [], maxBudget };
        clientSocket.join(gameId);
        clientSocket.emit('joinSuccess', { gameId: game.id, players: game.players, state: game.state });
        clientSocket.to(gameId).emit('playerJoined', { playerId: clientSocket.id, playerName: playerName, players: game.players });
    });

    // 'startGame' event
    clientSocket.on('startGame', () => {
        const currentGameId = clientSocket.gameId;
        const currentPlayerName = clientSocket.playerName;
        if (!currentGameId || !currentPlayerName) { clientSocket.emit('error', 'You must join a game first.'); return; }
        const game = games.get(currentGameId);
        if (!game) { clientSocket.emit('error', 'Game not found'); return; }
        if (game.state !== 'waiting') { clientSocket.emit('error', 'Game has already started or finished'); return; }
        // TODO: Add host check authorization

        console.log(`Game ${currentGameId} starting by ${currentPlayerName} (${clientSocket.id})...`);
        game.state = 'playing';
        game.currentQuestionIndex = 0;
        socketServer.to(currentGameId).emit('gameStarted', { state: game.state });
        sendQuestions(currentGameId);
    });

    // 'answerQuestion' event
    clientSocket.on('answerQuestion', ({ questionId, selectedOptionIds }: { questionId: number, selectedOptionIds: number[] }) => {
        const currentGameId = clientSocket.gameId;
        const currentPlayerName = clientSocket.playerName;
        // Validation...
        if (!currentGameId || !currentPlayerName) { clientSocket.emit('error', 'You must join a game first.'); return; }
        const game = games.get(currentGameId);
        if (!game || game.state !== 'playing') { clientSocket.emit('error', 'Game not found or not playing.'); return; }
        const player = game.players[clientSocket.id];
        if (!player) { clientSocket.emit('error', 'Player not found in this game.'); return; }
        const currentQuestion = game.questions[game.currentQuestionIndex - 1];
        if (!currentQuestion || currentQuestion.id !== questionId) { clientSocket.emit('error', 'Answer submitted for incorrect question.'); return; }
        if (!Array.isArray(selectedOptionIds) || !selectedOptionIds.every(id => typeof id === 'number')) { clientSocket.emit('error', 'Invalid answer format (expected array of numbers).'); return; }
        const existingAnswer = player.answers.find(ans => ans.questionId === questionId);
        if (existingAnswer) { clientSocket.emit('error', 'You have already answered this question.'); return; }

        // Store the answer...
        const playerAnswer: PlayerAnswer = { questionId: questionId, selectedOptionIds: selectedOptionIds, timestamp: Date.now() };
        player.answers.push(playerAnswer);
        console.log(`Player ${currentPlayerName} (${clientSocket.id}) answered question ${questionId} with options: [${selectedOptionIds.join(', ')}]`);

        // Notify room...
        socketServer.to(currentGameId).emit('playerAnswered', { playerId: clientSocket.id, playerName: currentPlayerName, questionId: questionId });

        // Check if all answered...
        const allAnswered = Object.values(game.players).every(p => p.answers.some(ans => ans.questionId === questionId));
        if (allAnswered) {
            console.log(`All players in game ${currentGameId} have answered question ${questionId}. Advancing...`);
            // Advance to the next question (or finish the game if this was the last one)
            sendQuestions(currentGameId);
        }
    });

    // 'disconnect' event
    clientSocket.on('disconnect', () => {
        console.log(`Client disconnected: ${clientSocket.id}`);
        const currentGameId = clientSocket.gameId;
        const currentPlayerName = clientSocket.playerName;
        if (currentGameId && currentPlayerName) {
            const game = games.get(currentGameId);
            if (game && game.players[clientSocket.id]) {
                console.log(`Player ${currentPlayerName} (${clientSocket.id}) left game ${currentGameId}`);
                delete game.players[clientSocket.id];
                socketServer.to(currentGameId).emit('playerLeft', { playerId: clientSocket.id, playerName: currentPlayerName, players: game.players });
                // Cleanup empty games...
                if (Object.keys(game.players).length === 0 && game.state !== 'waiting') {
                    console.log(`Game ${currentGameId} is empty, removing.`); games.delete(currentGameId);
                } else if (Object.keys(game.players).length === 0 && game.state === 'waiting') {
                    console.log(`Waiting room ${currentGameId} is empty, removing.`); games.delete(currentGameId);
                }
            }
        } else {
            console.log(`Disconnected socket ${clientSocket.id} had not joined a game.`);
        }
    });
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

