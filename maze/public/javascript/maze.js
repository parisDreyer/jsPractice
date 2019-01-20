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
        }
    }
    let { start_coord, end_coord } = setStartAndEndCoordinates(grid, n, start, end);
    let paths = drawPathToEnd(grid, [start_coord.y, start_coord.x], [end_coord.y, end_coord.x], start, space, end);
    Object.keys(paths).map(y => paths[y].forEach(x => (x ? (grid[y][x] = wall) : false)));
    
    for(let i = 0; i < n; ++i){
        fillInWalls(grid, paths, n, i, wall, space);
    }
    // printMaze(grid, top_and_bottom);
    return grid;
}

    


// helper for buildMaze(). Draws a long winding path to end_pos
// returns a hash of coordinates that represent the path
function drawPathToEnd(grid, start_pos, end_pos, start, space, end){
    // some variables for the calculation
    let n = grid.length;
    let max = n - 2, min = 1;
    let max_path_length = Math.floor((n / 2) * n);
    let curr_path_length = 0;
    let path = {};  // path contains arrays of booleans 
                    // specifying whether a given index
                    // is an x coordinate in the path
                    // the return value of this function
    let [y, x] = start_pos;
    let still_searching = true; // y != end_pos[0] && x != end_pos[1];
    let counter = 0; // used for limiting movement in a given direction

    // helper functions for adding and removing coordinates from grid

    const checkEndReached = () => {
        if(y > 0 && y < n && grid[y][x] === end) {
            still_searching = false;
            return true;
        } else return false;
    }
    const add_coord = () => { 
        if (!path[y] && grid[y]) path[y] = [];
        if(path[y]){
            for(let i = path[y].length; i <= x; ++i){ path[y].push(false); }
            path[y][x] = true; // x is in the path;
        } return path[y] && path[y][x];
    }
    const updatePath = () => {
        if (y > 0 && y < n && grid[y][x] != start) {
          curr_path_length++;
          // grid[y][x] = space; // set the next step in the path
          return add_coord();
        } return false;
    };

    const isGoodDistanceFromEnd = () =>  // check if we've done enough meandering
        (max_path_length - curr_path_length) >
        (Math.abs(y - end_pos[0]) + Math.abs(x - end_pos[1])) + 1;
    
    // ========================================
    // until we have a good bunch of meandering, keep adding a meandering path
    let prevX = null, prevY = null;
    while(still_searching && isGoodDistanceFromEnd()){
        let good_horizontal_dist = Math.abs(y - prevY) > 2;
        let left = Math.random() > 0.495;
        let up = (!good_horizontal_dist || Math.abs(x - prevX) > 2) && Math.random() < 0.495; 
        if(end_pos[0] > y) diry = 1;
        else if (end_pos[0] < y) diry = -1; 
        if (end_pos[1] > x) dirx = 1;
        else if (end_pos[1] < x) dirx = -1;
        prevX = x, prevY = y;
        counter = randInRange(2, n / 2);

        if(good_horizontal_dist){
        if(left){
            while (counter > 0 && (x >= min || (y === max))){
                if (checkEndReached()) return path
                else if (updatePath()) x--;
                else { x--; break;}
                counter--;
            }
        } else {     
            while (counter > 0 && (x < max || y === max)) {
                if (checkEndReached()) return path
                else if(updatePath()) x++;
                else { x++; break;}
                counter--;
            }
        }
    }
        counter = randInRange(2, n / 2);
        if(up){
            while (counter > 0 && (y >= min || x === start_pos[0])) {
                if (checkEndReached()) return path
                else if (updatePath()) y--;
                else { y--; break;}
                counter--;
            }
        } else {
            while (counter > 0 && y <= max) {
                if (checkEndReached()) return path 
                else if(updatePath()) y++;
                else {y++; break;}
                counter--;
            }
        }
        still_searching = y != end_pos[0] || x != end_pos[1];
        if (x < min) { x = min; }
        if (x > max) { x = max; }
        if (y < min) { y = min; }
        if (y > max) { y = max; }
    }


    // ========================================
    // if not at end after meandering get to end, 
    // also remove any duplicate ways to get to the end
    // ==============================

    let startX = x, startY = y;
    let startXjunction = x, startYjunction = y;
    // removes a coordinate from the path
    const subtract_coord = (ny, nx) => {
        if (path[ny] && path[ny][nx] 
            && grid[ny][nx] != end 
            && grid[ny][nx] != start
            && ny != startY
            && nx != startX){
            path[ny][nx] = false; // nx is no longer the path;
        }
    }
    
    let dx = x - end_pos[1], dy = y - end_pos[0];
    dx = dx / Math.abs(dx), dy = dy / Math.abs(dy); // normalize
    const bringXHome = () => {  // get x to end pos x
        while(x != end_pos[1]){
            x -= dx;
            add_coord();
            subtract_coord(y - 1, x);  // remove extra possible paths from start to end
            subtract_coord(y + 1, x); 
        }
    }
    const bringYHome = () => {  // gets y to end pos y
        while (y != end_pos[0]) {
            y -= dy;
            add_coord();
            subtract_coord(y, x - 1); // remove extra possible paths from start to end
            subtract_coord(y, x + 1);
        }
    }
    let doXfirst = Math.round(Math.random()) > 0; // randomly choose to bring x or y home first
    if(doXfirst){
        bringXHome();
        bringYHome();
    } else {
        bringYHome();
        bringXHome();
    }
    return path;
}   // end function drawPathToEnd

