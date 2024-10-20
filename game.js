const canvas = document.getElementById('tetris-canvas');
const ctx = canvas.getContext('2d');
const socket = io();

// Game constants
const BLOCK_SIZE = 30;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

// Game variables
let score = 0;
let level = 1;
let board;
let opponentBoard;
let currentPiece;
let dropCounter = 0;
let dropInterval = 1000; // 1 second
let lastTime = 0;
let gameCode = null;
let isMultiplayer = false;
let isGameOver = false;
let isPaused = false;
let gameStarted = false;

const gameOverElement = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');

const opponentCanvas = document.getElementById('opponent-canvas');
const opponentCtx = opponentCanvas.getContext('2d');

function initSinglePlayer() {
    isMultiplayer = false;
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    document.getElementById('opponent-board').classList.add('hidden');
    document.querySelectorAll('.single-player-only').forEach(el => el.classList.remove('hidden'));
    document.getElementById('pause-btn').textContent = 'Pause';
    isPaused = false;
    startGame();
}

function initMultiplayer() {
    isMultiplayer = true;
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    document.getElementById('opponent-board').classList.remove('hidden');
    document.querySelectorAll('.single-player-only').forEach(el => el.classList.add('hidden'));
    startGame();
}

function startGame() {
    gameStarted = true;
    isPaused = false;
    init();
    lastTime = performance.now();
    gameLoop();
}

function init() {
    board = new Board(BOARD_WIDTH, BOARD_HEIGHT);
    opponentBoard = new Board(BOARD_WIDTH, BOARD_HEIGHT);
    currentPiece = getRandomPiece();
    resetScoreAndLevel();
    isGameOver = false;
    gameOverElement.classList.add('hidden');
}

function createGame() {
    gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    socket.emit('createGame', gameCode);
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game-code').classList.remove('hidden');
    document.getElementById('code-display').textContent = gameCode;
}

function joinGame() {
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('join-game').classList.remove('hidden');
}

function submitGameCode() {
    const codeInput = document.getElementById('game-code-input');
    gameCode = codeInput.value.toUpperCase();
    socket.emit('joinGame', gameCode);
}

function updateOpponentBoard(opponentBoardData) {
    opponentBoard.grid = opponentBoardData;
    drawOpponentBoard();
}

function drawOpponentBoard() {
    opponentCtx.clearRect(0, 0, opponentCanvas.width, opponentCanvas.height);
    opponentBoard.draw(opponentCtx);
    drawGrid(opponentCtx);
}

function addLinesToBoard(lineCount) {
    for (let i = 0; i < lineCount; i++) {
        board.grid.shift();
        const newLine = Array(BOARD_WIDTH).fill(8); // Use a different color for added lines
        newLine[Math.floor(Math.random() * BOARD_WIDTH)] = 0; // Add a single gap
        board.grid.push(newLine);
    }
    draw(); // Force a redraw of the board
}

function gameLoop(time = 0) {
    if (!gameStarted || isGameOver || isPaused) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        dropPiece();
    }

    update();
    draw();
    if (isMultiplayer) {
        socket.emit('updateBoard', gameCode, board.grid);
    }
    requestAnimationFrame(gameLoop);
}

function update() {
  // Handle user input (implemented in handleKeyPress)
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    board.draw(ctx);
    currentPiece.draw(ctx);
    drawGrid(ctx);
    
    if (isMultiplayer) {
        opponentCtx.clearRect(0, 0, opponentCanvas.width, opponentCanvas.height);
        opponentBoard.draw(opponentCtx);
        drawGrid(opponentCtx);
    }
}

function drawGrid(context) {
    context.strokeStyle = '#CCCCCC';
    context.lineWidth = 0.5;

    for (let x = 0; x <= canvas.width; x += BLOCK_SIZE) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
    }

    for (let y = 0; y <= canvas.height; y += BLOCK_SIZE) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
    }
}

function dropPiece() {
    currentPiece.move(0, 1);
    if (hasCollision()) {
        currentPiece.move(0, -1);
        mergePiece();
        const linesCleared = board.clearLines();
        if (isMultiplayer && linesCleared > 0) {
            socket.emit('addLines', gameCode, linesCleared);
        }
        updateScore(linesCleared);
        currentPiece = getRandomPiece();
        if (hasCollision()) {
            if (isMultiplayer) {
                socket.emit('gameOver', gameCode);
            } else {
                endGame('lose');
            }
        }
    }
    dropCounter = 0;
}

