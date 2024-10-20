const canvas = document.getElementById('tetris-canvas');
const ctx = canvas.getContext('2d');

// Game constants
const BLOCK_SIZE = 30;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

// Game variables
let score = 0;
let level = 1;

function init() {
    // Initialize the game
    updateScore();
    updateLevel();
    // More initialization code will go here
}

function gameLoop() {
    // Main game loop
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Update game state
    // This function will be implemented later
}

function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the game board
    // This function will be implemented later
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function updateLevel() {
    document.getElementById('level').textContent = level;
}

// Start the game
init();
gameLoop();
