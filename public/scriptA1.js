const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const timerElement = document.getElementById('timer');
const messageElement = document.getElementById('message');
const elapsedTimeElement = document.getElementById('elapsedTime');
const restartButton = document.getElementById('restartButton');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let obstacles = [];
let specialObstacles = [];
let bottomObstacles = [];
let greenCircles = []; 
let redCircles = []; // עיגולים אדומים
let mouse = { x: canvas.width / 2, y: canvas.height / 2, radius: 20, originalRadius: 20 };
let timer = 0;
let interval;
let gameOver = false;
let speed = 2;
let spawnRate = 1000;
let difficultyIncreaseRate = 0.1;
let specialObstacleInterval;
let greenCircleInterval;
let redCircleInterval; // מרווח זמן לעיגולים האדומים
let invincible = false; 

const monsterImage = new Image();
monsterImage.src = 'מפלצת.png';

const superMonsterImage = new Image();
superMonsterImage.src = 'סופרמפלצת.png';

const collisionSound = new Audio('bup.mp3'); // יצירת אובייקט אודיו

function startGame() {
    timer = 0;
    obstacles = [];
    specialObstacles = [];
    bottomObstacles = [];
    greenCircles = [];
    redCircles = []; // איפוס עיגולים אדומים
    gameOver = false;
    invincible = false;
    speed = 2;
    spawnRate = 1000;
    messageElement.classList.add('hidden');
    mouse.x = canvas.width / 2;
    mouse.y = canvas.height / 2;
    mouse.radius = mouse.originalRadius;

    interval = setInterval(updateTimer, 1000);
    spawnObstacles();
    spawnBottomObstacles();
    spawnSpecialObstacle();
    spawnGreenCircle();
    spawnRedCircle(); // קריאת פונקציה לעיגול האדום
    gameLoop();
}

function updateTimer() {
    if (!gameOver) {
        timer++;
        const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
        const seconds = String(timer % 60).padStart(2, '0');
        timerElement.textContent = `${minutes}:${seconds}`;

        speed += difficultyIncreaseRate;
        spawnRate = Math.max(200, spawnRate - 15);
    }
}

function spawnObstacles() {
    if (gameOver) return;
    obstacles.push({ x: Math.random() * canvas.width, y: 0, size: 40 });
    setTimeout(spawnObstacles, spawnRate);
}

function spawnBottomObstacles() {
    if (gameOver) return;
    bottomObstacles.push({ x: Math.random() * canvas.width, y: canvas.height, size: 40 });
    setTimeout(spawnBottomObstacles, spawnRate);
}

function spawnSpecialObstacle() {
    if (gameOver) return;

    const durationOptions = [3000, 5000, 7000];
    const followDuration = durationOptions[Math.floor(Math.random() * durationOptions.length)];
    specialObstacles.push({ 
        x: Math.random() * canvas.width, 
        y: 0, 
        size: 50, 
        followDuration 
    });

    specialObstacleInterval = Math.random() * (10000 - 3000) + 3000;
    setTimeout(spawnSpecialObstacle, specialObstacleInterval);
}

function spawnGreenCircle() {
    if (gameOver) return;

    greenCircles.push({ 
        x: Math.random() * canvas.width, 
        y: Math.random() * canvas.height, 
        size: 30 
    });

    greenCircleInterval = Math.random() * (7000 - 3000) + 3000;
    setTimeout(spawnGreenCircle, greenCircleInterval);
}

// פונקציה לעיגולים האדומים
function spawnRedCircle() {
    if (gameOver) return;

    redCircles.push({ 
        x: Math.random() * canvas.width, 
        y: Math.random() * canvas.height, 
        size: 30 
    });

    redCircleInterval = Math.random() * (10000 - 5000) + 5000;
    setTimeout(spawnRedCircle, redCircleInterval);
}

function checkCollision(circle1, circle2) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < circle1.radius + circle2.size / 2;
}