function hasCollision() {
  return currentPiece.shape.some((row, dy) => {
    return row.some((value, dx) => {
      if (value !== 0) {
        const newX = currentPiece.x + dx;
        const newY = currentPiece.y + dy;
        return (
          newX < 0 ||
          newX >= BOARD_WIDTH ||
          newY >= BOARD_HEIGHT ||
          (newY >= 0 && board.grid[newY][newX] !== 0)
        );
      }
      return false;
    });
  });
}

function mergePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board.grid[y + currentPiece.y][x + currentPiece.x] = value;
            }
        });
    });
}

function updateScore(linesCleared) {
    const points = [0, 40, 100, 300, 1200]; // Points for 0, 1, 2, 3, 4 lines
    score += points[linesCleared] * (level + 1);
    level = Math.floor(score / 1000) + 1; // Update level based on score
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
}

function resetScoreAndLevel() {
    score = 0;
    level = 1;
    updateScore(0);
}

function handleKeyPress(event) {
    if (isGameOver || isPaused) return;

    switch (event.keyCode) {
        case 37: // Left arrow
            movePiece(-1, 0);
            break;
        case 39: // Right arrow
            movePiece(1, 0);
            break;
        case 40: // Down arrow
            dropPiece();
            break;
        case 38: // Up arrow
            rotatePiece();
            break;
    }
}

function movePiece(dx, dy) {
    currentPiece.move(dx, dy);
    if (hasCollision()) {
        currentPiece.move(-dx, -dy);
    }
}

function rotatePiece() {
    const originalShape = currentPiece.shape;
    currentPiece.rotate();
    if (hasCollision()) {
        currentPiece.shape = originalShape;
    }
}

function togglePause() {
    if (!isMultiplayer) {
        isPaused = !isPaused;
        if (!isPaused) {
            lastTime = performance.now();
            gameLoop();
        }
        document.getElementById('pause-btn').textContent = isPaused ? 'Resume' : 'Pause';
    }
}

function restartGame() {
    if (!isMultiplayer) {
        isGameOver = false;
        gameStarted = false;
        isPaused = false;
        document.getElementById('pause-btn').textContent = 'Pause';
        initSinglePlayer();
    }
}

function backToMenu() {
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden');
    isGameOver = false;
    gameStarted = false;
    isPaused = false;
    // Reset any other necessary game state variables
}

function endGame(result) {
    isGameOver = true;
    gameStarted = false;
    const gameOverElement = document.getElementById('game-over');
    const winnerMessageElement = document.getElementById('winner-message');
    
    if (isMultiplayer) {
        winnerMessageElement.textContent = result === 'win' ? 'You won!' : 'Your opponent won!';
    } else {
        winnerMessageElement.textContent = `Game Over! Your score: ${score}`;
    }
    
    gameOverElement.classList.remove('hidden');
}

// Add event listeners
document.addEventListener('keydown', handleKeyPress);
restartBtn.addEventListener('click', restartGame);

// Add event listeners for multiplayer buttons
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('single-player-btn').addEventListener('click', initSinglePlayer);
    document.getElementById('create-game-btn').addEventListener('click', createGame);
    document.getElementById('join-game-btn').addEventListener('click', joinGame);
    document.getElementById('submit-code-btn').addEventListener('click', submitGameCode);
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('back-to-menu-btn').addEventListener('click', backToMenu);
    document.getElementById('game-over-back-to-menu-btn').addEventListener('click', backToMenu);
});

// Socket event listeners
socket.on('gameCreated', (code) => {
    gameCode = code;
    document.getElementById('code-display').textContent = code;
});

socket.on('gameJoined', (code) => {
    gameCode = code;
    document.getElementById('join-game').classList.add('hidden');
    initMultiplayer();
});

socket.on('startGame', () => {
    document.getElementById('game-code').classList.add('hidden');
    initMultiplayer();
});

socket.on('opponentBoardUpdate', (opponentBoardData) => {
    opponentBoard.grid = opponentBoardData;
    draw();
});

socket.on('receivedLines', (lineCount) => {
    addLinesToBoard(lineCount);
});

socket.on('gameEnded', (result) => {
    endGame(result);
});

socket.on('gameError', (error) => {
    alert(error);
});
