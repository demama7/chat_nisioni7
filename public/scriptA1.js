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
let greenCircles = []; // עיגולים ירוקים
let mouse = { x: canvas.width / 2, y: canvas.height / 2, radius: 20, originalRadius: 20 };
let timer = 0;
let interval;
let gameOver = false;
let speed = 2;
let spawnRate = 1000;
let difficultyIncreaseRate = 0.1;
let specialObstacleInterval;
let greenCircleInterval;
let invincible = false; // משתנה שמסמן אם העכבר אינו פגיע

function startGame() {
    timer = 0;
    obstacles = [];
    specialObstacles = [];
    bottomObstacles = [];
    greenCircles = [];
    gameOver = false;
    invincible = false; // התחל את המשחק ללא חסינות
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
    gameLoop();
}

function updateTimer() {
    if (!gameOver) {
        timer++;
        const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
        const seconds = String(timer % 60).padStart(2, '0');
        timerElement.textContent = `${minutes}:${seconds}`;

        // העלאת רמת הקושי
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
    const x = Math.random() * canvas.width;
    const y = 0;
    specialObstacles.push({ x, y, size: 50, followDuration });

    specialObstacleInterval = Math.random() * (10000 - 3000) + 3000;
    setTimeout(spawnSpecialObstacle, specialObstacleInterval);
}

function spawnGreenCircle() {
    if (gameOver) return;

    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    greenCircles.push({ x, y, size: 30 });

    greenCircleInterval = Math.random() * (7000 - 3000) + 3000;
    setTimeout(spawnGreenCircle, greenCircleInterval);
}

function gameLoop() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // צייר את העיגול הכחול
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = 'blue';
    ctx.fill();

    // טיפול במכשולים רגילים
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        obstacle.y += speed;

        ctx.fillStyle = 'red';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.size, obstacle.size);

        if (
            mouse.x < obstacle.x + obstacle.size &&
            mouse.x + mouse.radius > obstacle.x &&
            mouse.y < obstacle.y + obstacle.size &&
            mouse.y + mouse.radius > obstacle.y
        ) {
            mouse.radius = mouse.originalRadius;
            setTimeout(() => {
                ;
                invincible = false;
            },500);
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

    // טיפול במכשולים מלמטה למעלה
    for (let i = 0; i < bottomObstacles.length; i++) {
        const bottomObstacle = bottomObstacles[i];
        bottomObstacle.y -= speed;

        ctx.fillStyle = 'red';
        ctx.fillRect(bottomObstacle.x, bottomObstacle.y, bottomObstacle.size, bottomObstacle.size);

        if (
            mouse.x < bottomObstacle.x + bottomObstacle.size &&
            mouse.x + mouse.radius > bottomObstacle.x &&
            mouse.y < bottomObstacle.y + bottomObstacle.size &&
            mouse.y + mouse.radius > bottomObstacle.y
        ) {
            mouse.radius = mouse.originalRadius;
            setTimeout(() => {
                ;
                invincible = false;
            },500);
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

    // טיפול במכשולים מיוחדים
    for (let i = 0; i < specialObstacles.length; i++) {
        const specialObstacle = specialObstacles[i];

        const dx = mouse.x - specialObstacle.x;
        const dy = mouse.y - specialObstacle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const followSpeed = 3 + speed;

        specialObstacle.x += (dx / distance) * followSpeed;
        specialObstacle.y += (dy / distance) * followSpeed;

        ctx.fillStyle = (timer % 2 === 0) ? 'red' : 'yellow';
        ctx.fillRect(specialObstacle.x, specialObstacle.y, specialObstacle.size, specialObstacle.size);

        if (
            mouse.x < specialObstacle.x + specialObstacle.size &&
            mouse.x + mouse.radius > specialObstacle.x &&
            mouse.y < specialObstacle.y + specialObstacle.size &&
            mouse.y + mouse.radius > specialObstacle.y
        ) {
            mouse.radius = mouse.originalRadius;
            setTimeout(() => {
                ;
                invincible = false;
            },500);
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

    // טיפול בעיגולים ירוקים
    for (let i = 0; i < greenCircles.length; i++) {
        const greenCircle = greenCircles[i];

        ctx.beginPath();
        ctx.arc(greenCircle.x, greenCircle.y, greenCircle.size, 0, Math.PI * 2, false);
        ctx.fillStyle = 'green';
        ctx.fill();

        if (
            mouse.x < greenCircle.x + greenCircle.size &&
            mouse.x + mouse.radius > greenCircle.x &&
            mouse.y < greenCircle.y + greenCircle.size &&
            mouse.y + mouse.radius > greenCircle.y
        ) {
            mouse.radius = mouse.originalRadius * 1.5;
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2, false);
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 5;
            ctx.stroke();

            invincible = true; // עכבר אינו פגיע
            greenCircles.splice(i, 1);
            i--;

            // אחזור את גודל העיגול הכחול אחרי זמן קצר
            setTimeout(() => {
                mouse.radius = mouse.originalRadius;
                invincible = false;
            },20000);
        }
    }

    requestAnimationFrame(gameLoop);
}

// עדכון מיקום העכבר
canvas.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

// כפתור restart
restartButton.addEventListener('click', startGame);

// התחלת המשחק
startGame();

