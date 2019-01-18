

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
        fillInWalls(grid, n, i, wall, space);
    }
    let { start_coord, end_coord } = setStartAndEndCoordinates(grid, n, start, end);
    let paths = drawPathToEnd(grid, [start_coord.y, start_coord.x], [end_coord.y, end_coord.x], start, space, end);
    plotPointsOnGrid(grid, paths, space);
    connectSomeDisconnectedPools(grid, [start_coord.y, start_coord.x], [end_coord.y, end_coord.x], wall, space, start, end);
    // printMaze(grid, top_and_bottom);
    return grid;
}

function plotPointsOnGrid(grid, points, mark){
    console.log(points);
    for(let i = 0; i < points.length; ++i){
        let [y, x] = points[i];
        grid[y][x] = mark;
    }
}

// draws a long winding path to end
// returns a hash of coordinates that represent the path
function drawPathToEnd(grid, start_pos, end_pos, start, space, end){
    let n = grid.length;
    let path = [];
    let [y, x] = start_pos;
    while(y != end_pos[0] && x != end_pos[1]){
        let left = Math.random() > 0.495;
        if(end_pos[0] > y) diry = 1;
        else if (end_pos[0] < y) diry = -1; 
        if (end_pos[1] > x) dirx = 1;
        else if (end_pos[1] < x) dirx = -1;
        let srty = y != end_pos[0], srtx = x != end_pos[1];
        let counter = 10;
        while(counter > 0 && (srty || srtx) ){
            if(grid[y][x] === end) return path;
            else if(grid[y][x] != start) {
                grid[y][x] = space;    // set the next step in the path
                path.push([y, x]);
            }
            if(srty) y += diry;
            else if (srtx) x += dirx;
            else break;
            srty = y != end_pos[0], srtx = x != end_pos[1];
            if(x < 0){ x = 0; break;}
            if(x >= n) { x = n - 1; break;}
            if (y < 0) { y = 0; break; }
            if (y >= n) { y = n - 1; break; }
            counter--;
        }
        counter = 2;
        if(left){
            while(counter > 0 && x > 0){
                x--;
                if (grid[y][x] === start || grid[y][x] === end) return path;
                else grid[y][x] = space;    // set the next step in the path
                if(x > -1) path.push([y, x]);
                counter--;
            }
        } else {
            while (counter > 0 && x < n) {
                x++;
                if(x < n) path.push([y, x]);
                if (grid[y][x] === start || grid[y][x] === end) return path;
                else grid[y][x] = space;    // set the next step in the path
                counter--;
            }
        }
    }
    return path;
}

