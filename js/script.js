// ========== ФРАЗЫ КОТА ==========
const CAT_PHRASES = [
    "КУКИИИ!", "ДАЙ КУКИ!", "ЕЩЁ КУКИ!", "МОИ КУКИ!",
    "КУКИ КУКИ КУКИ!", "ХОЧУ КУКИ!", "КУКИ ЭТО ЖИЗНЬ!",
    "СЛИВКИ ШОУ!", "ТЫКАЙ В КОТА!", "НЕ ЖАДНИЧАЙ!"
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

let permanentAchievements = {
    polish: false
};

let achievements = {
    ach1: false,
    ach2: false,
    ach3: false
};

let startTime = Date.now() / 1000;
let totalClicks = 0;
let clickStreak = 0;
let lastClickTime = 0;

// ========== ЗАГРУЗКА ==========
function loadGame() {
    const saved = localStorage.getItem('cookieCatGame');
    if (saved) {
        try {
            let data = JSON.parse(saved);
            if (data.game) game = data.game;
            if (data.achievements) achievements = data.achievements;
            if (data.permanentAchievements) permanentAchievements = data.permanentAchievements;
            if (data.totalClicks) totalClicks = data.totalClicks;
        } catch(e) {}
    }
    updateUI();
}

function saveGame() {
    localStorage.setItem('cookieCatGame', JSON.stringify({ 
        game, achievements, permanentAchievements, totalClicks
    }));
}

// ========== ОКНО ДОСТИЖЕНИЙ ==========
function showAchievementsWindow() {
    const oldOverlay = document.getElementById('achievements-overlay');
    if (oldOverlay) oldOverlay.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'achievements-overlay';
    overlay.className = 'modal-overlay';
    
    const windowDiv = document.createElement('div');
    windowDiv.className = 'modal';
    windowDiv.innerHTML = `
        <h2 style="color: #ffd700; text-align: center; margin-bottom: 20px;">🏆 ДОСТИЖЕНИЯ</h2>
        <div class="achievement-window" id="achievements-list"></div>
        <button id="close-achievements" style="margin-top: 20px; padding: 10px; width: 100%; background: #ffd700; color: black; border: none; border-radius: 10px; cursor: pointer;">ЗАКРЫТЬ</button>
    `;
    
    overlay.appendChild(windowDiv);
    document.body.appendChild(overlay);
    
    const list = document.getElementById('achievements-list');
    const allAchievements = [
        { title: '🥚 КУКИ КЛИКЕР', desc: 'прошел куки кликер', unlocked: achievements.ach1 },
        { title: '⚡ СПИДРАНЕР', desc: 'пройти куки кликер быстрее создателя', unlocked: achievements.ach2 },
        { title: '🛑 ОСТАНОВИСЬ', desc: 'набрать 2 миллиона куки', unlocked: achievements.ach3 },
        { title: '🎵 Tylko jedno w głowie mam', desc: 'Koksu pięć gram, odlecieć sam', unlocked: permanentAchievements.polish }
    ];
    
    allAchievements.forEach(ach => {
        const div = document.createElement('div');
        div.className = `achievement-item ${ach.unlocked ? '' : 'locked'}`;
        div.innerHTML = `
            <div class="title">${ach.unlocked ? '✅ ' : '🔒 '}${ach.title}</div>
            <div class="desc">${ach.desc}</div>
        `;
        list.appendChild(div);
    });
    
    document.getElementById('close-achievements').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

function showNotification(msg) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 10px;
        z-index: 10001;
        animation: fadeOut 3s forwards;
    `;
    notification.textContent = msg;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ========== ПАСХАЛКИ ==========
function checkClickStreak() {
    const now = Date.now();
    if (now - lastClickTime < 1000) {
        clickStreak++;
    } else {
        clickStreak = 1;
    }
    lastClickTime = now;
    
    if (clickStreak === 100) {
        showCatMessage("ТЫ РОБОТ?");
        showNotification("🤖 100 кликов подряд!");
    }
}

function checkCookieMilestones() {
    if (Math.floor(game.totalCookies) === 69) showCatMessage("nice");
    if (Math.floor(game.totalCookies) === 420) showCatMessage("blaze it");
    if (Math.floor(game.totalCookies) === 1337) showCatMessage("LEET");
    
    if (totalClicks === 1000) {
        game.cookies += 1000;
        showCatMessage("1000 КЛИКОВ! +1000 КУКИ");
        showNotification("🎉 1000 кликов! Бонус 1000 куки!");
        saveGame();
        updateUI();
    }
}

function showCatMessage(msg) {
    const bubble = document.getElementById('speechBubble');
    if (bubble) {
        bubble.textContent = msg;
        bubble.classList.add('show');
        setTimeout(() => bubble.classList.remove('show'), 4000);
    }
    document.getElementById('catPhrase').textContent = msg;
    setTimeout(() => {
        document.getElementById('catPhrase').textContent = "КЛИКНИ МЕНЯ!";
    }, 5000);
}

// ========== СЕКРЕТНАЯ КОМАНДА ==========
window.catSay = function(text) {
    if (text && text.length > 0) {
        showCatMessage(text);
        console.log(`🐱 Кот сказал: "${text}"`);
    } else {
        console.log('Использование: catSay("текст")');
    }
};

// ========== УГЛОВОЙ ЭЛЕМЕНТ ==========
function initCornerItem() {
    const corner = document.getElementById('cornerItem');
    const isApple = Math.random() < 0.01;
    
    if (isApple) {
        corner.innerHTML = '<div style="font-size: 32px;">🍎</div>';
        corner.dataset.type = 'apple';
    } else {
        corner.innerHTML = '<img src="assets/images/sunflower.png" style="width: 32px; height: 32px;">';
        corner.dataset.type = 'sunflower';
    }
    
    corner.onclick = () => {
        if (corner.dataset.type === 'apple') {
            window.open('https://rutube.ru/video/055e34d68e4e80a6145efdf512aeb86e/?r=wd', '_blank');
            if (!permanentAchievements.polish) {
                permanentAchievements.polish = true;
                saveGame();
                showNotification('🏆 НОВОЕ ДОСТИЖЕНИЕ: Tylko jedno w głowie mam!');
                showCatMessage('Tylko jedno w głowie mam...');
            }
        } else {
            window.open('https://github.com/sunflower12422', '_blank');
        }
    };
}

// ========== ФУНКЦИИ КЛИКЕРА ==========
function checkStage() {
    let newStage = game.stage;
    for (let i = 0; i < STAGES.length; i++) {
        if (game.totalCookies >= STAGES[i].required) newStage = i;
    }
    if (newStage > game.stage) {
        game.stage = newStage;
        game.clickPower = STAGES[newStage].clickPower + (game.upgrades.clickPower.level - 1);
        document.getElementById('cat').style.backgroundImage = `url('${STAGES[newStage].image}')`;
        document.body.className = '';
        document.body.classList.add(`stage-${newStage}`);
        alert(`✨ НОВЫЙ ЭТАП: ${STAGES[newStage].name}! ✨\n⚡ Удар: +${STAGES[newStage].clickPower} 🍪`);
        checkAchievements();
        saveGame();
    }
}

function checkAchievements() {
    let changed = false;
    if (!achievements.ach1 && game.stage >= 5) {
        achievements.ach1 = true;
        showNotification('🏆 ДОСТИЖЕНИЕ: КУКИ КЛИКЕР');
        changed = true;
    }
    if (!achievements.ach2 && game.stage >= 5) {
        let playTime = Math.floor(Date.now() / 1000 - startTime);
        if (playTime < 1903) {
            achievements.ach2 = true;
            showNotification('🏆 ДОСТИЖЕНИЕ: СПИДРАНЕР');
            changed = true;
        }
    }
    if (!achievements.ach3 && game.totalCookies >= 2000000) {
        achievements.ach3 = true;
        showNotification('🏆 ДОСТИЖЕНИЕ: ОСТАНОВИСЬ');
        game.clickPower += 200;
        changed = true;
    }
    if (changed) { updateUI(); saveGame(); }
}

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
    } else {
        alert("❌ НЕ ХВАТАЕТ КУКИ!");
    }
}

function donate() {
    if (game.cookies >= 10000) {
        game.cookies -= 10000;
        game.upgrades.clickPower.price = 50;
        game.upgrades.autoClicker.price = 50;
        showCatMessage("💰 СПАСИБО!");
        updateUI();
        saveGame();
    } else {
        alert("❌ НУЖНО 10 000 КУКИ");
    }
}

function resetGame() {
    if (confirm('🔄 НАЧАТЬ СНАЧАЛА? (ВЕЧНАЯ АЧИВКА ОСТАНЕТСЯ)')) {
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
        
        if (confirm('Сбросить обычные ачивки? (Tylko jedno останется)')) {
            achievements = { ach1: false, ach2: false, ach3: false };
        }
        
        totalClicks = 0;
        clickStreak = 0;
        
        document.getElementById('cat').style.backgroundImage = `url('${STAGES[0].image}')`;
        document.body.className = '';
        document.body.classList.add('stage-0');
        
        startTime = Date.now() / 1000;
        saveGame();
        updateUI();
        showNotification('Игра сброшена! Вечная ачивка сохранена.');
    }
}

// ========== КЛИК ПО КОТУ ==========
document.getElementById('cat').addEventListener('click', function() {
    game.cookies += game.clickPower;
    game.totalCookies += game.clickPower;
    totalClicks++;
    
    checkClickStreak();
    checkCookieMilestones();
    
    this.style.transform = 'scale(1.2)';
    setTimeout(() => { if (this) this.style.transform = 'scale(1)'; }, 100);
    
    const randomPhrase = CAT_PHRASES[Math.floor(Math.random() * CAT_PHRASES.length)];
    const bubble = document.getElementById('speechBubble');
    if (bubble) {
        bubble.textContent = randomPhrase;
        bubble.classList.add('show');
        setTimeout(() => bubble.classList.remove('show'), 4000);
    }
    
    document.getElementById('catPhrase').textContent = randomPhrase;
    setTimeout(() => {
        document.getElementById('catPhrase').textContent = "КЛИКНИ МЕНЯ!";
    }, 5000);
    
    checkStage();
    updateUI();
    saveGame();
    checkAchievements();
});

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

// ========== ЗАПУСК ==========
window.onload = function() {
    loadGame();
    document.body.classList.add(`stage-${game.stage}`);
    document.getElementById('cat').style.backgroundImage = `url('${STAGES[game.stage].image}')`;
    startTime = Date.now() / 1000;
    initCornerItem();
    document.getElementById('achievementsBtn').onclick = showAchievementsWindow;
};
// ========== СЕКРЕТНАЯ КОМАНДА: ПРИНУДИТЕЛЬНО ПОКАЗАТЬ ЯБЛОКО ==========
window.forceApple = function() {
    const corner = document.getElementById('cornerItem');
    if (corner) {
        corner.innerHTML = '<div style="font-size: 32px;">🍎</div>';
        corner.dataset.type = 'apple';
        
        corner.onclick = () => {
            window.open('https://rutube.ru/video/055e34d68e4e80a6145efdf512aeb86e/?r=wd', '_blank');
            if (typeof permanentAchievements !== 'undefined' && !permanentAchievements.polish) {
                permanentAchievements.polish = true;
                if (typeof saveGame === 'function') saveGame();
                if (typeof showNotification === 'function') {
                    showNotification('🏆 НОВОЕ ДОСТИЖЕНИЕ: Tylko jedno w głowie mam!');
                }
                if (typeof showCatMessage === 'function') {
                    showCatMessage('Tylko jedno w głowie mam...');
                }
            }
        };
        
        console.log('%c🍎 ЯБЛОКО ПРИЗВАНО!', 'color: #ff6600; font-size: 14px;');
    } else {
        console.log('%c❌ Элемент cornerItem не найден!', 'color: red;');
    }
};