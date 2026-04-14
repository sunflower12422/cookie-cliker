// ========== ФРАЗЫ КОТА ==========
const CAT_PHRASES = [
    "КУКИИИ!",
    "ДАЙ КУКИ!",
    "ЕЩЁ КУКИ!",
    "МОИ КУКИ!",
    "КУКИ КУКИ КУКИ!",
    "ХОЧУ КУКИ!",
    "КУКИ ЭТО ЖИЗНЬ!",
    "СЛИВКИ ШОУ!",
    "ТЫКАЙ В КОТА!",
    "НЕ ЖАДНИЧАЙ!"
];

// ========== ЭТАПЫ КОТА ==========
const STAGES = [
    { name: "😺 1 КУКИ", image: "assets/images/cat-cookie-0.png", clickPower: 1, required: 0 },
    { name: "🔥 2 ЧЕ КУКИ", image: "assets/images/cat-cookie-1.png", clickPower: 2, required: 500 },
    { name: "❄️ 3 КУКО", image: "assets/images/cat-cookie-2.png", clickPower: 5, required: 1000 },
    { name: "👑 4 ЧЕЗАКУКИ", image: "assets/images/cat-cookie-3.png", clickPower: 10, required: 10000 },
    { name: "💎 5 КУКИ ГЕЙМЕР", image: "assets/images/cat-cookie-4.png", clickPower: 25, required: 100000 },
    { name: "🌟 6 ВОЕННЫЙ КУКИ", image: "assets/images/cat-cookie-5.png", clickPower: 100, required: 1000000 }
];

// ========== СОСТОЯНИЕ ИГРЫ ==========
let game = {
    cookies: 0,
    totalCookies: 0,
    clickPower: 1,
    stage: 0,
    upgrades: {
        clickPower: { level: 1, price: 50 },
        autoClicker: { level: 0, price: 100 }
    }
};

// ========== АЧИВКИ ==========
let achievements = {
    ach1: false, // КУКИ КЛИКЕР
    ach2: false, // СПИДРАНЕР
    ach3: false  // ОСТАНОВИСЬ
};

// Время старта
let startTime = Date.now() / 1000;

// ========== ЗАГРУЗКА ==========
function loadGame() {
    const saved = localStorage.getItem('cookieCatGame');
    if (saved) {
        try {
            let data = JSON.parse(saved);
            if (data.game) game = data.game;
            if (data.achievements) achievements = data.achievements;
        } catch (e) {}
    }
    
    // Обновляем классы ачивок
    if (achievements.ach1) document.getElementById('ach1')?.classList.add('unlocked');
    if (achievements.ach2) document.getElementById('ach2')?.classList.add('unlocked');
    if (achievements.ach3) document.getElementById('ach3')?.classList.add('unlocked');
    
    updateUI();
}

// ========== СОХРАНЕНИЕ ==========
function saveGame() {
    let data = { game: game, achievements: achievements };
    localStorage.setItem('cookieCatGame', JSON.stringify(data));
}

// ========== ПОКАЗ УВЕДОМЛЕНИЯ ==========
function showAchievementPopup(title, desc) {
    // Удаляем старое
    let old = document.getElementById('ach-popup');
    if (old) old.remove();

    // Создаём новое
    const popup = document.createElement('div');
    popup.id = 'ach-popup';
    popup.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1a1a1a;
        border-left: 6px solid #4CAF50;
        border-radius: 10px;
        padding: 15px 20px;
        box-shadow: 0 5px 20px black;
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 999999;
        border: 1px solid #4CAF50;
        transform: translateX(120%);
        transition: transform 0.5s;
    `;
    
    popup.innerHTML = `
        <div style="font-size: 40px;">🏆</div>
        <div>
            <div style="color: #4CAF50; font-size: 20px; font-weight: bold;">${title}</div>
            <div style="color: #aaa; font-size: 14px;">${desc}</div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Показываем
    setTimeout(() => popup.style.transform = 'translateX(0)', 50);
    
    // Убираем через 5 секунд
    setTimeout(() => {
        popup.style.transform = 'translateX(120%)';
        setTimeout(() => popup.remove(), 500);
    }, 5000);
    
    // Кот радуется
    const bubble = document.getElementById('speechBubble');
    if (bubble) {
        bubble.textContent = "🏆 АЧИВКА!";
        bubble.classList.add('show');
        setTimeout(() => bubble.classList.remove('show'), 5000);
    }
}

