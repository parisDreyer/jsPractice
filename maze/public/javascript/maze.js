

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
    let preserve_spaces = {};
    for(let i = 0; i < paths.length; ++i){
        let [y, x] = paths[i];
        if(!preserve_spaces[y]) preserve_spaces[y] = [x];
        else if(!preserve_spaces[y].includes(x)) preserve_spaces[y].push(x);
    }
    for(let i = 0; i < n; ++i){
        fillInWalls(grid, preserve_spaces, n, i, wall, space);
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
    let path = [];
    let [y, x] = start_pos;
    let still_searching = true;// y != end_pos[0] && x != end_pos[1];

    const checkEndReached = () => {
        if(grid[y][x] === end) {
            console.log('end reached', [y, x]);
            still_searching = false;
            // path.push([y, x]);
            return true;
        } else return false;
    }
    while(still_searching){
        let left = Math.random() > 0.495;
        let up = Math.random() < 0.495;
        if(end_pos[0] > y) diry = 1;
        else if (end_pos[0] < y) diry = -1; 
        if (end_pos[1] > x) dirx = 1;
        else if (end_pos[1] < x) dirx = -1;
        let srty = y != end_pos[0], srtx = x != end_pos[1];
        let counter = randInRange(0, Math.floor(n/ 2));
        while(counter > 0 && (srty || srtx) ){
            if (checkEndReached()) { 
                return path;
            } else if(grid[y][x] != start) {
                grid[y][x] = space;    // set the next step in the path
                path.push([y, x]);
            }
            if(srty) y += diry;
            else if (srtx) x += dirx;
            else break;
            srty = y != end_pos[0], srtx = x != end_pos[1];
            if (x < min) { x = min; break; }
            if (x > max) { x = max; break; }
            if (y < min) { y = min; break; }
            if (y > max) { y = max; break; }
            counter--;
        }
        counter = randInRange(0, n / 2);
        if(left){
            while(counter > 0 && x > 0){
                if(checkEndReached()){ 
                    return path;
                } else if (grid[y][x] != start) {
                    grid[y][x] = space;    // set the next step in the path
                    path.push([y, x]);
                }
                x--;
                counter--;
            }
        } else {     
            while (counter > 0 && x < n) {
                if(checkEndReached()){ 
                    return path;
                } else if (grid[y][x] != start){
                    grid[y][x] = space;    // set the next step in the path
                    path.push([y, x]);
                }
                x++;
                counter--;
            }
        }
        counter = randInRange(0, n / 2);
        if(up){
            while (counter > 0 && y > 0) {
                if(checkEndReached()){ 
                    return path;
                } else if (grid[y][x] != start) {
                    grid[y][x] = space;    // set the next step in the path
                    path.push([y, x]);
                }
                y--;
                counter--;
            }
        } else {
            while (counter > 0 && y < n) {
                if(checkEndReached()){ 
                    return path;
                } else if (grid[y][x] != start) {
                    grid[y][x] = space;    // set the next step in the path
                    path.push([y, x]);
                }
                y++;
                counter--;
            }
        }
        console.log(`y: ${y}  x: ${x}`, end_pos);
        still_searching = y != end_pos[0] || x != end_pos[1];
        if (x < min) { x = min; }
        if (x > max) { x = max; }
        if (y < min) { y = min; }
        if (y > max) { y = max; }
        console.log('still_searching: ', still_searching);
    }
    return path;
}

function setRand2block(grid, y, x, diry, dirx, block, player_path){
    let vert = Math.round(Math.random()) > 0; // if true vertical, else horizontal
    let hasx = !player_path[y] || player_path[y].includes(x);
    if (vert) {
        if(!hasx) grid[y][x] = block;
        if (!player_path[y + diry] || !player_path[y + diry].includes(x)) grid[y + diry][x] = block;
    } else {
        if (!hasx) grid[y][x] = block;
        if (!player_path[y] || !player_path[y].includes(x + dirx)) grid[y][x + dirx] = block;
    }
}
// helper methods:
function fillInWalls(grid, player_path, n, y, wall, space){
    let max = n - 1;
    if(y === 0) return;
    let posMarkedForWall = [];
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
        // if all wall fill some with space
        // if (x > 0 && grid[y][x] === wall && grid[y - 1][x] === wall && grid[y][x - 1] === wall && grid[y - 1][x - 1] === wall) {
        //     setRand2block(grid, y, x, -1, -1, space, player_path);
        // } else if (grid[y][x] === wall && grid[y - 1][x] === wall && grid[y][x + 1] === wall && grid[y - 1][x + 1] === wall){
        //     setRand2block(grid, y, x, -1, 1, space, player_path);
        // }

        // add a wall in a diagonal at random
        // if (Math.round(Math.random()) > 0){
        //     if (!curr_space && above_space && neighbor_space && (!player_path[y] || !player_path[y].includes(x))) { // diag not filled in
        //         posMarkedForWall.push([y, x]);
        //     } else if (above_neighbor_space && curr_space && (!player_path[y] || !player_path[y].includes(x + 1))) {
        //         posMarkedForWall.push([y, x + 1]);
        //     }
        // }

        // checks if any diags are getting in way of moving to next level
        // if(x > 0 && !curr_space && above_space && (!above_neighbor_space || grid[y - 1][x - 1] === wall)) {
        //     grid[y][x] = space;
        // } else if (!curr_space && above_space && (!above_neighbor_space || grid[y - 1][x + 1] === wall)) {
        //     grid[y][x] = space;
        // }
        
    }

    // for(let i = 0; i < posMarkedForWall.length - 2; ++i){
    //     let random_idx = randInRange(0, posMarkedForWall.length);
    //     swap(posMarkedForWall, random_idx, posMarkedForWall.length - 1);
    //     let pos = posMarkedForWall.pop();
    //     grid[pos[0]][pos[1]] = wall;
    // }
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

function merge(a, b){
    let bkeys = Object.keys(b).forEach(y => {
        let group = b[y];
        Object.keys(group).forEach(gk => {
          if (!a[y]) a[y] = {};
          if (!a[y][gk]) {
            a[y][gk] = true;
          }
        })
    });
    return a;
}


function absDif(pos1, pos2){
    let dy = pos1[0] - pos2[0];
    let dx = pos1[1] - pos2[1];
    return Math.sqrt(dy*dy + dx*dx);
}



// testing
// for(let i = 0; i < 1000; ++i){  
//     buildMaze(42);
// }