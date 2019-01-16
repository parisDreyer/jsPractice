function play(grid, wall, space, start, end, window_width) {
    let canvas = document.getElementById("mazeUI");
    let defaultMazeWidth = 500.0;
    let scale = Math.floor(10 * (window_width / defaultMazeWidth));
    canvas.height = grid.length * scale;
    canvas.width = canvas.height;
    ctx = canvas.getContext("2d");
    let player = drawInitial(ctx, grid, wall, space, start, end, scale);
    registerPlayerMovement(player); // adds event listener to dom for key input
    
    let game_loop = window.setInterval(() => {
        if(player.dirx != 0 || player.diry != 0)
            update(ctx, player, wall, space, start, end, scale, grid);
    }, 100);
    return { loop: game_loop, player };
}


function update(ctx, player, wall, space, start, end, scale, grid){

    drawPlayer(ctx, player, wall, space, start, end, scale, grid);
}

function drawInitial(ctx, grid, wall, space, start, end, scale){
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
            if(i === 0 && node.type === start){ // create player there
                player.x = node.x;
                player.y = node.y;
                player.prevX = node.x;
                player.prevY = node.y;
                drawPlayer(ctx, player, wall, space, start, end, scale, grid);
            } else{
                drawNode(ctx, node, wall, space, start, end, scale);
            }
        }
    }
    return player;
}

function drawPlayer(ctx, player, wall, space, start, end, scale, grid){

    // update player pos
    let new_pos = { 
        x: (player.x + player.dirx),
        y: (player.y + player.diry)
    };
    if(playerCanMoveTo(new_pos, (ctx.canvas.width - scale) / scale, wall, grid)){
        player.prevX = player.x;
        player.x = new_pos.x;
        player.prevY = player.y;
        player.y = new_pos.y;
        // redraw previous node to uncover it from the canvas
        let prev_node = {
            x: player.prevX, y: player.prevY,
            type: typeAtCoord({ y: player.prevY, x: player.prevX }, grid)
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
    return node;
}


// maxLR for 'maximum lower right'
function playerCanMoveTo(pos, maxLR, wall, grid){
    if(!grid) return false;
    if(pos.x < 0 || pos.y < 0) return false;
    if(pos.x > maxLR || pos.y > maxLR) return false;

    return !(typeAtCoord(pos, grid) === wall);
}

function typeAtCoord(pos, grid) {
    if(grid[pos.y]) return grid[pos.y][pos.x];
}



// desktop keyboard controls for player
function registerPlayerMovement(player) {
    let on = document.onkeydown = checkkey.bind(player);
    let off = document.onkeyup = resetkey.bind(player);
    registerButtonMovement(player, on, off);
}

function registerButtonMovement(player, on, off) {
  let up = document.getElementById("upArrow");
  let right = document.getElementById("rightArrow");
  let down = document.getElementById("downArrow");
  let left = document.getElementById("leftArrow");
  up.onmouseover = () => on({ keyCode: "38" });     //player.diry = -1;
  up.onmouseleave = () => off({ keyCode: "38" });      //player.diry = 0;
  right.onmouseover = () => on({ keyCode: "39" });  //player.dirx = 1;
  right.onmouseleave = () => off({ keyCode: "39" });   //player.dirx = 0;
  down.onmouseover = () => on({ keyCode: '40' });   //(player.diry = 1);
  down.onmouseleave = () => off({ keyCode: '40' });    //(player.diry = 0);
  left.onmouseover = () => on({ keyCode: '37' });   //(player.dirx = -1);
  left.onmouseleave = () => on({ keyCode: '37' });     //(player.dirx = 0);
}
function resetkey(e) {
    this.keys[e.keyCode] = false;
    if (e.keyCode == '38') {
        // up arrow
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
    console.log(this.keys);
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