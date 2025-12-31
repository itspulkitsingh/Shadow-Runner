const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 300;

let obstacle = {
    x: 800,
    y: 220,
    width: 40,
    height: 60,
    speed: 6,
};

function update() {
    obstacle.x -= obstacle.speed;

    if (obstacle.x + obstacle.width < 0) {
        obstacle.x = canvas.width;
    }
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 280, canvas.width, 20);
    ctx.fillStyle = "#39ff14";
    ctx.fillRect(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height,
    );
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();