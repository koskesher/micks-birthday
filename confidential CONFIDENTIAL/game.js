const canvas = document.querySelector("#game-canvas");
const startMessage = document.querySelector("#start-message");
const nextButton =document.querySelector("#next-button");

const ctx = canvas.getContext("2d");

// game scale

const gameScale = 1.2;

function scaleGameSize(size) {
    return Math.round(size * gameScale);
}

// canvas setup

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = 300;

    ctx.imageSmoothingEnabled = false;
}

// game positions

const groundY = 240;

const playerStartX = 50;
let playerX = playerStartX;

const playerYOffset = scaleGameSize(65);

const playerHeight1 = scaleGameSize(192);
const playerHeight2 = scaleGameSize(70);

const playerFrame2YOffset = scaleGameSize(-65);

const reunionCharacterHeight = scaleGameSize(133);
const reunionCharacterRight = 20;
const reunionCharacterYOffset = 37;
const reunionSpeed = 4;

const togetherHeight = scaleGameSize(170);
const togetherYOffset = 10;

const bananaHeight = scaleGameSize(70);
const bananaYOffset = scaleGameSize(28);
const bananaSpeed = 7;

const poopHeight = scaleGameSize(60);
const poopY = 140;
const poopSpeed = 10;
const poopRotationSpeed = 0.08;
 
// hitbox

const playerHitboxWidth = scaleGameSize(50);
const playerHitboxHeight = scaleGameSize(75);

const playerHitboxOffsetX = scaleGameSize(37);
const playerHitboxOffsetY = scaleGameSize(52);

const bananaHitboxWidth = scaleGameSize(30);
const bananaHitboxHeight = scaleGameSize(25);

const bananaHitboxOffsetX = scaleGameSize(8);
const bananaHitboxOffsetY = scaleGameSize(18);

const poopHitboxWidth = scaleGameSize(30);
const poopHitboxHeight = scaleGameSize(30);

const poopHitboxOffsetX = scaleGameSize(0);
const poopHitboxOffsetY = scaleGameSize(0);

// game over messages

const gameOverMessages = [
    "aw :( you should try again",
    "oh wow, you died again?",
    "damn baby you suck",
    "..."
];

// game state

let playerLoaded = false;
let playerImage2Loaded = false;
let bananaLoaded = false;
let reunionCharacterLoaded = false;
let togetherImageLoaded = false;

let canvasOpened = false;
let gameStarted = false;
let gameOver = false;
let gameOverFinished = false;

let deathCount = 0;

let playerY = 0;
let playerVelocityY = 0;
let playerGroundY = 0;

let currentRunFrame = 1;
let runFrameCounter = 0;

let jumpsUsed = 0;
let playerRotation = 0;

let bananaX = 0;

let poopX = 0;
let poopRotation = 0;
let poopLoaded = false;

let activeObstacle = "banana";
let sameObstacleCount = 0;

let score = 0;
let reunionStarted = false;
let gameWon = false;

let obstaclesFinished = false;

let lastFrameTime = 0;

// game physics (thought i could escape from this shit)

const gravity = 0.6;
const jumpStrength = -10.5;
const maxJumps = 2;

const playerFallSpeed = 6;
const playerRotationSpeed = 0.08;

// score settings

const reunionStartScore = 200;
const winScore = 222;
const scoreSpeed = 0.15;

const obstacleClearBuffer = 2;

// player image 1

const playerImage = new Image();

playerImage.addEventListener("load", () => {
    playerLoaded = true;

    playerGroundY =
        groundY - playerHeight1 + playerYOffset;

    playerY = playerGroundY;

    drawSceneIfReady();
});

playerImage.src = "images/mick run 1.png";

// player image 2

const playerImage2 = new Image();

playerImage2.addEventListener("load", () => {
    playerImage2Loaded = true;

    drawSceneIfReady();
});

playerImage2.src = "images/mick run 2.png";

// banana image

const bananaImage = new Image();

bananaImage.addEventListener("load", () => {
    bananaLoaded = true;

    drawSceneIfReady();
});

bananaImage.src = "images/banana peel.png";

// poop image

const poopImage = new Image();

poopImage.addEventListener("load", () => {
    poopLoaded = true;

    drawSceneIfReady();
});

poopImage.src = "images/shit.png";

// gf image

const reunionCharacterImage = new Image();

reunionCharacterImage.addEventListener("load", () => {
    reunionCharacterLoaded = true;

    drawSceneIfReady();
});

reunionCharacterImage.src = "images/mel.png"

// us togetha image

const togetherImage = new Image ();

