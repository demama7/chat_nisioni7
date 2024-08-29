// מערך הכישופים במשחק
const spells = [
    'רעידת אדמה', 'שפריצר', 'מערבולת', 'טורנדו', 'כדור אש',
    'מפולת סלעים', 'מערבולת אוויר', 'סופת ברקים', 'צונמי', 'כדור אוויר',
    'עשן', 'הקפא', 'טורנדו אש', 'אש העולם התחתון', 'אש הגיהנום',
    'ברק', 'היתנגשות סלעים', 'עגרוף בזלת', 'מכת אש', 'גל'
];

// ערכי הנזק של כל כישוף
const damageValues = {
    'רעידת אדמה': 160, 'שפריצר': 100, 'מערבולת': 120, 'טורנדו': 145,
    'כדור אש': 145, 'מפולת סלעים': 140, 'מערבולת אוויר': 110, 'סופת ברקים': 160,
    'צונמי': 140, 'כדור אוויר': 100, 'עשן': 50, 'הקפא': 50, 'טורנדו אש': 150,
    'אש העולם התחתון': 140, 'אש הגיהנום': 160, 'ברק': 135, 'היתנגשות סלעים': 125,
    'עגרוף בזלת': 135, 'מכת אש': 140, 'גל': 115
};

// מצב המשחק
let playerHealth = 1700;
let enemyHealth = 2000;
let playerTurn = true;
let extraTurn = false;
let usedFrostSpell = false;
let usedSmokeSpell = false;
let playerAttackBoost = 0;
let playerExtraTurn = false;
let enemyAttackReduction = 0;

// מערך הפריטים הזמינים לשחקן
const items = [
    {
        name: 'שיקוי ריפוי',
        effect: (player) => {
            player.health += 150; 
            player.health = Math.min(player.health, 1700); // לוודא שהבריאות לא עולה מעל הגבול המרבי
        },
        rarity: 0.2375
    },
    
    {
        name: 'שיקוי שנה',
        effect: (player) => {
            player.extraTurn = true;
            enemyAttackReduction = 10; // הפחתת כוח ההתקפה של האויב
        },
        rarity: 0.2375
    },
    {
        name: 'אבן המוות',
        effect: (enemy) => {
            enemy.health -= 150;
            enemyAttackReduction = 10; // הפחתת כוח ההתקפה של האויב
        },
        rarity: 0.2375
    },
    {
        name: 'שיקוי משולב',
        effect: (player, enemy) => {
            player.health += 100;
            enemy.health -= 100;
        },
        rarity: 0.05
    }
];

// פונקציה ליצירת פריטים אקראיים עם משקלות
function getRandomItems(count) {
    const weightedItems = [];
    items.forEach(item => {
        const occurrences = Math.round(item.rarity * 100);
        for (let i = 0; i < occurrences; i++) {
            weightedItems.push(item);
        }
    });
    return weightedItems.sort(() => 0.5 - Math.random()).slice(0, count);
}

// פונקציה ליצירת כישופים אקראיים
function getRandomSpells(count) {
    return spells.sort(() => 0.5 - Math.random()).slice(0, count);
}

// הצגת כפתורי הכישופים
function displaySpells() {
    const spellButtonsContainer = document.getElementById('spell-buttons');
    spellButtonsContainer.innerHTML = '';
    const randomSpells = getRandomSpells(4);
    randomSpells.forEach(spell => {
        const button = document.createElement('button');
        button.className = 'spell-button';
        button.textContent = spell;
        button.disabled = (usedFrostSpell && spell === 'הקפא') || (usedSmokeSpell && spell === 'עשן');
        button.addEventListener('click', () => castSpell(spell));
        spellButtonsContainer.appendChild(button);
    });
}

// הצגת כפתורי הפריטים
function displayItems() {
    const itemButtonsContainer = document.getElementById('item-buttons');
    itemButtonsContainer.innerHTML = '';
    const randomItems = getRandomItems(1);
    randomItems.forEach(item => {
        const button = document.createElement('button');
        button.className = 'item-button';
        button.textContent = item.name;
        button.addEventListener('click', () => useItem(item));
        itemButtonsContainer.appendChild(button);
    });
}

