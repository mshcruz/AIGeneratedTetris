class Board {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = this.createEmptyGrid();
    }

    createEmptyGrid() {
        return Array.from({ length: this.height }, () => Array(this.width).fill(0));
    }

    isWithinBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    isPositionEmpty(x, y) {
        return this.isWithinBounds(x, y) && this.grid[y][x] === 0;
    }

    placeBlock(x, y, value) {
        if (this.isWithinBounds(x, y)) {
            this.grid[y][x] = value;
        }
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = this.height - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== 0)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.width).fill(0));
                linesCleared++;
                y++; // Check the new line that dropped down
            }
        }
        return linesCleared;
    }

    draw(ctx) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] !== 0) {
                    ctx.fillStyle = this.getColor(this.grid[y][x]);
                    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    ctx.strokeStyle = '#000';
                    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }
    }

    getColor(value) {
        const colors = [
            '#000000', // Empty (should not be used)
            '#FF0000', // Red
            '#00FF00', // Green
            '#0000FF', // Blue
            '#FFFF00', // Yellow
            '#00FFFF', // Cyan
            '#FF00FF', // Magenta
            '#FFA500', // Orange
            '#808080'  // Gray (for added lines)
        ];
        return colors[value];
    }
}
