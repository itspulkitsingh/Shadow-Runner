let highscore = Number(localStorage.getItem("highscore")) || 0;

let playerSprite = new Image();
playerSprite.src = "./assets/player/shadowman.png";
let enemy = {
    monster1: new Image(),
    monster2: new Image(),
    bat: new Image(),
};
enemy.monster1.src = "./assets/enemies/monster1.png";
enemy.monster2.src = "./assets/enemies/monster2.png";
enemy.bat.src = "./assets/enemies/bat.png";

let playerFrame = 0;
let playerFrameCount = 8;
let playerFrameWidth = 64;
let playerFrameHeight = 64;
let playerFrameTimer = 0;

const enemytype = [
    {
        type: "monster",
        sprite: enemy.monster1,
        width: 100,
        height: 100,
        yOffset: -20,
        requiresShrink: false,
    },
    {
        type: "necromacer",
        sprite: enemy.monster2,
        width: 100,
        height: 100,
        yOffset: -20,
        requiresShrink: false,
    },
    {
        type: "bat",
        sprite: enemy.bat,
        width: 120,
        height: 80,
        yOffset: -100,
        requiresShrink: true,
    }
];
let lastenemytype = null;

const maxenemies = 3;

let enemyspawncooldown = 0;

let bgimage = new Image();
bgimage.src = "./assets/background/bgasset.jpg";

let boostsprite = new Image();
boostsprite.src = "./assets/boost/boost.png";

let showhelp = false;

let gameStarted = false;

let gamepaused = false;

let pausecooldown = 0;

let gameOver = false;

const groundpadding = 20;

function getGroundY() {
    return gameheight - groundpadding;
}

let score = 0;
let speedTimer = 0;
let gameSpeed = 3;
const gameheight = 360;

let minObstacleGap = 400;
let maxObstacleGap = 700;
let nextObstacleDistance = randomGap();

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const neon = {
    red: "#ff0055",
    green: "#00ff99",
    blue: "#00ccff",
}

let obstacles = [];

