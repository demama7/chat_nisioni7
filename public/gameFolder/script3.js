const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');

let isDrawing = false;
let currentTool = 'pencil';
let currentColor = '#000000';
let brushSize = 2;

// משתנים לשמירה על היסטוריית הציורים
let history = [];
let historyIndex = -1;

// הגדרת הכלים
document.getElementById('pencil').addEventListener('click', () => setTool('pencil'));
document.getElementById('eraser').addEventListener('click', () => setTool('eraser'));
document.getElementById('bucket').addEventListener('click', () => setTool('bucket'));
document.getElementById('colorPicker').addEventListener('input', e => currentColor = e.target.value);
document.getElementById('brushSize').addEventListener('input', e => brushSize = e.target.value);

// הוספת כפתורים ל-Undo ו-Redo
document.getElementById('undo').addEventListener('click', undo);
document.getElementById('redo').addEventListener('click', redo);

// התחלת ציור
canvas.addEventListener('mousedown', e => {
    if (currentTool === 'bucket') {
        fillCanvas(e.offsetX, e.offsetY);
    } else {
        startDrawing(e);
    }
});
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);

// הפונקציות להוספת כלים, ציור, מלאות ו-Undo/Redo
function setTool(tool) {
    currentTool = tool;
}

function startDrawing(e) {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
    saveState(); // שמירת מצב לפני ציור חדש
}

function stopDrawing() {
    isDrawing = false;
    ctx.closePath();
    saveState(); // שמירת מצב לאחר סיום ציור
}

function draw(e) {
    if (!isDrawing) return;
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = currentTool === 'eraser' ? '#FFFFFF' : currentColor;

    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
}

function fillCanvas(x, y) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const targetColor = getColorAtPixel(imgData, x, y);
    const fillColor = hexToRgb(currentColor);

    if (!colorsMatch(targetColor, fillColor)) {
        floodFill(imgData, x, y, targetColor, fillColor);
        ctx.putImageData(imgData, 0, 0);
    }
}

function getColorAtPixel(imgData, x, y) {
    const index = (y * imgData.width + x) * 4;
    return [
        imgData.data[index],     // R
        imgData.data[index + 1], // G
        imgData.data[index + 2], // B
        imgData.data[index + 3]  // A
    ];
}

function colorsMatch(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255, 255];
}

function floodFill(imgData, x, y, targetColor, fillColor) {
    const stack = [[x, y]];
    const width = imgData.width;
    const height = imgData.height;

    while (stack.length) {
        const [currentX, currentY] = stack.pop();
        const index = (currentY * width + currentX) * 4;

        if (colorsMatch(getColorAtPixel(imgData, currentX, currentY), targetColor)) {
            imgData.data[index] = fillColor[0];
            imgData.data[index + 1] = fillColor[1];
            imgData.data[index + 2] = fillColor[2];
            imgData.data[index + 3] = fillColor[3];

            if (currentX > 0) stack.push([currentX - 1, currentY]); // שמאלה
            if (currentX < width - 1) stack.push([currentX + 1, currentY]); // ימינה
            if (currentY > 0) stack.push([currentX, currentY - 1]); // למעלה
            if (currentY < height - 1) stack.push([currentX, currentY + 1]); // למטה
        }
    }
}

function saveState() {
    // שמירת מצב הקנבס
    history = history.slice(0, historyIndex + 1); // חיתוך היסטוריית הצעדים הלא נדרשים
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    historyIndex++;
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        ctx.putImageData(history[historyIndex], 0, 0);
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        ctx.putImageData(history[historyIndex], 0, 0);
    }
}

// פונקציה להתאמת גודל הקנבס
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - document.getElementById('tools').offsetHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // אתחול גודל הקנבס בעת טעינת הדף

// הורדת התמונה
document.getElementById('downloadButton').addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'drawing.png';
    link.click();
});

// העלאת תמונה לקנבס
let img = null;
let imgX = 0, imgY = 0; // מיקום התמונה
let imgWidth = 100, imgHeight = 100; // גודל התמונה
let isResizing = false;
let rotationAngle = 0;
let startX, startY;

// העלאת תמונה לקנבס
document.getElementById('uploadImage').addEventListener('change', handleImageUpload);

function handleImageUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const imgElement = new Image();
        imgElement.src = e.target.result;
        
        imgElement.onload = function() {
            img = imgElement;
            imgX = canvas.width / 2 - imgWidth / 2;
            imgY = canvas.height / 2 - imgHeight / 2;
            drawImage();
        };
    };
    
    reader.readAsDataURL(file);
}

function drawImage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (img) {
        ctx.save();
        ctx.translate(imgX + imgWidth / 2, imgY + imgHeight / 2);
        ctx.rotate(rotationAngle);
        ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
        ctx.restore();
    }
}



// שינוי גודל התמונה
canvas.addEventListener('mousedown', (e) => {
    if (isMouseOnResizeHandle(e.offsetX, e.offsetY)) {
        isResizing = true;
        startX = e.offsetX;
        startY = e.offsetY;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isResizing) {
        const dx = e.offsetX - startX;
        const dy = e.offsetY - startY;
        imgWidth += dx;
        imgHeight += dy;
        startX = e.offsetX;
        startY = e.offsetY;
        drawImage();
    }
});

canvas.addEventListener('mouseup', () => {
    isResizing = false;
});

function isMouseOnResizeHandle(x, y) {
    return x > imgX + imgWidth - 10 && x < imgX + imgWidth && y > imgY + imgHeight - 10 && y < imgY + imgHeight;
}

// סיבוב התמונה עם גלגלת העכבר
canvas.addEventListener('wheel', (e) => {
    rotationAngle += e.deltaY * 0.001;
    drawImage();
});

// שינוי גודל התמונה באמצעות שדות הקלט
document.getElementById('resizeImage').addEventListener('click', () => {
    const widthInput = document.getElementById('imgWidth').value;
    const heightInput = document.getElementById('imgHeight').value;

    if (img) {
        imgWidth = parseInt(widthInput) || imgWidth;
        imgHeight = parseInt(heightInput) || imgHeight;
        imgX = canvas.width / 2 - imgWidth / 2;
        imgY = canvas.height / 2 - imgHeight / 2;
        drawImage();
    }
});

window.addEventListener('wheel', function(event) {
    event.preventDefault();
  }, { passive: false });
  




  // התחלת גרירה או שינוי גודל
canvas.addEventListener('mousedown', (e) => {
    if (isMouseOnResizeHandle(e.offsetX, e.offsetY)) {
        isResizing = true;
        resizeStartX = e.offsetX;
        resizeStartY = e.offsetY;
    } else if (e.button === 2 && img) { // אם לחיצה ימנית
        isDragging = true;
        dragStartX = e.offsetX - imgX;
        dragStartY = e.offsetY - imgY;
    }
});

// גרירה ושינוי גודל
canvas.addEventListener('mousemove', (e) => {
    if (isResizing) {
        const dx = e.offsetX - resizeStartX;
        const dy = e.offsetY - resizeStartY;
        imgWidth += dx;
        imgHeight += dy;
        resizeStartX = e.offsetX;
        resizeStartY = e.offsetY;
        drawImage();
    } else if (isDragging) {
        imgX = e.offsetX - dragStartX;
        imgY = e.offsetY - dragStartY;
        drawImage();
    }
});

// סיום גרירה או שינוי גודל
canvas.addEventListener('mouseup', () => {
    isResizing = false;
    isDragging = false;
});
// מניעת התפריט הקונטקסטואלי מהופיע בלחיצה ימנית על הקנבס
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
