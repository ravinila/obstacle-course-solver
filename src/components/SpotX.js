import { dist, removeFromArray, heuristic} from "./../common/utility";

export default class SpotX {
    constructor({i, j, width, height, settings}) {
        this.i = i;
        this.j = j;

        this.f = 0;
        this.g = 0;
        this.h = 0;

        this.neighbors = [];
        this.previous = undefined;
        this.previousX = undefined;
        
        this.type = 0;

        if (Math.random(1) < 0.2) {
            if (Math.random(1) < 0.5)
                this.type = 1;
            else
                this.type = 2;
        }

        /* 
            this.type values 
            =========
            0 -> none
            1 -> boulder
            2 -> gravel
            3 -> wormhole entrance
            4 -> wormhole exit
        */

        this.settings = settings;

        console.log("SpotX::", this);
    }
    addNeighbors (grid) {
        this.neighbors = [];
        var i = this.i;
        var j = this.j;
        if (i < this.settings.cols - 1) {
            this.neighbors.push(grid[i + 1][j]);
        }
        if (i > 0) {
            this.neighbors.push(grid[i - 1][j]);
        }
        if (j < this.settings.rows - 1) {
            this.neighbors.push(grid[i][j + 1]);
        }
        if (j > 0) {
            this.neighbors.push(grid[i][j - 1]);
        }
        if (this.settings.diagonalAllowed) {
            if (i > 0 && j > 0) {
                this.neighbors.push(grid[i - 1][j - 1]);
            }
            if (i < this.settings.cols - 1 && j > 0) {
                this.neighbors.push(grid[i + 1][j - 1]);
            }
            if (i > 0 && j < this.settings.rows - 1) {
                this.neighbors.push(grid[i - 1][j + 1]);
            }
            if (i < this.settings.cols - 1 && j < this.settings.rows - 1) {
                this.neighbors.push(grid[i + 1][j + 1]);
            }
        }
    }

}
