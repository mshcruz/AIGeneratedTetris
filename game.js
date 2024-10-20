const canvas = document.getElementById('tetris-canvas');
const ctx = canvas.getContext('2d');

// Game constants
const BLOCK_SIZE = 30;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

// Game variables
let score = 0;
let level = 1;
let board;
let currentPiece;
let dropCounter = 0;
let dropInterval = 1000; // 1 second
let lastTime = 0;
let isGameOver = false;
let isPaused = false;

const pauseBtn = document.getElementById('pause-btn');
const gameOverElement = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');

function init() {
  board = new Board(BOARD_WIDTH, BOARD_HEIGHT);
  currentPiece = getRandomPiece();
  updateScore();
  updateLevel();
  isGameOver = false;
  gameOverElement.classList.add('hidden');
}

function gameLoop(time = 0) {
  if (isGameOver || isPaused) return;

  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    dropPiece();
  }

  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function update() {
  // Handle user input (implemented in handleKeyPress)
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  board.draw(ctx);
  currentPiece.draw(ctx);
  drawGrid();
}

function drawGrid() {
  ctx.strokeStyle = '#CCCCCC';
  ctx.lineWidth = 0.5;

  // Vertical lines
  for (let x = 0; x <= canvas.width; x += BLOCK_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y <= canvas.height; y += BLOCK_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function dropPiece() {
  currentPiece.move(0, 1);
  if (hasCollision()) {
    currentPiece.move(0, -1);
    mergePiece();
    currentPiece = getRandomPiece();
    if (hasCollision()) {
      // Game over
      isGameOver = true;
      gameOverElement.classList.remove('hidden');
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
  const linesCleared = board.clearLines();
  updateScore(linesCleared);
}

function updateScore(linesCleared = 0) {
  const points = [0, 40, 100, 300, 1200]; // Points for 0, 1, 2, 3, 4 lines
  score += points[linesCleared] * (level + 1);
  document.getElementById('score').textContent = score;
}

function updateLevel() {
  level = Math.floor(score / 1000) + 1;
  document.getElementById('level').textContent = level;
  dropInterval = Math.max(100, 1000 - (level - 1) * 100); // Increase speed with level
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
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
  if (!isPaused) {
    lastTime = performance.now();
    gameLoop();
  }
}

function restart() {
  init();
  lastTime = performance.now();
  gameLoop();
}

// Add event listeners
document.addEventListener('keydown', handleKeyPress);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', restart);

// Start the game
init();
gameLoop();
