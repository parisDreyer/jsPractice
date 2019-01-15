

// builds NxN maze with walls between random points
function buildMaze(n, wall = "u", space = " ", start = "%s", end ="%e"){
    let grid = [];
    let [empty_row, top_and_bottom] = generateLayoutVars(n, space);
    let walls_per_row = Math.sqrt(n);

    for(let i = 0; i < n; ++i){
        grid[i] = empty_row.slice();
        let occupied = [];  
        for(let j = 0; j < walls_per_row; ++j){
            let x = randInRange(j, n);
            grid[i][x] = wall;
            occupied.push(x);
            if (i > 0 && grid[i][x] === wall && grid[i - 1][x] === wall)
                swapNextAvailable(grid, n, i, x, space, wall);
        }
        fillInWalls(grid, n, i, wall, space);
    }

    let { start_c, end_c } = startAndEndCoordinates(n);
    grid[start_c.y][start_c.x] = start;
    grid[end_c.y][end_c.x] = end;
    // printMaze(grid, top_and_bottom);

    return grid;
}

// helper methods:
function fillInWalls(grid, n, y, wall, space){
    let max = n - 1;
    if(y === 0) return;
    // addAtRow_WallsBetweenColumnsAndRows(grid, i, wall, space);
    for(let x = 0; x < max; ++x){
        // if a square of space
        if(grid[y][x] === space && grid[y - 1][x] === space && grid[y][x + 1] === space && grid[y - 1][ x + 1] === space){
            let vert = Math.round(Math.random()) > 0; // if true vertical, else horizontal
            if(vert){
                grid[y][x] = wall;
                grid[y - 1][x] = wall;
            }else{
                grid[y][x] = wall;
                grid[y][x + 1] = wall;
            }
        }
    }
}



function addAtRow_WallsBetweenColumnsAndRows(grid, y, wall, space){
    if(y > 1){
        for(let x = 0; x < grid.length; x++){
            let is_w = grid[y][x] === wall;
            if(is_w && grid[y - 2][x] === wall && grid[y - 1][x] === space){
                grid[y - 1][x] = wall;
            } else if (x > 1 && is_w && grid[y][x - 2] === wall && grid[y][x - 1] === space){
                grid[y][x - 1] = wall;
            }
        }
    }
}


function startAndEndCoordinates(n) {
    return { 
        start_c: { y: 0, x: randInRange(0, n) }, // start at top
        end_c: { y: (n - 1), x: randInRange(0, n) } // end at bottom
    };
}

function generateLayoutVars(n, space){
    let empty_row = [];
    let top_and_bottom = "^_";
    for (let i = 0; i < n; ++i) {
        empty_row.push(space);
        top_and_bottom += "_"
    }
    top_and_bottom += "_^";
    return [empty_row, top_and_bottom];
}

function printMaze(grid, top_and_bottom){
    console.log(top_and_bottom + 
        "\n" + grid.map(row => "| " + 
        row.join("") + " |").join("\n") + "\n" + top_and_bottom);
}


// helper for buildMaze()
function swapNextAvailable(grid, n, i, x, space, wall){
    for (let z = 0; z < n; ++z) {
        let neighbors_empty = (grid[i][z - 1] === space || grid[i][z + 1] === space);
        let is_walkable = grid[i][z] === space && neighbors_empty;
        if (is_walkable && grid[i - 1][z] === space) {
            neighbors_empty = grid[i - 1][z - 1] === space || grid[i - 1][z + 1] === space;
            if(neighbors_empty){
               grid[i][z] = wall;
                grid[i][x] = space;
                break;
            }
        }
    }
}

// max is an exclusive upper bound
function randInRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

// testing
// for(let i = 0; i < 1000; ++i){  
//     buildMaze(42);
// }