let player = {
    x: 100,
    y: -20,
    width: 100,
    height: 100,
    velocityY: 0,
    gravity: 0.7,
    jumpPower: -16,
    onGround: true,
    isShrinking: false,
    normalheight: 100,
    shrinkheight: 60,
    invincible: false,
    invincibletimer: 0,
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
    if ( !gameStarted || gameOver ) return;
    if (pausecooldown > 0) {
        pausecooldown--;
        if (pausecooldown === 0) {
            gamepaused = false;
        }
    }

    if (gamepaused) return;

    if (enemyspawncooldown > 0) {
        enemyspawncooldown--;
    }

    if (gameStarted && !gameOver) {
        score += 0.3;
    }
    speedTimer++;

    if (speedTimer > 600) {
        gameSpeed += 0.3;
        speedTimer = 0;
    }

    for (let i = 0; i < obstacles.length; i++) {
        let o = obstacles[i];

        o.x -= gameSpeed;

        o.frameTimer++;
        if (o.frameTimer > 10) {
            o.frame = (o.frame + 1) % o.frameCount;
            o.frameTimer = 0;
        }

        let playerbox = {
            x: player.x + 20,
            y: player.y + 10,
            width: player.width - 40,
            height: player.height - 20,
        };

        let enemybox = {
            x: o.x + 20,
            y: o.y + 20,
            width: o.width - 40,
            height: o.height - 30,
        };

        if (isColliding(playerbox, enemybox)) {
            if (o.requiresShrink && player.isShrinking) {

            } else if (!player.invincible) {
                gameOver = true;

                if (score > highscore) {
                    highscore = Math.floor(score);
                    localStorage.setItem("highscore", highscore);
                }
            }
        }
    }

    obstacles = obstacles.filter(o => o.x + o.width > 0);

    let lastObstacle = obstacles[obstacles.length - 1];

    if (obstacles.length < maxenemies && enemyspawncooldown === 0 && (!lastObstacle || lastObstacle.x < canvas.width - nextObstacleDistance)) {
        
        let enemyType;
        do {
            enemyType = enemytype[Math.floor(Math.random() * enemytype.length)];
        } while (enemyType.type === lastenemytype);

        lastenemytype = enemyType.type;

        obstacles.push({
            type: enemyType.type,
            sprite: enemyType.sprite,
            requiresShrink: enemyType.requiresShrink,
            x: canvas.width,
            width: enemyType.width,
            height: enemyType.height,
            y: getGroundY() - enemyType.height + enemyType.yOffset,
            frame: 0,
            frameCount: enemyType.type === "bat" ? 6 : 8,
            frameTimer: 0,
        });

        enemyspawncooldown = 40;

        nextObstacleDistance = randomGap();
    }

    player.velocityY += player.gravity;
    player.y += player.velocityY;



    if (player.y + player.height >= getGroundY()) {
        player.y = getGroundY() - player.height;
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

        let boostbox = {
            x: boost.x,
            y: boost.y,
            width: boost.size,
            height: boost.size,
        };

        if (isColliding({ x: player.x + 10, y: player.y + 10, width: player.width - 20, height: player.height - 20 }, boostbox)) {
            player.invincible = true;
            player.invincibletimer = 300 + Math.random() * 300;
            gameSpeed += 2;
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

    if (player.invincible) {
        player.invincibletimer--;
        if (player.invincibletimer <= 0) {
            player.invincible = false;
            gameSpeed = 3 + Math.floor(score / 300);
        }

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

    ctx.save();

    if (player.invincible) {
        ctx.globalAlpha = Math.random() > 0.5 ? 0.4 : 1;
        ctx.shadowBlur = 20;
        ctx.shadowColor = neon.blue;
    }

    ctx.drawImage(
        playerSprite,
        playerFrame * playerFrameWidth,
        0,
        playerFrameWidth,
        playerFrameHeight,
        player.x,
        worldY + player.y - 10,
        player.width,
        player.height
    );

    ctx.restore();

    ctx.globalAlpha = 1;

    for (let i = 0; i < obstacles.length; i++) {
        let o = obstacles[i];

        const frameWidth = o.sprite.width / o.frameCount;

        if (o.sprite && o.sprite.complete) {
            ctx.drawImage(
                o.sprite,
                o.frame * frameWidth,
                0,
                frameWidth,
                o.sprite.height,
                o.x,
                worldY + o.y,
                o.width,
                o.height,
            );
        }
    }

    ctx.fillStyle = "white";
    ctx.font = "16px monospace";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + Math.floor(score), 20, 30);

    if (boost.active) {
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = neon.blue;
        ctx.drawImage(
            boostsprite,
            boost.x,
            worldY + boost.y,
            40,
            40,
        );
        ctx.restore();
    }

    if (showhelp) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "18px monospace";
        ctx.textAlign = "center";
        ctx.fillText("CONTROLS", canvas.width / 2, canvas.height / 2 - 60);
        ctx.fillText("SPACE (key) / ↑ (up arrow) → Jump", canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText("↓ (down arrow) → Shrink", canvas.width / 2, canvas.height / 2 + 10);
        ctx.fillText("R (key) → Restart", canvas.width / 2, canvas.height / 2 + 40);
    }

    if (!gameStarted || gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "28px monospace";
        ctx.textAlign = "center";

        ctx.fillText(
            gameOver ? "GAME OVER" : "SHADOW RUNNER",
            canvas.width / 2,
            canvas.height / 2 - 40,
        );
        ctx.fillText(
            gameOver ? "SCORE: " + Math.floor(score) : "",
            canvas.width / 2,
            canvas.height / 2 + 40
        );
        ctx.fillText(
            gameOver ? "HIGH SCORE: " + highscore : "",
            canvas.width / 2,
            canvas.height / 2 + 70,
        );

        ctx.font = "18px monospace";
        ctx.fillText(
            gameOver ? "Press R to Restart" : "Press Space to Start",
            canvas.width / 2,
            canvas.height / 2 + 10
        );
    }

    ctx.fillStyle = "#111";
    ctx.fillRect(canvas.width - 50, 20, 30, 30);

    ctx.fillStyle = "white";
    ctx.font = "20px monospace";
    ctx.textAlign = "center";
    ctx.fillText(showhelp ? "X" : "?", canvas.width - 35, 42);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();

document.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
        if (!gameStarted) {
            gameStarted = true;
            return;
        }

        if (player.onGround) {
            player.velocityY = player.jumpPower;
            player.onGround = false;
        }
    }
});

document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowDown" && !player.isShrinking) {
        player.isShrinking = true;
        player.y += (player.normalheight - player.shrinkheight);
        player.height = player.shrinkheight;
    }
});

document.addEventListener("keyup", (e) => {
    if (e.code === "ArrowDown") {
        player.isShrinking = false;
        player.y -= (player.normalheight - player.shrinkheight);
        player.height = player.normalheight;
    }
});

document.addEventListener("keydown", (e) => {
    if (e.code === "KeyR" && gameOver) {
        gameOver = false;
        obstacles = [];
        gameSpeed = 3;
        score = 0;
        speedTimer = 0;
        player.y = 220;
        player.velocityY = 0;
        player.onGround = true;
    }
});
canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (mx > canvas.width - 50 && mx < canvas.width - 20 && my > 20 && my < 50) {
        showhelp = !showhelp;
        if (showhelp) {
            gamepaused = true;
        } else {
            pausecooldown = 60;
        }
    }
});

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.y = getGroundY() - player.height;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();