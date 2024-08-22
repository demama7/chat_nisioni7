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

const monsterImage = new Image();
monsterImage.src = 'מפלצת.png'; // הנתיב לתמונה של המכשולים

const superMonsterImage = new Image();
superMonsterImage.src = 'סופרמפלצת.png'; // הנתיב לתמונה של סופרמפלצת

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

    // צייר את העכבר בתור עיגול כחול
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = 'blue';
    ctx.fill();

    // טיפול במכשולים רגילים
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        obstacle.y += speed;

        ctx.drawImage(monsterImage, obstacle.x, obstacle.y, obstacle.size, obstacle.size);

        if (
            mouse.x < obstacle.x + obstacle.size &&
            mouse.x + mouse.radius > obstacle.x &&
            mouse.y < obstacle.y + obstacle.size &&
            mouse.y + mouse.radius > obstacle.y
        ) {
            mouse.radius = mouse.originalRadius;
            setTimeout(() => {
                invincible = false;
            }, 500);
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

        ctx.drawImage(monsterImage, bottomObstacle.x, bottomObstacle.y, bottomObstacle.size, bottomObstacle.size);

        if (
            mouse.x < bottomObstacle.x + bottomObstacle.size &&
            mouse.x + mouse.radius > bottomObstacle.x &&
            mouse.y < bottomObstacle.y + bottomObstacle.size &&
            mouse.y + mouse.radius > bottomObstacle.y
        ) {
            mouse.radius = mouse.originalRadius;
            setTimeout(() => {
                invincible = false;
            }, 500);
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

    // טיפול במכשולים מיוחדים (סופרמפלצות)
    for (let i = 0; i < specialObstacles.length; i++) {
        const specialObstacle = specialObstacles[i];

        const dx = mouse.x - specialObstacle.x;
        const dy = mouse.y - specialObstacle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // חשב את הזווית בין המכשול לעכבר
        const angle = Math.atan2(dy, dx);

        // עדכן את מיקום המכשול לעבר העכבר
        const followSpeed = 3 + speed;
        specialObstacle.x += (dx / distance) * followSpeed;
        specialObstacle.y += (dy / distance) * followSpeed;

        // צייר את המכשול בתמונה עם כיוון ההתמקדות
        ctx.save();
        ctx.translate(specialObstacle.x + specialObstacle.size / 2, specialObstacle.y + specialObstacle.size / 2);
        ctx.rotate(angle);
        ctx.drawImage(superMonsterImage, -specialObstacle.size / 2, -specialObstacle.size / 2, specialObstacle.size, specialObstacle.size);
        ctx.restore();

        if (
            mouse.x < specialObstacle.x + specialObstacle.size &&
            mouse.x + mouse.radius > specialObstacle.x &&
            mouse.y < specialObstacle.y + specialObstacle.size &&
            mouse.y + mouse.radius > specialObstacle.y
        ) {
            mouse.radius = mouse.originalRadius;
            setTimeout(() => {
                invincible = false;
            }, 500);
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
            greenCircles.splice(i, 1);
            i--;
        }
    }

    // טיפול במגע בין העכבר למכשולים ירוקים
    if (mouse.radius > mouse.originalRadius) {
        invincible = true; // הפוך את העכבר לחסין
        setTimeout(() => {
            invincible = false; // הסר חסינות לאחר זמן מה
        }, 3000);
    }

    // צייר את העכבר מחדש עם העיגול הגדול
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = 'blue';
    ctx.fill();

    // קרא לפונקציה לשוב לחזור עם התמונה של העכבר
    requestAnimationFrame(gameLoop);
}

// התעדכן למיקום העכבר
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
});

// התחל משחק מחדש כאשר לוחצים על כפתור "התחל מחדש"
restartButton.addEventListener('click', () => {
    startGame();
});

// התחל את המשחק
startGame();
