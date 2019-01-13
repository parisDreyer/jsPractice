function play(grid, wall, space, start, end) {
    let canvas = document.getElementById("mazeUI");
    let scale = 10;
    canvas.height = grid.length * scale;
    canvas.width = canvas.height;
    ctx = canvas.getContext("2d");
    let grid_map = {};  // out param to map canvas to grid
    let player = drawInitial(ctx, grid, wall, space, start, end, scale, grid_map);
    registerPlayerMovement(player); // adds event listener to dom for key input
    
    window.setInterval(() => {
        if(player.dirx != 0 || player.diry != 0)
            update(ctx, player, wall, space, start, end, scale, grid_map);
    }, 100)
}


function update(ctx, player, wall, space, start, end, scale, grid_map){

    drawPlayer(ctx, player, wall, space, start, end, scale, grid_map);
}

function drawInitial(ctx, grid, wall, space, start, end, scale, grid_map){
    let player = { 
        x: null, y: null, 
        prevX: null, prevY: null,
        dirx: 0, diry: 0,
        keys: {},
        type: 'p',
        scale: scale
    };
    
    for(let i = 0; i < grid.length; ++i){
        for(let j = 0; j < grid.length; ++j){
            let node = { x: j, y: i, type: grid[i][j] };
            let pos;
            if(i === 0 && node.type === start){ // create player there
                player.x = node.x;
                player.y = node.y;
                player.prevX = node.x;
                player.prevY = node.y;
                let p = drawPlayer(ctx, player, wall, space, start, end, scale, grid_map);
                pos = node;
                pos.x = p.x;
                pos.y = p.y;
                pos.scale = p.scale;
            } else{
                pos = drawNode(ctx, node, wall, space, start, end, scale);
            }
            if (!grid_map[pos.y]) grid_map[pos.y] = [];
            grid_map[pos.y].push(pos);
        }
    }
    console.log(grid_map);
    return player;
}

function drawPlayer(ctx, player, wall, space, start, end, scale, grid_map){
    let direction_changed = true;
    // update player pos
    let new_pos = { 
        x: (player.x + player.dirx),
        y: (player.y + player.diry)
    };
    if(playerCanMoveTo(new_pos, (ctx.canvas.width - scale) / scale, wall, scale, grid_map)){
        player.prevX = player.x;
        player.x += player.dirx;
        player.prevY = player.y;
        player.y += player.diry;
    } else direction_changed = false;

    if(direction_changed){
        // redraw previous node to uncover it from the canvas
        let prev_node = {
            x: player.prevX, y: player.prevY,
            type: typeAtCoord([player.prevY, player.prevX], grid_map, scale)
        };
        drawNode(ctx, prev_node, wall, space, start, end, scale);
        // draw player
        ctx.fillStyle = "#FF8C00";
        ctx.fillRect(player.x * scale, player.y * scale, scale, scale);
    }
    return player;
}

function drawNode(ctx, node, wall, space, start, end, scale){
    let pos = { x: node.x * scale, y: node.y * scale, size: scale, type: node.type };
    switch (node.type) {
        case wall:
            ctx.fillStyle = "#000";
            ctx.fillRect(pos.x, pos.y, scale, scale);
            break;
        case space:
            ctx.fillStyle = "#FFF";
            ctx.fillRect(pos.x, pos.y, scale, scale);
            break;
        case start:
            ctx.fillStyle = "#7FFF00";
            ctx.fillRect(pos.x, pos.y, scale, scale);
            break;
        case end:
            ctx.fillStyle = "#1E90FF";
            ctx.fillRect(pos.x, pos.y, scale, scale);
            break;
        default:
            break;
    }
    return pos;
}


// maxLR for 'maximum lower right'
function playerCanMoveTo(pos, maxLR, wall, scale, grid_map){
    if(!grid_map) return false;
    if(pos.x < 0 || pos.y < 0) return false;
    if(pos.x > maxLR || pos.y > maxLR) return false;

    return !(typeAtCoord(pos, grid_map, scale) === wall);
}

function typeAtCoord(pos, grid_map, range) {
    let max = (pos.y + range) / range;
    console.log(pos);
    for (let i = pos.y / range; i <= max; ++i) {
        if (grid_map[i]) {
            for (let j = 0; j < grid_map[i].length; ++j) {
                if (Math.abs(grid_map[i][j].x - pos.x) < range && Math.abs(grid_map[i][j].y - pos.y) < range) {
                  console.log(grid_map[i][j].type);
                  return grid_map[i][j].type;
                }
            }
        }
    }
}



// desktop keyboard controls for player
function registerPlayerMovement(player) {
    document.onkeydown = checkkey.bind(player);
    document.onkeyup = resetkey.bind(player);
}


function resetkey(e) {
    this.keys[e.keycode] = false;
    if (e.keyCode == '38') {
        this.diry = 0;
    }
    if (e.keyCode == '40') {
        // down arrow
        this.diry = 0;
    }
    if (e.keyCode == '37') {
        // left arrow
        this.dirx = 0;
    }
    if (e.keyCode == '39') {
        // right arrow
        this.dirx = 0;
    }
}


function checkkey(e) {
    this.keys[e.keyCode] = true;
    if (e.keyCode == '38') {
        // up arrow
        this.diry = -1;
    }
    if (e.keyCode == '40') {
        // down arrow
        this.diry = 1;
    }
    if (e.keyCode == '37') {
        // left arrow
        this.dirx = -1;
    }
    if (e.keyCode == '39') {
        // right arrow
        this.dirx = 1;
    }
}