// שימוש בכישוף
function castSpell(spell) {
    if (!playerTurn) return;
    if ((spell === 'הקפא' && usedFrostSpell) || (spell === 'עשן' && usedSmokeSpell)) {
        alert(`כישוף ${spell} כבר שוחק. בחר כישוף אחר.`);
        return;
    }
    let damage = damageValues[spell] || 50;
    if (spell === 'הקפא') {
        extraTurn = true;
        usedFrostSpell = true;
    }
    if (spell === 'עשן') {
        extraTurn = true;
        usedSmokeSpell = true;
    }
    if (playerAttackBoost) {
        damage += playerAttackBoost;
        playerAttackBoost = 0;
    }
    enemyHealth = Math.max(enemyHealth - damage, 0);
    logAction(`שחקן השתמש בכישוף '${spell}' והפחית ${damage} חיים לאויב.`);
    updateHealthBars();
    if (spell !== 'הקפא' && spell !== 'עשן') {
        extraTurn = false;
        playerTurn = false;
        setTimeout(enemyTurn, 1000);
    }
}
// שימוש בפריט
function useItem(item) {
    if (!playerTurn) return;

    // יצירת אובייקט השחקן לצורך השפעת השיקוי
    const player = {
        health: playerHealth,
        attackBoost: playerAttackBoost,
        extraTurn: playerExtraTurn
    };

    // ביצוע אפקט הפריט על השחקן והאויב
    if (item.name === 'שיקוי משולב') 
    {
        // השפעת השיקוי המשולב על השחקן והאויב
        player.health += 100;
        enemyHealth -= 100;
        player.health = Math.min(player.health, 1700); // לוודא שהבריאות לא עולה מעל הגבול המרבי
    } 
    else 
    {
        item.effect(player, { health: enemyHealth });
    }

    // עדכון בריאות השחקן
    playerHealth = player.health;

    // אם מדובר ב'אבן המוות', נעדכן את בריאות האויב בנפרד
    if (item.name === 'אבן המוות') 
    {
        enemyHealth = Math.max(enemyHealth - 150, 0);
    }

    logAction(`שחקן השתמש ב${item.name}.`);
    updateHealthBars();
    displayItems();

    if (item.name !== 'שיקוי שנה' && item.name !== 'שיקוי משולב')
 {
        extraTurn = false;
        playerTurn = false;
        setTimeout(enemyTurn, 1000);
    }
}


// תור האויב
function enemyTurn() {
    if (playerHealth <= 0 || enemyHealth <= 0) return;
    const enemySpells = Object.keys(damageValues);
    const randomSpell = enemySpells[Math.floor(Math.random() * enemySpells.length)];
    let damage = damageValues[randomSpell] || 50;
    damage -= enemyAttackReduction; // הפחתת כמות ההתקפה של האויב
    damage = Math.max(damage, 0); // לוודא שהנזק לא יורד מתחת ל-0
    playerHealth = Math.max(playerHealth - damage, 0);
    logAction(`האויב השתמש בכישוף '${randomSpell}' והפחית ${damage} חיים לשחקן.`);
    updateHealthBars();
    playerTurn = true;
    extraTurn = false;
    usedFrostSpell = false;
    usedSmokeSpell = false;
    enemyAttackReduction = 0; // איפוס הפחתת ההתקפה לאחר התקפת האויב
    displaySpells();
    displayItems();
}

// עדכון סרגלי הבריאות
function updateHealthBars() {
    const playerHealthValue = document.getElementById('player-health');
    const enemyHealthValue = document.getElementById('enemy-health');
    const playerHealthText = document.getElementById('player-health-value');
    const enemyHealthText = document.getElementById('enemy-health-value');
    playerHealthValue.style.width = (playerHealth / 1700 * 100) + '%';
    enemyHealthValue.style.width = (enemyHealth / 2000 * 100) + '%';
    playerHealthText.textContent = playerHealth;
    enemyHealthText.textContent = enemyHealth;
    if (playerHealth <= 0) {
        logAction("שחקן הובס. המשחק נגמר.");
    } else if (enemyHealth <= 0) {
        logAction("האויב הובס. ניצחת!");
    }
}

// רישום פעולות ביומן
function logAction(action) {
    const logList = document.getElementById('log-list');
    const logItem = document.createElement('li');
    logItem.textContent = action;
    logList.appendChild(logItem);
    logList.scrollTop = logList.scrollHeight; // לגלול אוטומטית לסוף הלוג
}

// אתחול המשחק
function initializeGame() {
    playerHealth = 1700;
    enemyHealth = 2000;
    playerTurn = true;
    extraTurn = false;
    usedFrostSpell = false;
    usedSmokeSpell = false;
    playerAttackBoost = 0;
    playerExtraTurn = false;
    enemyAttackReduction = 0;

    updateHealthBars();
    displaySpells();
    displayItems();
}

// אתחול המשחק ברגע טעינת הדף
window.onload = initializeGame;