function setRand2block(grid, y, x, diry, dirx, block, player_path){
    let vert = Math.round(Math.random()) > 0; // if true vertical, else horizontal
    let hasx = player_path[y] ? player_path[y][x] : false;
    if (vert) {
        if(!hasx) grid[y][x] = block;
        let mody = y + diry;
        if (!player_path[mody] || !player_path[mody][x]) grid[mody][x] = block;
    } else {
        if (!hasx) grid[y][x] = block;
        let modx = x + dirx;
        if (!player_path[y] || !player_path[y][modx]) grid[y][modx] = block;
    }
}
// helper methods:
function fillInWalls(grid, player_path, n, y, wall, space) {
    let max = n - 1;
    if(y === 0) return;
    for(let x = 0; x < max; ++x){
        // if a square of space
        let above_space = grid[y - 1][x] === space;
        let curr_space = grid[y][x] === space;
        let neighbor_space = grid[y][x + 1] === space;
        let above_neighbor_space = grid[y - 1][x + 1] === space;
        let has_space = (above_space && curr_space) || (above_neighbor_space && neighbor_space);
        if (x > 1) has_space = has_space || grid[y][x - 1] === space && grid[y - 1][x - 1] === space;

        // if all space fill some with wall
        if (has_space && curr_space && above_space && neighbor_space && above_neighbor_space){
            setRand2block(grid, y, x, -1, 1, wall, player_path);
        } 
    }
}

function swap(arr, i, j){
    let val = arr[i];
    arr[i] = arr[j];
    arr[j] = val;
}


function setStartAndEndCoordinates(grid, n, start, end) {
    let start_c = { y: 0, x: randInRange(0, n) }; // start at top
    let end_c = { y: (n - 1), x: randInRange(0, n) }; // end at bottom
    grid[start_c.y][start_c.x] = start;
    grid[end_c.y][end_c.x] = end;
    return {start_coord: start_c, end_coord: end_c };
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

// helper for connectSomeDisconnectedPools
function fourDirections(x, y, z, n, exclude = []){
    return [[y + z, x], [y - z, x], [y, x + z], [y, x - z]]
        .filter(coord => coord[0] > -1 && coord[1] > -1 && coord[0] < n && coord[1] < n)
        .filter(coord => !exclude.includes(coord[1]));
}


function absDif(pos1, pos2){
    let dy = pos1[0] - pos2[0];
    let dx = pos1[1] - pos2[1];
    return Math.sqrt(dy*dy + dx*dx);
}