togetherImage.addEventListener("load", () => {
    togetherImageLoaded = true;

    drawSceneIfReady();
});

togetherImage.src = "images/aww us.png";

// helper fucktions

function getScaledWidth(image, height) {
    return (image.width / image.height) * height;
}

function scaleGameSize(size) {
    return size * gameScale;
}

// page load

window.addEventListener("load", () => {
   resizeCanvas();
   chooseNextObstacle();

   canvas.classList.add("open");
});

// browser gets resized

window.addEventListener("resize", () => {
    resizeCanvas();
    drawSceneIfReady();
});

// wait til canvas finish

canvas.addEventListener("transitionend", () => {
   canvasOpened = true;

   drawSceneIfReady();

   startMessage.classList.add("visible");
});

// listen for keyboard

window.addEventListener("keydown", (event) => {

    if (event.code === "Space" && canvasOpened) {
        event.preventDefault();

        if (event.repeat) {
            return;
        }

        if (gameOverFinished) {
            resetGame();
            jumpPlayer();
            return;
        }

        if (gameOver) {
            return;
        }

        if (!gameStarted) {
            gameStarted = true;

            startMessage.classList.remove("visible");

            requestAnimationFrame(gameLoop);
        }

        jumpPlayer();
    }
});

// last page listener

nextButton.addEventListener("click", () => {
    window.location.href = "letter.html";
});

//obstacle chooser helpers

function getNextObstacleType() {
    if (sameObstacleCount >= 2) {
        return activeObstacle === "banana"
        ? "poop"
        : "banana";
    }

    return Math.random() < 0.5
        ? "banana"
        : "poop";
}

function getSafeObstacleGap(obstacle) {
    const obstacleSpeed =
        obstacle === "banana"
            ? bananaSpeed
            : poopSpeed;

    const scoreRemaining =
        reunionStartScore -
        obstacleClearBuffer -
        score;

    const framesRemaining =
        scoreRemaining / scoreSpeed;

    const maxGap =
        framesRemaining * obstacleSpeed -
        canvas.width -
        100;

    if (maxGap < 0) {
        return null;
    }

    const randomGap =
        180 + Math.random() * 420;

    return Math.min(randomGap, maxGap) 
}

//obstacle chooser

function chooseNextObstacle() {
    const nextObstacle =
        getNextObstacleType();

    const safeGap =
        getSafeObstacleGap(nextObstacle);

    if (safeGap === null) {
        obstaclesFinished = true;
        return;
    }

    if (nextObstacle === activeObstacle) {
        sameObstacleCount += 1;
    }

    else {
        sameObstacleCount = 1;
    }

    activeObstacle = nextObstacle;

    if (activeObstacle === "banana") {
        bananaX = canvas.width + safeGap;
    }

    else {
        poopX = canvas.width +safeGap;
        poopRotation = 0;
    }
}

// poopy bananas

function updateObstacle(frameScale) {
    if (activeObstacle === "banana") {
        bananaX -= bananaSpeed * frameScale;

        if (bananaX < -100) {
            chooseNextObstacle();
        }
    }

    else {
        poopX -= poopSpeed * frameScale;
        poopRotation += poopRotationSpeed * frameScale;

        if (poopX < -100) {
            chooseNextObstacle();
        }
    }
}

// player jump

function jumpPlayer() {
    if (gameOver) {
        return;
    }

    if (jumpsUsed < maxJumps) {
        playerVelocityY = jumpStrength;
        jumpsUsed += 1;
    }
}

// player update

function updatePlayer(frameScale) {
    playerVelocityY += gravity * frameScale;
    playerY += playerVelocityY * frameScale;

    if (playerY >= playerGroundY) {
        playerY = playerGroundY;
        playerVelocityY = 0;
        jumpsUsed = 0;
    }
}

// run animation

function updateRunAnimation(frameScale) {
    if (playerY >= playerGroundY) {
        runFrameCounter += frameScale;

        if (runFrameCounter >= 10) {
            if (currentRunFrame === 1) {
                currentRunFrame = 2;
            }

            else {
                currentRunFrame = 1;
            }

            runFrameCounter = 0;
        }
    }

    else {
        currentRunFrame = 1;
        runFrameCounter = 0;
    }
}

// game over animation

function updateGameOver(frameScale) {
    if (gameWon || gameOverFinished) {
        return;
    }

    playerY += playerFallSpeed * frameScale;

    playerRotation +=
        playerRotationSpeed * frameScale;

    if (playerRotation > Math.PI / 2) {
        playerRotation = Math.PI / 2;
    }

    if (playerY > canvas.height) {
        gameOverFinished = true;

        const messageIndex = Math.min(
            deathCount - 1,
            gameOverMessages.length - 1
        );
    
    startMessage.textContent =
        gameOverMessages[messageIndex];

        startMessage.classList.add("visible");
    }
}

