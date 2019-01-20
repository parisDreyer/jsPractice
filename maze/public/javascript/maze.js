

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
    plotPointsOnGrid(grid, paths, space);
    
    for(let i = 0; i < n; ++i){
        fillInWalls(grid, paths, n, i, wall, space);
    }
    // printMaze(grid, top_and_bottom);
    return grid;
}

function plotPointsOnGrid(grid, points, mark){
    for(let i = 0; i < points.length; ++i){
        let [y, x] = points[i];
        grid[y][x] = mark;
    }
}

// draws a long winding path to end
// returns a hash of coordinates that represent the path
function drawPathToEnd(grid, start_pos, end_pos, start, space, end){
    let n = grid.length;
    let max = n - 2, min = 1;
    let path = {};              // the return value of this function
    let [y, x] = start_pos;
    let still_searching = true; // y != end_pos[0] && x != end_pos[1];
    let counter = 0;            // used for limiting movement in a given direction

    const checkEndReached = () => {
        if(y > 0 && y < n && grid[y][x] === end) {
            ////console.log('end reached', [y, x]);
            still_searching = false;
            // path.push([y, x]);
            return true;
        } else return false;
    }

    const updatePath = () => {
        let signal = false; // signal whether to return path
        if (y > 0 && y < n && grid[y][x] != start) {
          grid[y][x] = space; // set the next step in the path
          if (!path[y]) {
              path[y] = [x];
              signal = true;
          }else if (!path[y].includes(x)) {
            path[y].push(x);
              signal = true;
          }
        } return signal;
    };

    while(still_searching){ 
        let left = Math.random() > 0.495;
        let up = Math.random() < 0.495;
        if(end_pos[0] > y) diry = 1;
        else if (end_pos[0] < y) diry = -1; 
        if (end_pos[1] > x) dirx = 1;
        else if (end_pos[1] < x) dirx = -1;

        counter = randInRange(2, n / 2);
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
        //console.log(`y: ${y}  x: ${x}`, end_pos);
        still_searching = y != end_pos[0] || x != end_pos[1];
        if (x < min) { x = min; }
        if (x > max) { x = max; }
        if (y < min) { y = min; }
        if (y > max) { y = max; }
        //console.log('still_searching: ', still_searching);
    }
    return path;
}

function setRand2block(grid, y, x, diry, dirx, block, player_path){
    let vert = Math.round(Math.random()) > 0; // if true vertical, else horizontal
    // console.log(y, x);
    // console.log(player_path);
    let hasx = player_path[y] ? player_path[y].includes(x) : false;
    if (vert) {
        if(!hasx) grid[y][x] = block;
        let mody = y + diry;
        if (!player_path[mody] || !player_path[mody].includes(x)) grid[mody][x] = block;
    } else {
        if (!hasx) grid[y][x] = block;
        let modx = x + dirx;
        if (!player_path[y] || !player_path[y].includes(modx)) grid[y][modx] = block;
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
