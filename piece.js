class Piece {
    constructor(shape, color) {
        this.shape = shape;
        this.color = color;
        this.x = Math.floor(BOARD_WIDTH / 2) - Math.ceil(this.shape[0].length / 2);
        this.y = 0;
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    rotate() {
        const newShape = [];
        for (let i = 0; i < this.shape[0].length; i++) {
            newShape.push([]);
            for (let j = this.shape.length - 1; j >= 0; j--) {
                newShape[i].push(this.shape[j][i]);
            }
        }
        this.shape = newShape;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    ctx.fillRect((this.x + x) * BLOCK_SIZE, (this.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    ctx.strokeStyle = 'black';
                    ctx.strokeRect((this.x + x) * BLOCK_SIZE, (this.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            });
        });
    }
}

const PIECES = [
    {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#FFFF00'
    },
    {
        shape: [
            [0, 2, 0],
            [2, 2, 2]
        ],
        color: '#800080'
    },
    {
        shape: [
            [0, 3, 3],
            [3, 3, 0]
        ],
        color: '#00FF00'
    },
    {
        shape: [
            [4, 4, 0],
            [0, 4, 4]
        ],
        color: '#FF0000'
    },
    {
        shape: [
            [5, 0, 0],
            [5, 5, 5]
        ],
        color: '#0000FF'
    },
    {
        shape: [
            [0, 0, 6],
            [6, 6, 6]
        ],
        color: '#FFA500'
    },
    {
        shape: [
            [7, 7, 7, 7]
        ],
        color: '#00FFFF'
    }
];

function getRandomPiece() {
    const randomIndex = Math.floor(Math.random() * PIECES.length);
    const { shape, color } = PIECES[randomIndex];
    return new Piece(shape, color);
}