// score

function updateScore(frameScale) {
    if (reunionStarted || gameWon) {
        return;
    }

    score += scoreSpeed * frameScale;

    if (score >= reunionStartScore) {
        score = reunionStartScore;
        reunionStarted = true;
    }
}

// reunion

function updateReunion(frameScale) {
    if (!reunionStarted || gameWon) {
        return;
    }
    const character =
        getReunionCharacterPosition();

    const targetX =
        character.x -
        playerHitboxOffsetX -
        playerHitboxWidth +
        2;

    playerX += reunionSpeed * frameScale;

    if (playerX > targetX) {
        playerX = targetX;
    }

    const distanceToTravel =
        targetX - playerStartX;

    const distanceTravelled =
        playerX - playerStartX;

    const reunionProgress =
        distanceTravelled / distanceToTravel;

    score =
        reunionStartScore +
        (winScore - reunionStartScore) * reunionProgress;

    if (playerX >= targetX) {
        handleWin();
    }
}

// game loop

function gameLoop(timestamp) {
    if (lastFrameTime === 0) {
        lastFrameTime = timestamp;
    }

    const deltaTime = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    const frameScale = Math.min(
        deltaTime / (1000 / 60),
        3
    );

    if (gameWon) {
        // wtf?
    }

    else if (gameOver) {
        updateGameOver(frameScale);
    }

    else {
        updatePlayer(frameScale);
        updateRunAnimation(frameScale);
        updateScore(frameScale);

        if (reunionStarted) {
            updateReunion(frameScale);
        }

        else if (!obstaclesFinished) {
            updateObstacle(frameScale);
            checkCollisions();
        }
    }

    drawSceneIfReady();

    requestAnimationFrame(gameLoop);
}

// player hitbox

function getPlayerHitbox() {
    return {
        x: playerX + playerHitboxOffsetX,
        y: playerY + playerHitboxOffsetY,
        width: playerHitboxWidth,
        height: playerHitboxHeight
    };
}

// banana hitbox

function getBananaHitbox() {
    const bananaY =
    groundY - bananaHeight + bananaYOffset;

    return {
        x: bananaX + bananaHitboxOffsetX,
        y: bananaY + bananaHitboxOffsetY,
        width: bananaHitboxWidth,
        height: bananaHitboxHeight
    };
}

// poop hitbox

function getPoopHitbox() {
    const poopWidth =
        getScaledWidth(poopImage, poopHeight);

        return {
            x:
                poopX +
                (poopWidth - poopHitboxWidth) / 2 +
                poopHitboxOffsetX,

            y:
                poopY +
                (poopHeight - poopHitboxHeight) / 2 +
                poopHitboxOffsetY,

            width: poopHitboxWidth,
            height: poopHitboxHeight
        };
}

// active obstacle hitboxes

function getActiveObstacleHitbox() {
    if (activeObstacle === "banana") {
        return getBananaHitbox();
    }

    return getPoopHitbox();
}

//boom paw

function areColliding(box1, box2) {
    return (
        box1.x < box2.x + box2.width &&
        box1.x + box1.width > box2.x &&
        box1.y < box2.y + box2.height &&
        box1.y + box1.height > box2.y
    );
}

// reset game

function resetGame() {
    gameOver = false;
    gameOverFinished = false;

    score = 0;
    reunionStarted = false;
    gameWon = false;

    playerX = playerStartX;
    playerY = playerGroundY;
    playerVelocityY = 0;
    playerRotation = 0;

    jumpsUsed = 0;

    currentRunFrame = 1;
    runFrameCounter = 0;

    sameObstacleCount = 0;

    chooseNextObstacle();

    startMessage.classList.remove("visible");

    nextButton.disabled = true;
    nextButton.classList.remove("visible");
}

// micki reach me, yayy

function handleWin() {
    gameWon = true;

    gameOver = false;
    gameOverFinished = false;

    score = winScore;

    playerVelocityY = 0;
    currentRunFrame = 1;

    startMessage.textContent = "aw look, we're together again!!";
    startMessage.classList.add("visible");

    nextButton.disabled = false;
    nextButton.classList.add("visible");
}

// micki dead, sad

function handleGameOver() {
    gameOver = true;
    deathCount += 1;

    currentRunFrame = 1;
    playerVelocityY = 0;
}

// boom paw check

