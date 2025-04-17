const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game Objects
let player = {
    x: 100,
    y: 300,
    width: 50,
    height: 80,
    vy: 0,
    jumping: false,
    img: new Image(),
    targetX: 100,
    targetY: 300
};
player.img.src = "girl.png";

let boy = {
    x: 800,
    y: 270,
    width: 60,
    height: 100,
    targetX: 600,
    targetY: 270,
    img: new Image()
};
boy.img.src = "boy.png";

let ground = 350;
let gravity = 0.8; // Reduced gravity for easier jumping
let flowers = [];
let obstacles = [];
let flowerParticles = [];
let score = 0;
let gameOver = false;
let showBoy = false;
let isEnding = false;

// Load assets
let background = new Image();
background.src = "background.png";

let flowerImg = new Image();
flowerImg.src = "flower.png";

let obstacleImgs = ["fire.png", "hole.png", "box.png"].map(src => {
    let img = new Image();
    img.src = src;
    return img;
});

// Audio
let jumpSound = new Audio("jump.mp3");
let hitSound = new Audio("hit.mp3");
let bgMusic = new Audio("bg.mp3");
let loveMusic = new Audio("love.mp3");

bgMusic.loop = true;
bgMusic.play();

// Event Listeners
document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowUp" && !player.jumping) {
        player.vy = -20; // Adjusted jump strength
        player.jumping = true;
        jumpSound.play();
    }
});

// Game Functions
function spawnFlower() {
    flowers.push({ x: 800, y: 310, width: 30, height: 30 });
}

function spawnObstacle() {
    let i = Math.floor(Math.random() * obstacleImgs.length);
    obstacles.push({
        x: 800,
        y: 320,
        width: 40,
        height: 40,
        img: obstacleImgs[i]
    });
}

function createFlowerParticles() {
    for(let i = 0; i < score; i++) {
        flowerParticles.push({
            x: Math.random() * canvas.width,
            y: -Math.random() * 100,
            vy: Math.random() * 2 + 1,
            rotate: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.2
        });
    }
}

function update() {
    if (gameOver) return;

    // Player physics
    player.y += player.vy;
    player.vy += gravity;

    if (player.y >= ground - player.height) {
        player.y = ground - player.height;
        player.vy = 0;
        player.jumping = false;
    }

    // Ending sequence
    if (isEnding) {
        // Move characters
        player.x += (player.targetX - player.x) * 0.05;
        boy.x += (boy.targetX - boy.x) * 0.05;

        // Update falling flowers
        flowerParticles.forEach(p => {
            p.y += p.vy;
            p.vy += 0.3;
            p.rotate += p.rotationSpeed;
            
            if(p.y > canvas.height) {
                p.y = -10;
                p.vy = Math.random() * 2 + 1;
            }
        });
        return;
    }

    // Normal game updates
    flowers.forEach(f => f.x -= 4);
    obstacles.forEach(o => o.x -= 5);

    flowers = flowers.filter(f => f.x + f.width > 0);
    obstacles = obstacles.filter(o => o.x + o.width > 0);

    flowers.forEach((f, i) => {
        if (collision(player, f)) {
            flowers.splice(i, 1);
            score++;
        }
    });

    obstacles.forEach((o) => {
        if (collision(player, o)) {
            hitSound.play();
            gameOver = true;
            bgMusic.pause();
        }
    });

    if (score >= 5 && !showBoy) {
        showBoy = true;
        isEnding = true;
        player.targetX = 300;
        boy.targetX = 400;
        loveMusic.play();
        bgMusic.pause();
        createFlowerParticles();
        
        // Stop spawning objects
        clearInterval(flowerInterval);
        clearInterval(obstacleInterval);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Draw game objects
    ctx.drawImage(player.img, player.x, player.y, player.width, player.height);
    
    flowers.forEach(f => {
        ctx.drawImage(flowerImg, f.x, f.y, f.width, f.height);
    });

    obstacles.forEach(o => {
        ctx.drawImage(o.img, o.x, o.y, o.width, o.height);
    });

    if (showBoy) {
        ctx.drawImage(boy.img, boy.x, boy.y, boy.width, boy.height);
        ctx.fillStyle = "#fff";
        ctx.font = "24px Arial";
        ctx.fillText("LOVE YOU MARIOMA", 280, 150);
        
        // Draw falling flowers
        flowerParticles.forEach(p => {
            ctx.save();
            ctx.translate(p.x + 15, p.y + 15);
            ctx.rotate(p.rotate);
            ctx.drawImage(flowerImg, -15, -15, 30, 30);
            ctx.restore();
        });
    }

    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function collision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// Start game
let flowerInterval = setInterval(spawnFlower, 3000);
let obstacleInterval = setInterval(spawnObstacle, 4000);
gameLoop();
