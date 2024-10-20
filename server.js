const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  path: '/socket.io',
  serveClient: false,
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});
const path = require('path');

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve Socket.IO client
app.get('/socket.io/socket.io.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist', 'socket.io.js'));
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Store active games
const games = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('createGame', (gameCode) => {
    if (games.has(gameCode)) {
      socket.emit('gameError', 'Game code already exists');
    } else {
      games.set(gameCode, { players: [socket.id], board: [] });
      socket.join(gameCode);
      socket.emit('gameCreated', gameCode);
    }
  });

  socket.on('joinGame', (gameCode) => {
    if (games.has(gameCode) && games.get(gameCode).players.length < 2) {
      games.get(gameCode).players.push(socket.id);
      socket.join(gameCode);
      io.to(gameCode).emit('gameJoined', gameCode);
      
      // Start the game for both players when the second player joins
      if (games.get(gameCode).players.length === 2) {
        io.to(gameCode).emit('startGame');
      }
    } else {
      socket.emit('gameError', 'Game not found or full');
    }
  });

  socket.on('updateBoard', (gameCode, board) => {
    if (games.has(gameCode)) {
      const game = games.get(gameCode);
      game.board = board;
      socket.to(gameCode).emit('opponentBoardUpdate', board);
    }
  });

  socket.on('addLines', (gameCode, lineCount) => {
    if (games.has(gameCode)) {
      const game = games.get(gameCode);
      const opponentId = game.players.find(id => id !== socket.id);
      if (opponentId) {
        io.to(opponentId).emit('receivedLines', lineCount);
      }
    }
  });

  socket.on('gameOver', (gameCode) => {
    if (games.has(gameCode)) {
      const game = games.get(gameCode);
      const loserIndex = game.players.indexOf(socket.id);
      const winnerId = game.players[1 - loserIndex]; // Get the other player's ID
      
      // Notify the winner
      io.to(winnerId).emit('gameEnded', 'win');
      
      // Notify the loser
      socket.emit('gameEnded', 'lose');
      
      games.delete(gameCode);
    }
  });

  socket.on('disconnect', () => {
    // Handle player disconnection (e.g., end the game, notify other player)
  });
});

// Export the Express API
module.exports = http;

// Only listen on $ node server.js
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
