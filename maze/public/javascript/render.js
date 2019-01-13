function play(grid, wall, space, start, end) {
    let canvas = document.getElementById("mazeUI");
    let scale = 10;
    canvas.height = grid.length * scale;
    canvas.width = canvas.height;
    ctx = canvas.getContext("2d");

    draw(ctx, grid, wall, space, start, end, scale);
}


function draw(ctx, grid, wall, space, start, end, scale){
    for(let i = 0; i < grid.length; ++i){
        for(let j = 0; j < grid.length; ++j){
            let node = { x: j, y: i, type: grid[i][j] };
            drawNode(ctx, node, wall, space, start, end, scale);
        }
    }
}


function drawNode(ctx, node, wall, space, start, end, scale){
    console.log(node);
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
            ctx.fillStyle = "#FFD700";
            ctx.fillRect(node.x * scale, node.y * scale, scale, scale);
            break;
        default:
            break;
    }
}