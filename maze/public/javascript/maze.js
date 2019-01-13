

// builds NxN maze with walls between random points
function buildMaze(n, wall = "u", space = " ", start = "%s", end ="%e"){
    let grid = [];
    let [empty_row, top_and_bottom] = generateLayoutVars(n, wall, space);
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
    }

    ensureEndHasOnePath(grid, n, wall, start, end, space);
    // printMaze(grid, top_and_bottom);

    return grid;
}

// helper methods:

function ensureEndHasOnePath(grid, n, wall, start, end, space){
    let {start_c, end_c} = startAndEndCoordinates(n);
    grid[start_c.y][start_c.x] = start;
    grid[end_c.y][end_c.x] = end;

    let cntr = {  x: end_c.x, y: end_c.y };

    let max = n - 1;
    mid = n / 2;
    let i = 1;
    while( i < mid ){
        let uly = cntr.y - i;  // upper left
        let ulx = cntr.x - i
        let lry = cntr.y + i;  // lower right
        let lrx = cntr.x + i;
        let ul = { y: uly < 0 ? 0 : uly, x: ulx < 0 ? 0 : ulx  }; 
        let lr = { y: lry > max ? max : lry, x: lrx > max ? max : lry };
        
        ensurePerimeterHasOneOpening(grid, wall, start, end, space, ul, lr);
        ++i;
    }
}

// ul="upper left", lr="lower right"
function ensurePerimeterHasOneOpening(grid, wall, start, end, space, ul, lr, path_crd = null){
    if(path_crd) console.log('iter');
    if (!grid[ul.y] || grid[lr.y] || !grid[ul.y][ul.x] || grid[lr.y][lr.x]) return;

    let openings = openingsAlongPerimeter(grid, ul, lr, space, start, path_crd);
    if(openings.length === 0) { return; }

    if(path_crd){
        for(let i = 0; i < openings.length; ++i){
            let dy = openings[i][0] - path_crd[0];
            let absdx = Math.abs(dx);
            let dx = openings[i][1] - path_crd[1];
            let absdy = Math.abs(dy);
            if(!(dx === dy) && (absdy === 1 || absdx === 1)){
                path_crd[0] = openings[i][0] + dy;
                path_crd[1] = openings[i][1] + dx;
                break;
            }
        }
    } else {
        shuffle(openings);
        path_crd = openings.pop();
    }
    fillAllCoordsWithWalls(grid, openings, wall, start, path_crd);
    let new_ul = { y: ul.y - 1, x: ul.x - 1 };
    let new_lr = { y: lr.y + 1, x: lr.x + 1 };
    ensurePerimeterHasOneOpening(grid, wall, start, end, space, new_ul, new_lr, path_crd);
}

// adds in space to keep one path to end open
// doesn't fill in the start coord
function openingsAlongPerimeter(grid, ul, lr, space, start, path_coord){
    let openings = []

    for (let i = ul.y; i < lr.y; ++i) { // scan top and bottom
        if(path_coord && path_coord[0] === i && path_coord[1] === ul.x) { // ul
            markAtCoord(grid, path_coord, space, start) // make one path to end
        } else if (grid[i][ul.x] === space) openings.push([i, ul.x]);
        if (path_coord && path_coord[0] === i && path_coord[1] === lr.x) { // lr
            markAtCoord(grid, path_coord, space, start) // make one path to end
        } else if (grid[i][lr.x] === space) openings.push([i, lr.x]);
    }
    for (let j = ul.x; j < lr.x; ++j) { // scan side left and side right
        if(path_coord && path_coord[0] === ul.y && path_coord[1] === j){
            markAtCoord(grid, path_coord, space, start) // make one path to end
        } else if (grid[ul.y][j] === space) openings.push([ul.y, j]);
        if (path_coord && path_coord[0] === lr.y && path_coord[1] === j) {
            markAtCoord(grid, path_coord, space, start) // make one path to end
        } else if (grid[lr.y][j] === space) openings.push([lr.y, j]);
    }

    return openings;
}


function fillAllCoordsWithWalls(grid, coords, wall, start, path_coord){
    for(let i = 0; i < coords.length; ++i) {
        if (path_coord && path_coord[0] === coords[i][0] && path_coord[1] === coords[i][1]){}
        else markAtCoord(grid, coords[i], wall, start);
    }
}

function markAtCoord(grid, path_coord, mark, start){
    if (!grid[path_coord[0]][path_coord[1]] === start){
        grid[path_coord[0]][path_coord[1]] = mark;
    }
}

function startAndEndCoordinates(n) {
    return { 
        start_c: { y: 0, x: randInRange(0, n) }, // start at top
        end_c: { y: (n - 1), x: randInRange(0, n) } // end at bottom
    };
}

function generateLayoutVars(n, wall, space){
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