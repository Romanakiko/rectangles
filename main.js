class RectangleTableGenerator {
    constructor(rectangles) {
        this.rectangles = rectangles;
        this.grid = [];
        [this.scaleFactor, this.sizeCorrector] = this.getScale();
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
        ];
    }

    getBoundaries( rectangles ) {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        rectangles.forEach(rect => {
            minX = Math.min(minX, rect.topLeft.x);
            minY = Math.min(minY, rect.topLeft.y);
            maxX = Math.max(maxX, rect.bottomRight.x);
            maxY = Math.max(maxY, rect.bottomRight.y);
        });

        return { minX, minY, maxX, maxY };
    }

    getScale() {
        const gcdTwo = (a, b) => {
        while (b !== 0) [a, b] = [b, a % b];
        return a;
        };

        let sidesList = [];
        this.rectangles.forEach(rect => {
            sidesList.push((rect.bottomRight.x - rect.topLeft.x), (rect.topLeft.y - rect.bottomRight.y));
        })
        const maxSide = Math.max(...sidesList)
        const softScale = 1 / sidesList.reduce((acc, side) => gcdTwo(acc, Math.abs(side)))
        const scaleFactor =  Math.min(40 / maxSide, softScale, 1);
        const sizeCorrector = maxSide * scaleFactor / Math.round(maxSide * scaleFactor);

        return [scaleFactor, sizeCorrector];
    }

    scaleCoordinates() {
        const bounds = this.getBoundaries(this.rectangles);
        const scaledRectangles = [];

        this.rectangles.forEach(rect => {
            const scaledRect = {
                topLeft: {
                    x: Math.round((rect.topLeft.x - bounds.minX) * this.scaleFactor),
                    y: Math.round((rect.topLeft.y - bounds.minY) * this.scaleFactor)
                },
                bottomRight: {
                    x: Math.round((rect.bottomRight.x - bounds.minX) * this.scaleFactor),
                    y: Math.round((rect.bottomRight.y - bounds.minY) * this.scaleFactor)
                }
            };
            scaledRectangles.push(scaledRect);
        });

        return {
            scaledRectangles,
            scaledWidth: Math.round((bounds.maxX - bounds.minX) * this.scaleFactor),
            scaledHeight: Math.round((bounds.maxY - bounds.minY) * this.scaleFactor)
        };
    }

    createGrid() {
        const { scaledRectangles, scaledWidth, scaledHeight } = this.scaleCoordinates();
        const bounds = this.getBoundaries(scaledRectangles);

        this.grid = Array(scaledHeight).fill().map(() => Array(scaledWidth).fill(0));

        scaledRectangles.forEach((rect, index) => {
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

    clearWhiteSpace() {
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
        this.clearWhiteSpace();

        if (this.grid.length === 0 || this.grid[0].length === 0) {
            return '<p>No rectangles to display</p>';
        }
        const maxTableWidth = 800;
        const maxTableHeight = 600;
        const cellSize = Math.min(
            Math.floor(maxTableWidth / this.grid[0].length),
            Math.floor(maxTableHeight / this.grid.length),
            30
        );

        let html = '<table style="border-collapse: collapse; border: 1px solid #ccc;">';

        this.grid.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                if (cell > 0) {
                    const colorIndex = (cell - 1) % this.colors.length;
                    html += `<td style="background-color: ${this.colors[colorIndex]}; border: 1px solid #333; width: ${cellSize}px; height: ${cellSize}px;"></td>`;
                } else {
                    html += `<td style="border: 1px solid #eee; width: ${cellSize}px; height: ${cellSize}px;"></td>`;
                }
            });
            html += '</tr>';
        });

        html += '</table>';
        return html;
    }

    generateCompactTable() {
        this.createGrid();
        // this.clearWhiteSpace();

        if (this.grid.length === 0 || this.grid[0].length === 0) {
            return '<p>No rectangles to display</p>';
        }
        const maxTableWidth = 800;
        const maxTableHeight = 600;
        const cellSize = Math.min(
            Math.floor(maxTableWidth / this.grid[0].length),
            Math.floor(maxTableHeight / this.grid.length),
            30
        ) * this.sizeCorrector;

        if (this.grid.length === 0 || this.grid[0].length === 0) {
            return '<p>No rectangles to display</p>';
        }

        let html = '<table style="border-collapse: collapse; border: 1px solid #ccc;">';

        this.grid.forEach((row, y) => {
            html += '<tr>';
            row.forEach((cell, x) => {
                if (cell > -1) {

                    if(cell > 0) {
                        let rowspan = 1;
                        let colspan = 1;

                        for (let paintY = y; paintY < this.grid.length; paintY++) {
                            for (let paintX = x; paintX < this.grid[0].length; paintX++) {
                                if (this.grid[paintY][paintX] === cell && !(paintX === x && paintY === y)) {
                                    this.grid[paintY][paintX] = -1;

                                    if(paintX === x) {
                                        rowspan++;
                                    }
                                    if(paintY === y) {
                                        colspan++
                                    }
                                }
                            }
                        }
                        const colorIndex = (cell - 1) % this.colors.length;
                        const width = cellSize * colspan;
                        const height = cellSize * rowspan;

                        html += `<td style="
                            background-color: ${this.colors[colorIndex]};
                            border: 1px solid #eee;
                            width: ${width}px;
                            height: ${height}px;" 
                            rowspan="${rowspan}" 
                            colspan="${colspan}">
                        </td>`;
                    } else {
                        html += `<td style="border: 1px solid #eee; width: ${cellSize}px; height: ${cellSize}px;"></td>`;
                    }
                }
            })
            html += '</tr>';
        })

        html += '</table>';
        return html;
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            // container.innerHTML = this.generateTable();
            container.innerHTML = this.generateCompactTable();
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const generator = new RectangleTableGenerator(rectangles);
    generator.render('tableContainer');
});