function checkCollisions() {
    if (gameOver) {
        return;
    }

    const playerHitbox = getPlayerHitbox();
    const obstacleHitbox = getActiveObstacleHitbox();

    if (areColliding(playerHitbox, obstacleHitbox)) {
        handleGameOver();
    }
}

// draw score

function drawScore() {
    const displayedScore =
        Math.floor(score)
            .toString()
            .padStart(3, "0");

    ctx.font = '15px "Press Start 2P"';
    ctx.textAlign = "right";
    ctx.fillStyle = "#181818";

    ctx.fillText(
        displayedScore,
        canvas.width - 25,
        35
    );
}

// draw ground

function drawGround() {
    ctx.fillStyle = "#181818";
    ctx.fillRect(0, groundY, canvas.width, 60);
}

// draw gf

function getReunionCharacterPosition (){
    const width =
        (reunionCharacterImage.width / reunionCharacterImage.height) *
        reunionCharacterHeight;
    
    const x =
            canvas.width - width - reunionCharacterRight;

    const y =
            groundY - reunionCharacterHeight + reunionCharacterYOffset;

    return {
            x: x,
            y: y,
            width: width,
            height: reunionCharacterHeight
    };
    
}

function drawReunionCharacter() {
    if (!reunionStarted || !reunionCharacterLoaded) {
        return;
    }

    const character =
        getReunionCharacterPosition();
        
    ctx.drawImage(
            reunionCharacterImage,
            character.x,
            character.y,
            character.width,
            character.height
    );
}

// draw US

function drawTogether() {
    if (!togetherImageLoaded) {
        return;
    }

    const togetherWidth =
        getScaledWidth(togetherImage, togetherHeight);
    
    const togetherX =
        (canvas.width - togetherWidth) / 2;

    const togetherY =
        (canvas.height - togetherHeight) / 2 +
        togetherYOffset;

    ctx.drawImage(
        togetherImage,
        togetherX,
        togetherY,
        togetherWidth,
        togetherHeight
    );
}

// draw my luv

function drawPlayer() {
    let currentPlayerImage = playerImage;
    let currentPlayerHeight = playerHeight1;

    if (currentRunFrame === 2) {
        currentPlayerImage = playerImage2;
        currentPlayerHeight = playerHeight2;
    }

     const currentPlayerWidth = Math.round(
        getScaledWidth(currentPlayerImage, currentPlayerHeight)
    );

    const basePlayerWidth = Math.round(
        getScaledWidth(playerImage, playerHeight1)
    );

    const currentPlayerX = Math.round(
        playerX + (basePlayerWidth - currentPlayerWidth) / 2
    );

    let currentPlayerY =
        playerY + (playerHeight1 - currentPlayerHeight);

    if (currentRunFrame === 2) {
            currentPlayerY += playerFrame2YOffset;
    }

    ctx.save();

    ctx.translate(
        currentPlayerX + currentPlayerWidth / 2,
        currentPlayerY + currentPlayerHeight / 2
    );

    ctx.rotate(playerRotation);

    ctx.drawImage(
        currentPlayerImage,
        -currentPlayerWidth / 2,
        -currentPlayerHeight / 2,
        currentPlayerWidth,
        currentPlayerHeight
    );

    ctx.restore();
}

// draw banana

function drawBanana() {
    if (!bananaLoaded) {
        return;
    }

    const bananaWidth =
        getScaledWidth(bananaImage, bananaHeight);

    const bananaY =
        groundY - bananaHeight + bananaYOffset;

    ctx.drawImage(
        bananaImage,
        bananaX,
        bananaY,
        bananaWidth,
        bananaHeight
    );
}

// draw poop

function drawPoop() {
    if(!poopLoaded) {
        return;
    }

    const poopWidth =
        getScaledWidth(poopImage, poopHeight);

    ctx.save();

    ctx.translate(
        poopX + poopWidth / 2,
        poopY + poopHeight / 2
    );

    ctx.rotate(poopRotation);

    ctx.drawImage(
        poopImage,
        -poopWidth / 2,
        -poopHeight / 2,
        poopWidth,
        poopHeight
    );

    ctx.restore();
}

// draw obstacles

function drawObstacle() {
    if (reunionStarted) {
        return;
    }

    if (activeObstacle === "banana") {
        drawBanana();
    }

    else {
        drawPoop();
    }
}

//draw start scene

function drawSceneIfReady() {
    if (playerLoaded && playerImage2Loaded && canvasOpened) {

        ctx.clearRect (0, 0, canvas.width, canvas.height);

        if (gameWon) {
            drawTogether();
            return;
        }

        drawGround();

        drawObstacle();

        drawReunionCharacter();

        drawPlayer();

        drawScore();
    }
}