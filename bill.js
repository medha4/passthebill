//board
let board;
let boardWidth = 600;
let boardHeight = 300;
let context;

//bill
let billWidth = 100;
let billHeight = 100;
let billX = 50;
let billY = boardHeight - billHeight - 50;
let billImg;

let bill = {
    x : billX,
    y : billY,
    width : billWidth,
    height : billHeight
}

//block
let blockArray = [];

let filibusterWidth = 70;
let vetoWidth = 69;
let novotesWidth = 75;

let blockHeight = 70;
let blockX = 700;

let blockY = boardHeight - blockHeight - 50;

let filibusterImg;
let vetoImg;
let novotesImg;

//physics
let velocityX = -8; //block moving left speed
// let velocityX = -20; //block moving left speed
let velocityY = 0;
let gravity = .4;

let gameOver = false;
let score = 0;

let highscore = 0;
let scores = decodeURIComponent(document.cookie).split('=');
console.log(scores)

if(scores.length > 1){
    console.log(highscore)
    highscore = scores[1];
}


window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext("2d"); //used for drawing on the board

    
    // draw initial bill
    context.fillRect(bill.x, bill.y, bill.width, bill.height);

    billImg = new Image();
    billImg.src = "./img/pagebill.png";
    billImg.onload = function() {
        context.drawImage(billImg, bill.x, bill.y, bill.width, bill.height);
    }

    filibusterImg = new Image();
    filibusterImg.src = "./img/talking.png";

    vetoImg = new Image();
    vetoImg.src = "./img/voter.png";

    novotesImg = new Image();
    novotesImg.src = "./img/gavel_black.png"



    requestAnimationFrame(update);
    setInterval(placeblock, 1000); //1000 milliseconds = 1 second

    document.addEventListener("keydown", movebill);
    
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);
    drawLine(context, 0, 250, 600, 250, '#4A4A4A', 2);
   

    //bill
    velocityY += gravity;
    bill.y = Math.min(bill.y + velocityY, billY); //apply gravity to current bill.y, making sure it doesn't exceed the ground
    context.drawImage(billImg, bill.x, bill.y, bill.width, bill.height);



    //block
    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        block.x += velocityX;
        context.drawImage(block.img, block.x, block.y, block.width, block.height);

        if (detectCollision(bill, block)) {
            gameOver = true;
            // billImg.src = "./img/bill-dead.png";
            if(score > highscore){
                document.cookie = "highscore=" + score + ";";

            }

            console.log("highscore", highscore, score)
           
            if(confirm('Score: ' +score+'\n\nYou shall not pass! Click OK to try again.')){
                window.location.reload();  
                
            }
            billImg.onload = function() {
                context.drawImage(billImg, bill.x, bill.y, bill.width, bill.height);
            }
        }
    }

    //score
    context.fillStyle="black";
    context.font="15px PressStart2P";
    score++;
    context.fillText("Current Score: " + score, 315, 30);
    context.fillText("High Score: " + highscore, 15, 30);
}

function movebill(e) {
    if (gameOver) {
        return;
    }

    if ((e.code == "Space" || e.code == "ArrowUp") && bill.y == billY) {
        //jump
        velocityY = -10;
    }
    else if (e.code == "ArrowDown" && bill.y == billY) {
        //duck
    }

}

function placeblock() {
    if (gameOver) {
        return;
    }

    //place block
    let block = {
        img : null,
        x : blockX,
        y : blockY,
        width : null,
        height: blockHeight
    }

    let placeblockChance = Math.random(); //0 - 0.9999...

    if (placeblockChance > .90) { //10% you get novotes
        block.img = novotesImg;
        block.width = novotesWidth;
        blockArray.push(block);
    }
    else if (placeblockChance > .70) { //30% you get veto
        block.img = vetoImg;
        block.width = vetoWidth;
        blockArray.push(block);
    }
    else if (placeblockChance > .50) { //50% you get filibuster
        block.img = filibusterImg;
        block.width = filibusterWidth;
        blockArray.push(block);
    }

    if (blockArray.length > 5) {
        blockArray.shift(); //remove the first element from the array so that the array doesn't constantly grow
    }
}

function drawLine(ctx, x1, y1, x2,y2, stroke = 'black', width = 3) {
        // start a new path
        ctx.beginPath();

        // place the cursor from the point the line should be started 
        ctx.moveTo(x1, y1);

        // draw a line from current cursor position to the provided x,y coordinate
        ctx.lineTo(x2, y2);

        // set strokecolor
        ctx.strokeStyle = stroke;

        // set lineWidht 
        ctx.lineWidth = width;

        // add stroke to the line 
        ctx.stroke();
      }


function detectCollision(a, b) {
    let takenPixels = [];

    for (let y = 0; y < billPixels.length; y++) {
        for (let x = 0; x < billPixels[0].length; x++) {
            if (billPixels[y][x] === 1) {
                takenPixels.push([a.x + x, a.y + y]);
            }
        }
    }

    const assetName = b.img.src.split('/').at(-1).split('.')[0];
    let obstaclePixels;
    if (assetName === 'filibuster') {
        obstaclePixels = filibusterPixels;
    } else if (assetName === 'veto') {
        obstaclePixels = vetoPixels;
    } else if (assetName === 'novotes') {
        obstaclePixels = novotesPixels;
    } else {
        // Fallback in case anything happens with the pixel mask files
        return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
    }

    for (let y = 0; y < obstaclePixels.length; y++) {
        for (let x = 0; x < obstaclePixels[0].length; x++) {
            if (obstaclePixels[y][x] === 1) {
                for (let i = 0; i < takenPixels.length; i++) {
                    if (Math.abs(takenPixels[i][0] - (b.x + x)) < 3 && Math.abs(takenPixels[i][1] - (b.y + y)) < 3) {
                        return true;
                    }
                }
            }
        }
    }

    return false;
}
