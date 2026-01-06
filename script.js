let playerSprite = new Image();
playerSprite.src = "./assets/player/shadowman.png";

let playerFrame = 0;
let playerFrameCount = 8;
let playerFrameWidth = 64;
let playerFrameHeight = 64;
let playerFrameTimer = 0;

let bgimage = new Image();
bgimage.src = "./assets/background/bgasset.jpg";

let gameOver = false;

let score = 0;
let speedTimer = 0;
let gameSpeed = 6;
const gameheight = 360;

let minObstacleGap = 250;
let maxObstacleGap = 450;
let nextObstacleDistance = randomGap();

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const neon = {
    red: "#ff0055",
    green: "#00ff99",
    blue: "#00ccff",
}

let obstacles = [
    {
        x: 800,
        y: 220,
        width: 40,
        height: 60,
    }
];

let player = {
    x: 100,
    y: gameheight - 120,
    width: 80,
    height: 100,
    velocityY: 0,
    gravity: 0.7,
    jumpPower: -16,
    onGround: true,
}

const boostSafeDistance = 180;

let boost = {
    x: 1000,
    y: 180 + Math.random() * 40,
    size: 20,
    color: neon.blue,
    active: false,
}

function getgameoffsetY() {
    return Math.floor((canvas.height - gameheight) / 2);
}

function drawbg(tile, dx, dy, scale = 4) {
    ctx.drawImage(
        tileset,
        tile.x, tile.y,
        tilesize, tilesize,
        dx, dy,
        tilesize * scale,
        tilesize * scale,
    );
}

function isBoostSafe(x) {
    for (let i = 0; i < obstacles.length; i++) {
        let o = obstacles[i];
        if (Math.abs(o.x - x) < boostSafeDistance) {
            return false;
        }
    }
    return true;
}

function drawGlowRect(x, y, w, h, color) {
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.shadowBlur = 0;
}

function isColliding(a, b) {
    return (a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y);
}

function randomGap() {
    return Math.floor(
        minObstacleGap + Math.random() * (maxObstacleGap - minObstacleGap)
    );
}

function update() {
    if (gameOver) return;

    score++;
    speedTimer++;

    if (speedTimer > 300) {
        gameSpeed += 0.4 + Math.random() * 2;
        speedTimer = 0;
    }

    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= gameSpeed;
        if (isColliding(player, obstacles[i])) {
            gameOver = true;
        }
    }

    obstacles = obstacles.filter(o => o.x + o.width > 0);

    let lastObstacle = obstacles[obstacles.length - 1];

    if (!lastObstacle || lastObstacle.x < canvas.width - nextObstacleDistance) {
        obstacles.push({
            x: canvas.width,
            y: 220,
            width: 40,
            height: 60,
        });

        nextObstacleDistance = randomGap();
    }

    player.velocityY += player.gravity;
    player.y += player.velocityY;

    if (player.y + player.height >= 280) {
        player.y = 280 - player.height;
        player.velocityY = 0;
        player.onGround = true;
    }

    if (!boost.active && Math.random() < 0.004) {
        let spawnX = canvas.width + 100;

        if (isBoostSafe(spawnX)) {
            boost.active = true;
            boost.x = spawnX;
            boost.y = 180 + Math.random() * 40;
        }
    }

    if (boost.active) {
        boost.x -= gameSpeed;

        if (isColliding(player, {
            x: boost.x,
            y: boost.y,
            width: boost.size,
            height: boost.size,
        })) {
            gameSpeed += 3;
            boost.active = false;
        }
    }

    if (boost.active && boost.x < -boost.size) {
        boost.active = false;
    }

    playerFrameTimer++;

    if (playerFrameTimer > 6) {
        playerFrame = (playerFrame + 1) % playerFrameCount;
        playerFrameTimer = 0;
    }
}

function draw() {
    const offsetY = getgameoffsetY();
    ctx.fillStyle = "#000000ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
        bgimage,
        0,
        offsetY,
        canvas.width,
        gameheight,
    );

    const worldY = getgameoffsetY();

    ctx.drawImage(
        playerSprite,
        playerFrame * playerFrameWidth,
        0,
        playerFrameWidth,
        playerFrameHeight,
        player.x,
        worldY + player.y,
        player.width,
        player.height
    );

    ctx.fillStyle = "red";
    for (let i = 0; i < obstacles.length; i++) {
        drawGlowRect(
            obstacles[i].x,
            worldY + obstacles[i].y,
            obstacles[i].width,
            obstacles[i].height,
            neon.red,
        )
    }

    ctx.fillStyle = "white";
    ctx.font = "16px monospace";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 20, 30);

    if (boost.active) {
        drawGlowRect(
            boost.x,
            boost.y,
            boost.size,
            boost.size,
            boost.color,
        );
    }

    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "24px monospace";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, 130);
        ctx.fillText("Press R to Restart", canvas.width / 2, 160);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();

document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && player.onGround) {
        player.velocityY = player.jumpPower;
        player.onGround = false;
    }
});

document.addEventListener("keydown", (e) => {
    if (e.code === "KeyR" && gameOver) {
        gameOver = false;
        obstacles = [
            {
                x: canvas.width,
                y: 220,
                width: 40,
                height: 60,
            }
        ];
        gameSpeed = 6;
        score = 0;
        speedTimer = 0;
        player.y = 220;
        player.velocityY = 0;
        player.onGround = true;
    }
});

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();