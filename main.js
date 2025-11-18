class RectangleTableGenerator {
    constructor(rectangles) {
        this.rectangles = rectangles;
        this.grid = [];
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
        ];
    }

    getBoundaries() {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        this.rectangles.forEach(rect => {
            minX = Math.min(minX, rect.topLeft.x);
            minY = Math.min(minY, rect.topLeft.y);
            maxX = Math.max(maxX, rect.bottomRight.x);
            maxY = Math.max(maxY, rect.bottomRight.y);
        });

        return { minX, minY, maxX, maxY };
    }

    createGrid() {
        const bounds = this.getBoundaries();
        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;

        this.grid = Array(height).fill().map(() => Array(width).fill(0));

        this.rectangles.forEach((rect, index) => {
            const startX = rect.topLeft.x - bounds.minX;
            const startY = rect.topLeft.y - bounds.minY;
            const endX = rect.bottomRight.x - bounds.minX;
            const endY = rect.bottomRight.y - bounds.minY;

            for (let y = startY; y < endY; y++) {
                for (let x = startX; x < endX; x++) {
                    if (y < this.grid.length && x < this.grid[0].length) {
                        this.grid[y][x] = index + 1;
                    }
                }
            }
        });

        return this.grid;
    }

    optimizeGrid() {
        if (this.grid.length === 0) return [];

        const rows = this.grid.length;
        const cols = this.grid[0].length;

        const emptyRows = [];
        const emptyCols = [];

        for (let i = 0; i < rows; i++) {
            if (this.grid[i].every(cell => cell === 0)) {
                emptyRows.push(i);
            }
        }

        for (let j = 0; j < cols; j++) {
            let isEmpty = true;
            for (let i = 0; i < rows; i++) {
                if (this.grid[i][j] !== 0) {
                    isEmpty = false;
                    break;
                }
            }
            if (isEmpty) emptyCols.push(j);
        }

        for (let i = emptyRows.length - 1; i >= 0; i--) {
            this.grid.splice(emptyRows[i], 1);
        }

        for (let j = emptyCols.length - 1; j >= 0; j--) {
            for (let i = 0; i < this.grid.length; i++) {
                this.grid[i].splice(emptyCols[j], 1);
            }
        }

        return this.grid;
    }

    generateTable() {
        this.createGrid();
        this.optimizeGrid();

        if (this.grid.length === 0 || this.grid[0].length === 0) {
            return '<p>No rectangles to display</p>';
        }

        let html = '<table style="border-collapse: collapse; border: 1px solid #ccc;">';

        this.grid.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                if (cell > 0) {
                    const colorIndex = (cell - 1) % this.colors.length;
                    html += `<td style="background-color: ${this.colors[colorIndex]}; border: 1px solid #333; width: 20px; height: 20px;"></td>`;
                } else {
                    html += '<td style="border: 1px solid #eee; width: 20px; height: 20px;"></td>';
                }
            });
            html += '</tr>';
        });

        html += '</table>';
        return html;
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = this.generateTable();
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const generator = new RectangleTableGenerator(rectangles);
    generator.render('tableContainer');
});