// ========== ПРОВЕРКА АЧИВОК ==========
function checkAchievements() {
    let changed = false;
    
    // Ачивка 1: КУКИ КЛИКЕР (этап 5)
    if (!achievements.ach1 && game.stage >= 5) {
        achievements.ach1 = true;
        document.getElementById('ach1')?.classList.add('unlocked');
        showAchievementPopup('🥚 КУКИ КЛИКЕР', 'прошел куки кликер');
        changed = true;
    }
    
    // Ачивка 2: СПИДРАНЕР (быстрее 1903 секунд)
    if (!achievements.ach2 && game.stage >= 5) {
        let playTime = Math.floor(Date.now() / 1000 - startTime);
        if (playTime < 1903) {
            achievements.ach2 = true;
            document.getElementById('ach2')?.classList.add('unlocked');
            showAchievementPopup('⚡ СПИДРАНЕР', 'пройти куки кликер быстрее создателя');
            changed = true;
        }
    }
    
    // Ачивка 3: 2 МИЛЛИОНА КУКИ
    if (!achievements.ach3 && game.totalCookies >= 2000000) {
        achievements.ach3 = true;
        document.getElementById('ach3')?.classList.add('unlocked');
        showAchievementPopup('🛑 ОСТАНОВИСЬ', 'набрать 2 миллиона куки');
        game.clickPower += 200;
        changed = true;
    }
    
    if (changed) {
        updateUI();
        saveGame();
    }
}

// ========== КЛИК ПО КОТУ ==========
document.getElementById('cat').addEventListener('click', function(e) {
    game.cookies += game.clickPower;
    game.totalCookies += game.clickPower;

    this.style.transform = 'scale(1.2)';
    setTimeout(() => this.style.transform = 'scale(1)', 100);

    const bubble = document.getElementById('speechBubble');
    bubble.textContent = CAT_PHRASES[Math.floor(Math.random() * CAT_PHRASES.length)];
    bubble.classList.add('show');
    setTimeout(() => bubble.classList.remove('show'), 4000);

    document.getElementById('catPhrase').textContent = 
        CAT_PHRASES[Math.floor(Math.random() * CAT_PHRASES.length)];
    setTimeout(() => {
        document.getElementById('catPhrase').textContent = "КЛИКНИ МЕНЯ!";
    }, 5000);

    checkStage();
    updateUI();
    saveGame();
    checkAchievements();
});

// ========== ПРОВЕРКА ЭТАПОВ ==========
function checkStage() {
    let newStage = game.stage;

    for (let i = 0; i < STAGES.length; i++) {
        if (game.totalCookies >= STAGES[i].required) {
            newStage = i;
        }
    }

    if (newStage > game.stage) {
        game.stage = newStage;
        game.clickPower = STAGES[newStage].clickPower + (game.upgrades.clickPower.level - 1);

        document.getElementById('cat').style.backgroundImage = `url('${STAGES[newStage].image}')`;
        document.body.className = '';
        document.body.classList.add(`stage-${newStage}`);

        alert(`✨ НОВЫЙ ЭТАП: ${STAGES[newStage].name}! ✨\n⚡ Удар: +${STAGES[newStage].clickPower} 🍪`);

        if (STAGES[newStage].name.includes("ГЕЙМЕР")) {
            setTimeout(() => alert("🕹️ TO BE CONTINUED..."), 500);
        }
        
        checkAchievements();
    }
}

