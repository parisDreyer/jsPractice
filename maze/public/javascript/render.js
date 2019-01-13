function play(grid, wall, space, start, end) {
    let canvas = document.getElementById("mazeUI");
    let scale = 10;
    canvas.height = grid.length * scale;
    canvas.width = canvas.height;
    ctx = canvas.getContext("2d");

    let player = drawInitial(ctx, grid, wall, space, start, end, scale);
    registerPlayerMovement(player); // adds event listener to dom for key input
    
    window.setInterval(() => {
        if(player.dirx != 0 || player.diry != 0)
            update(ctx, grid, player, wall, space, start, end, scale);
    }, 100)
}


function update(ctx, grid, player, wall, space, start, end, scale){

    drawPlayer(ctx, grid, player, wall, space, start, end, scale);
}

function drawInitial(ctx, grid, wall, space, start, end, scale){
    let player = { 
        x: null, y: null, 
        prevX: null, prevY: null,
        dirx: 0, diry: 0,
        keys: []
    };
    for(let i = 0; i < grid.length; ++i){
        for(let j = 0; j < grid.length; ++j){
            let node = { x: j, y: i, type: grid[i][j] };
            if(i === 0 && node.type === start){
                player.x = node.x;
                player.y = node.y;
                player.prevX = node.x;
                player.prevY = node.y;
                drawPlayer(ctx, grid, player, wall, space, start, end, scale);
            } else
                drawNode(ctx, node, wall, space, start, end, scale);
        }
    }
    return player;
}

function drawPlayer(ctx, grid, player, wall, space, start, end, scale){
    // update player pos
    player.prevX = player.x;
    player.prevY = player.y;
    player.x += player.dirx;
    player.y += player.diry;

    // redraw previous node to uncover it from the canvas
    let prev_node = {
        x: player.prevX, y: player.prevY,
        type: grid[player.prevY][player.prevX]
    };
    drawNode(ctx, prev_node, wall, space, start, end, scale);
    // draw player
    ctx.fillStyle = "#FF8C00";
    ctx.fillRect(player.x * scale, player.y * scale, scale, scale);
}

function drawNode(ctx, node, wall, space, start, end, scale){
    switch (node.type) {
        case wall:
            ctx.fillStyle = "#000";
            ctx.fillRect(node.x * scale, node.y * scale, scale, scale);
            break;
        case space:
            ctx.fillStyle = "#FFF";
            ctx.fillRect(node.x * scale, node.y * scale, scale, scale);
            break;
        case start:
            ctx.fillStyle = "#7FFF00";
            ctx.fillRect(node.x * scale, node.y * scale, scale, scale);
            break;
        case end:
            ctx.fillStyle = "#1E90FF";
            ctx.fillRect(node.x * scale, node.y * scale, scale, scale);
            break;
        default:
            break;
    }
}





// desktop keyboard controls for player
function registerPlayerMovement(player) {
    document.onkeydown = checkkey.bind(player);
    document.onkeyup = resetkey.bind(player);
}


function resetkey(e) {
    console.log(this);
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