function setRand2block(grid, y, x, diry, dirx, block){
    let vert = Math.round(Math.random()) > 0; // if true vertical, else horizontal
    if (vert) {
        grid[y][x] = block;
        grid[y + diry][x] = block;
    } else {
        grid[y][x] = block;
        grid[y][x + dirx] = block;
    }
}
// helper methods:
function fillInWalls(grid, n, y, wall, space){
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
            setRand2block(grid, y, x, -1, 1, wall);
        } 
        // if all wall fill some with space
        if (x > 0 && grid[y][x] === wall && grid[y - 1][x] === wall && grid[y][x - 1] === wall && grid[y - 1][x - 1] === wall) {
            setRand2block(grid, y, x, -1, -1, space);
        } else if (grid[y][x] === wall && grid[y - 1][x] === wall && grid[y][x + 1] === wall && grid[y - 1][x + 1] === wall){
            setRand2block(grid, y, x, -1, 1, space);
        }

        // add a wall in a diagonal at random
        if (Math.round(Math.random()) > 0){
            if (above_space && neighbor_space){ // diag not filled in
                posMarkedForWall.push([y, x + 1]);
            } else if (above_neighbor_space && curr_space){
                posMarkedForWall.push([y, x+1]);
            }
        }

        // checks if any diags are getting in way of moving to next level
        if(x > 0 && !curr_space && above_space && (!above_neighbor_space || grid[y - 1][x - 1] === wall)){
            grid[y][x] = space;
        } else if (!curr_space && above_space && (!above_neighbor_space || grid[y - 1][x + 1] === wall)) {
            grid[y][x] = space;
        }
        
    }

    for(let i = 0; i < posMarkedForWall.length - 2; ++i){
        let random_idx = randInRange(0, posMarkedForWall.length);
        swap(posMarkedForWall, random_idx, posMarkedForWall.length - 1);
        let pos = posMarkedForWall.pop();
        grid[pos[0]][pos[1]] = wall;
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

function floodsearch(grid, y, x, target, seen = {}){
    // base cases
    let yinbounds = y + 1 < grid.length;
    if(y < 0 || !yinbounds) return seen;
    let xinbounds = x + 1 < grid.length;
    if(x < 0 || !xinbounds) return seen;
    if(grid[y][x] != target) return seen;

    if(!seen[y]) seen[y] = {};
    if(yinbounds && !seen[y+1]) seen[y+1] = {};
    if(y > 0 && !seen[y - 1]) seen[y - 1] = {};
    if(!seen[y][x]) seen[y][x] = true;

    if(yinbounds && !seen[y + 1][x]){
        merge(seen, floodsearch(grid, y + 1, x, target, seen));
    }if(y > 0 && !seen[y - 1][x]){
        merge(seen, floodsearch(grid, y - 1, x, target, seen));
    }if(!seen[y][x]){
        merge(seen, floodsearch(grid, y, x + 1, target, seen));
    }if(x > 0 && !seen[y][x - 1]){
        merge(seen, floodsearch(grid, y, x - 1, target, seen));
    }
    return seen;
}

function connectSomeDisconnectedPools(grid, start_pos, end_pos, wall, space, start, end) {
    let length = grid.length;
    count = 0;
    while(length > 1 && count < 10){
        count++
        // console.log(count, length);
        let allseen = [];
        let mid = Math.floor(grid.length / 2);
        for(let i = 0; i < grid.length; ++i){
            let pool1 = floodsearch(grid, i, i, space); 
            let found1 = allseen.filter(pool => poolAccessibleFromOther(pool, pool1));
            if(!found1.length > 0) allseen.push(pool1);

            let pool2 = floodsearch(grid, i, grid.length - 1 - i);
            let found2 = allseen.filter(pool => poolAccessibleFromOther(pool, pool2))
            if (i != mid && !found2.length > 0) allseen.push(pool2);
        }

        walls_to_remove = [];
        length = allseen.length;
        while(allseen.length > 0){
            let pool = allseen.pop();
            let ys = Object.keys(pool);
            for(let i = 0; i < ys.length; ++i){
                let y = ys[i];
                let xs = Object.keys(pool[y]);
                for(let j = 0; j < xs.length; ++j){
                    let x = xs[j];
                    let res = scanForWall(grid, y, x, wall, 5)
                    if(res){
                        walls_to_remove.push(res);
                    }
                }
            }
        }

        for(let i = 0; i < walls_to_remove.length; ++i){
            let [ry, rx] = walls_to_remove[i];
            grid[ry][rx] = space;
        }
    }
}
function scanForWall(grid, y, x, wall, dist){
    if(grid[y] && grid[x] === wall) return [y, x];
    else if(!grid[y] || !grid[y][x]) return false;
    if(dist === 0) return false;
    let nxt_checks = fourDirections(x, y, 1, grid.length);
    for(let i = 0; i < nxt_checks.length; ++i){
        let res = scanForWall(grid, nxt_checks[0], nxt_checks[1], wall, dist - 1);
        if(res) return res;
    }
    return false;
}


function poolAccessibleFromOther(pool1, pool2){
    let ys = Object.keys(pool1);
    for(let i = 0; i < ys.length; ++i){
        let y = ys[i];
        let xs = pool1[y];
        for(let j = 0; j < xs.length; ++j){
            let x = xs[j];
            if(pool2[y] && pool2[y][x]) return true;
        }
    }
    return false;
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