function gameLoop() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = 'blue';
    ctx.fill();

    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        obstacle.y += speed;

        ctx.drawImage(monsterImage, obstacle.x, obstacle.y, obstacle.size, obstacle.size);

        if (checkCollision(mouse, obstacle)) {
            if (!invincible) {
                gameOver = true;
                clearInterval(interval);
                elapsedTimeElement.textContent = timerElement.textContent;
                messageElement.classList.remove('hidden');
                return;
            }
        }

        if (obstacle.y > canvas.height) {
            obstacles.splice(i, 1);
            i--;
        }
    }

    for (let i = 0; i < bottomObstacles.length; i++) {
        const bottomObstacle = bottomObstacles[i];
        bottomObstacle.y -= speed;

        ctx.drawImage(monsterImage, bottomObstacle.x, bottomObstacle.y, bottomObstacle.size, bottomObstacle.size);

        if (checkCollision(mouse, bottomObstacle)) {
            if (!invincible) {
                gameOver = true;
                clearInterval(interval);
                elapsedTimeElement.textContent = timerElement.textContent;
                messageElement.classList.remove('hidden');
                return;
            }
        }

        if (bottomObstacle.y < 0) {
            bottomObstacles.splice(i, 1);
            i--;
        }
    }

    for (let i = 0; i < specialObstacles.length; i++) {
        const specialObstacle = specialObstacles[i];

        const dx = mouse.x - specialObstacle.x;
        const dy = mouse.y - specialObstacle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const angle = Math.atan2(dy, dx);

        const followSpeed = 3 + speed;
        specialObstacle.x += (dx / distance) * followSpeed;
        specialObstacle.y += (dy / distance) * followSpeed;

        ctx.save();
        ctx.translate(specialObstacle.x + specialObstacle.size / 2, specialObstacle.y + specialObstacle.size / 2);
        ctx.rotate(angle);
        ctx.drawImage(superMonsterImage, -specialObstacle.size / 2, -specialObstacle.size / 2, specialObstacle.size, specialObstacle.size);
        ctx.restore();

        if (checkCollision(mouse, specialObstacle)) {
            if (!invincible) {
                gameOver = true;
                clearInterval(interval);
                elapsedTimeElement.textContent = timerElement.textContent;
                messageElement.classList.remove('hidden');
                return;
            }
        }

        specialObstacle.followDuration -= 16.67;
        if (specialObstacle.followDuration <= 0) {
            specialObstacles.splice(i, 1);
            i--;
        }
    }

    for (let i = 0; i < greenCircles.length; i++) {
        const greenCircle = greenCircles[i];

        ctx.beginPath();
        ctx.arc(greenCircle.x, greenCircle.y, greenCircle.size, 0, Math.PI * 2, false);
        ctx.fillStyle = '#00a305';
        ctx.fill();

        if (checkCollision(mouse, greenCircle)) {
            collisionSound.play(); // ניגון סאונד בעת התנגשות
            mouse.radius = mouse.originalRadius * 1.5;
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2, false);
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 5;
            ctx.stroke();
            greenCircles.splice(i, 1);
            i--;
            invincible = true;
            setTimeout(() => {
                invincible = false;
                mouse.radius = mouse.originalRadius;
            }, 4000);
        }
    }

    // בדיקה אם העכבר נוגע בעיגול האדום
    for (let i = 0; i < redCircles.length; i++) {
        const redCircle = redCircles[i];

        ctx.beginPath();
        ctx.arc(redCircle.x, redCircle.y, redCircle.size, 0, Math.PI * 2, false);
        ctx.fillStyle = 'red';
        ctx.fill();

        if (checkCollision(mouse, redCircle)) {
            collisionSound.play(); // ניגון סאונד בעת התנגשות
            specialObstacles = []; // השמדת כל המכשולים המיוחדים
            redCircles.splice(i, 1); // הסרת העיגול האדום מהמערך
            i--;
        }
    }

    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
});

restartButton.addEventListener('click', () => {
    startGame();
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

startGame();