// ========== ПОКУПКА УЛУЧШЕНИЙ ==========
function buyUpgrade(type) {
    const upgrade = game.upgrades[type];
    if (game.cookies >= upgrade.price) {
        game.cookies -= upgrade.price;
        upgrade.level++;
        if (type === 'clickPower') {
            game.clickPower = STAGES[game.stage].clickPower + (upgrade.level - 1);
        }
        upgrade.price += 100;
        updateUI();
        saveGame();
        checkAchievements();
    }
}

// ========== ДОНАТ ==========
function donate() {
    if (game.cookies >= 10000) {
        game.cookies -= 10000;
        game.upgrades.clickPower.price = 50;
        game.upgrades.autoClicker.price = 50;
        
        const bubble = document.getElementById('speechBubble');
        bubble.textContent = "💰 СПАСИБО!";
        bubble.classList.add('show');
        setTimeout(() => bubble.classList.remove('show'), 3000);
        
        document.getElementById('catPhrase').textContent = "ДОНАТЕР КОТА!";
        setTimeout(() => {
            document.getElementById('catPhrase').textContent = "КЛИКНИ МЕНЯ!";
        }, 3000);
        
        updateUI();
        saveGame();
    } else {
        alert("❌ НУЖНО 10 000 КУКИ");
    }
}

// ========== ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ==========
function updateUI() {
    document.getElementById('cookieAmount').textContent = Math.floor(game.cookies);
    document.getElementById('clickPower').textContent = game.clickPower;
    document.getElementById('stage').textContent = `${game.stage}/${STAGES.length - 1}`;

    if (game.stage < STAGES.length - 1) {
        const nextStage = STAGES[game.stage + 1];
        document.getElementById('nextStageName').textContent = nextStage.name;
        document.getElementById('nextStagePrice').textContent = nextStage.required;
        let progress = (game.totalCookies / nextStage.required) * 100;
        document.getElementById('progressFill').style.width = Math.min(progress, 100) + '%';
    } else {
        document.getElementById('nextStageName').textContent = 'МАКСИМУМ';
        document.getElementById('nextStagePrice').textContent = '∞';
        document.getElementById('progressFill').style.width = '100%';
    }

    document.getElementById('clickPowerPrice').textContent = game.upgrades.clickPower.price + ' 🍪';
    document.getElementById('clickPowerLevel').textContent = 'Ур. ' + game.upgrades.clickPower.level;
    document.getElementById('autoClickerPrice').textContent = game.upgrades.autoClicker.price + ' 🍪';
    document.getElementById('autoClickerLevel').textContent = 'Ур. ' + game.upgrades.autoClicker.level;
}

// ========== АВТОКЛИКЕР ==========
setInterval(function() {
    if (game.upgrades.autoClicker.level > 0) {
        game.cookies += game.upgrades.autoClicker.level;
        game.totalCookies += game.upgrades.autoClicker.level;
        checkStage();
        updateUI();
        saveGame();
        checkAchievements();
    }
}, 1000);

// ========== СБРОС ==========
function resetGame() {
    if (confirm('🔄 НАЧАТЬ СНАЧАЛА?')) {
        game = {
            cookies: 0,
            totalCookies: 0,
            clickPower: 1,
            stage: 0,
            upgrades: {
                clickPower: { level: 1, price: 50 },
                autoClicker: { level: 0, price: 100 }
            }
        };
        
        if (confirm('Сбросить ачивки?')) {
            achievements = { ach1: false, ach2: false, ach3: false };
            document.getElementById('ach1')?.classList.remove('unlocked');
            document.getElementById('ach2')?.classList.remove('unlocked');
            document.getElementById('ach3')?.classList.remove('unlocked');
        }

        document.getElementById('cat').style.backgroundImage = `url('${STAGES[0].image}')`;
        document.body.className = '';
        document.body.classList.add('stage-0');
        
        startTime = Date.now() / 1000;
        saveGame();
        updateUI();
    }
}

// ========== ЗАПУСК ==========
window.onload = function() {
    loadGame();
    document.body.classList.add(`stage-${game.stage}`);
    document.getElementById('cat').style.backgroundImage = `url('${STAGES[game.stage].image}')`;
    startTime = Date.now() / 1000;
};