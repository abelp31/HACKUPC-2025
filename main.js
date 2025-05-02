const express = require('express');
const app = express();
const port = 3000;

// Middleware para parsear el cuerpo de la solicitud como JSON
app.use(express.json());

app.post('/create-session', (req, res) => {
    const { username, num_participants } = req.body;
    if (username && num_participants) {
        //create game and return game_code
        res.status(200).json({ message: 'Session created with code: ' });
    }
    else if (!num_participants){
        res.status(400).json({ error: 'Number of participants can not be null' });
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
        res.status(400).json({ message: `${username} joined, waiting for more users` });
    } else {
        
    }
});

app.post('/', (req, res) => {
});

app.post('/', (req, res) => {
});

app.post('/', (req, res) => {
});

app.post('/', (req, res) => {
});

app.listen(port, () => {
    console.log(`Servidor está corriendo en http://localhost:${port}`);
});
