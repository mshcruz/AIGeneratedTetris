# Multiplayer Tetris Game

A classic Tetris game implementation with multiplayer support using HTML5 Canvas, JavaScript, and Socket.IO.

## Description

This project is a browser-based version of the popular puzzle game Tetris, featuring both single-player and multiplayer modes. It's built using vanilla JavaScript, HTML5 Canvas, and Socket.IO for real-time multiplayer functionality.

**Note:** This code was generated with the assistance of an AI language model.

## Features

- Classic Tetris gameplay
- Single-player and multiplayer modes
- Responsive design
- Score tracking
- Level progression with increasing difficulty
- Pause and resume functionality (single-player only)
- Game over screen with restart option

## Getting Started

### Prerequisites

- Node.js (version 14 or later)
- npm (usually comes with Node.js)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/mshcruz/AIGeneratedTetris.git
   ```
2. Navigate to the project directory:
   ```
   cd AIGeneratedTetris
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the server:
   ```
   node server.js
   ```
5. Open a web browser and go to `http://localhost:8080`

## How to Play

### Single-player Mode
- Click "Single Player" on the main menu
- Use the left and right arrow keys to move the Tetris piece horizontally
- Use the up arrow key to rotate the piece
- Use the down arrow key to make the piece fall faster
- Press the "Pause" button to pause the game, and "Resume" to continue playing
- After a game over, press the "Restart" button to start a new game

### Multiplayer Mode
- Player 1: Click "Create Multiplayer Game" and share the generated game code
- Player 2: Click "Join Multiplayer Game" and enter the game code
- Play against each other in real-time
- Cleared lines are added to the opponent's board

## Project Structure

- `index.html`: The main HTML file
- `styles.css`: Contains all the styling for the game
- `game.js`: Main game logic and multiplayer functionality
- `board.js`: Handles the game board functionality
- `piece.js`: Defines the Tetris pieces and their behavior
- `server.js`: Node.js server for handling multiplayer connections

## Deployment

This project is set up for deployment on Google Cloud Run. Refer to Google Cloud documentation for detailed deployment instructions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Inspired by the original Tetris game
- Built as a learning project for browser-based game development and real-time multiplayer functionality
