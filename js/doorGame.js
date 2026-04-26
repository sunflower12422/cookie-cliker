// ========== МИНИ-ИГРА "ДВЕРИ" ==========
// Команда: labCookie()

const DOOR_CONFIG = [
    { corridor: 1, doors: 2, hpCost: 1 },
    { corridor: 2, doors: 3, hpCost: 1 },
    { corridor: 3, doors: 4, hpCost: 1 },
    { corridor: 4, doors: 5, hpCost: 1 },
    { corridor: 5, doors: 6, hpCost: 1 }
];

let doorGameState = {
    active: false,
    currentCorridor: 0,
    hp: 5,
    banUntil: 0,
    won: false
};

let currentMonsters = [];     // { doorNumber, monsterNumber }
let correctDoorNumber = 0;
let doorGameMusic = null;

function loadDoorGameState() {
    const saved = localStorage.getItem('doorGameState');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            doorGameState = { ...doorGameState, ...data };
        } catch(e) {}
    }
}

function saveDoorGameState() {
    localStorage.setItem('doorGameState', JSON.stringify({
        banUntil: doorGameState.banUntil,
        won: doorGameState.won
    }));
}

function stopMusic() {
    if (doorGameMusic) {
        doorGameMusic.pause();
        doorGameMusic.currentTime = 0;
        doorGameMusic = null;
    }
}

function closeDoorGame() {
    stopMusic();
    const overlay = document.getElementById('doorGame-overlay');
    if (overlay) overlay.remove();
    doorGameState.active = false;
}

async function typeText(element, text, speed = 30) {
    for (let i = 0; i < text.length; i++) {
        element.innerHTML += text[i];
        await new Promise(resolve => setTimeout(resolve, speed));
    }
}

async function openDoorAnimation(doorNumber, outputDiv) {
    outputDiv.innerHTML = '';
    await typeText(outputDiv, `>> Дверь ${doorNumber} открывается...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
}

async function handleDoorChoice(choice, outputDiv, buttonsDiv) {
    await openDoorAnimation(choice, outputDiv);
    
    if (choice === correctDoorNumber) {
        outputDiv.innerHTML += `\n>> Тишина... Проходи дальше. ✅`;
        return true;
    } else {
        const monster = currentMonsters.find(m => m.doorNumber === choice);
        const monsterNum = monster ? monster.monsterNumber : 0;
        outputDiv.innerHTML += `\n>> РРРР! МОНСТР №${monsterNum} наносит удар! 💀`;
        doorGameState.hp -= DOOR_CONFIG[doorGameState.currentCorridor].hpCost;
        outputDiv.innerHTML += `\n>> ❤️ Осталось HP: ${doorGameState.hp}`;
        
        if (doorGameState.hp <= 0) {
            outputDiv.innerHTML += `\n\n💀 ТЫ ПРОИГРАЛ! ВХОД В ЛАБИРИНТ ЗАБЛОКИРОВАН НА 24 ЧАСА 💀`;
            doorGameState.banUntil = Date.now() + 24 * 60 * 60 * 1000;
            saveDoorGameState();
            setTimeout(() => closeDoorGame(), 3000);
        }
        return false;
    }
}

function generateMonsters(doorsCount) {
    const monsters = [];
    const availableMonsterNumbers = [];
    for (let i = 1; i <= 20; i++) availableMonsterNumbers.push(i);
    
    for (let i = 1; i <= doorsCount; i++) {
        if (i === correctDoorNumber) continue;
        const randomIndex = Math.floor(Math.random() * availableMonsterNumbers.length);
        const monsterNum = availableMonsterNumbers[randomIndex];
        availableMonsterNumbers.splice(randomIndex, 1);
        monsters.push({ doorNumber: i, monsterNumber: monsterNum });
    }
    return monsters;
}

async function startCorridor(container, outputDiv, buttonsDiv) {
    if (doorGameState.currentCorridor >= DOOR_CONFIG.length) {
        outputDiv.innerHTML = '';
        await typeText(outputDiv, '🏆 ТЫ ПРОШЁЛ ВСЕ КОРИДОРЫ! 🏆\n>> +10.000.000 КУКИ!');
        
        if (typeof game !== 'undefined') {
            game.cookies += 10000000;
            game.totalCookies += 10000000;
            if (typeof saveGame === 'function') saveGame();
            if (typeof updateUI === 'function') updateUI();
        }
        
        doorGameState.won = true;
        saveDoorGameState();
        setTimeout(() => closeDoorGame(), 4000);
        return;
    }
    
    const config = DOOR_CONFIG[doorGameState.currentCorridor];
    correctDoorNumber = Math.floor(Math.random() * config.doors) + 1;
    currentMonsters = generateMonsters(config.doors);
    
    outputDiv.innerHTML = '';
    await typeText(outputDiv, `=== КОРИДОР ${config.corridor} ===\n❤️ HP: ${doorGameState.hp}\n\nВыбери дверь:`);
    
    buttonsDiv.innerHTML = '';
    for (let i = 1; i <= config.doors; i++) {
        const btn = document.createElement('button');
        btn.textContent = `🚪 ${i}`;
        btn.className = 'door-btn';
        
        btn.onclick = async () => {
            const allBtns = document.querySelectorAll('#doorGame-buttons button');
            allBtns.forEach(b => b.disabled = true);
            
            const success = await handleDoorChoice(i, outputDiv, buttonsDiv);
            
            if (doorGameState.hp <= 0) return;
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            if (success) {
                doorGameState.currentCorridor++;
                startCorridor(container, outputDiv, buttonsDiv);
            } else {
                startCorridor(container, outputDiv, buttonsDiv);
            }
        };
        buttonsDiv.appendChild(btn);
    }
}

// ========== ЗАГРУЗКА АУДИО И ЗАПУСК ==========
window.labCookie = function() {
    loadDoorGameState();
    
    if (doorGameState.won) {
        console.log('❌ ТЫ УЖЕ ПРОШЁЛ ЛАБИРИНТ! ЖДИ v3.0');
        alert('Ты уже прошёл лабиринт! Новые приключения будут в версии 3.0');
        return;
    }
    
    if (doorGameState.banUntil > Date.now()) {
        const remaining = Math.ceil((doorGameState.banUntil - Date.now()) / 3600000);
        alert(`Лабиринт заблокирован на ${remaining} часов!`);
        return;
    }
    
    if (typeof game !== 'undefined' && game.cookies < 1000) {
        alert('❌ НУЖНО 1000 КУКИ, ЧТОБЫ ВОЙТИ В ЛАБИРИНТ!');
        return;
    }
    
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'doorGame-loading';
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.95);
        z-index: 25000;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        backdrop-filter: blur(5px);
        font-family: 'Courier New', monospace;
        color: #ffd700;
        font-size: 24px;
        gap: 20px;
    `;
    loadingOverlay.innerHTML = `
        <div>💿 ЗАГРУЗКА АУДИО...</div>
        <div style="font-size: 14px; color: #aaa;">Пожалуйста, подождите</div>
    `;
    document.body.appendChild(loadingOverlay);
    
    const audio = new Audio('assets/audio/caught-in-a-loop.mp3');
    audio.load();
    
    let audioLoaded = false;
    
    audio.addEventListener('canplaythrough', () => {
        if (!audioLoaded) {
            audioLoaded = true;
            if (loadingOverlay) loadingOverlay.remove();
            
            audio.loop = true;
            audio.volume = 0.5;
            audio.play().catch(e => console.log('Автовоспроизведение заблокировано:', e));
            doorGameMusic = audio;
            
            if (typeof game !== 'undefined') {
                game.cookies -= 1000;
                if (typeof saveGame === 'function') saveGame();
                if (typeof updateUI === 'function') updateUI();
            }
            
            const overlay = document.createElement('div');
            overlay.id = 'doorGame-overlay';
            
            const container = document.createElement('div');
            container.className = 'door-game-window';
            container.innerHTML = `
                <div class="door-game-title">🚪 ИГРА В ДВЕРИ 🚪</div>
                <div class="door-game-music-brand">
                    <div class="door-game-cd-container">
                        <div class="door-game-cd-disc">💿</div>
                    </div>
                    <div class="door-game-music-text">
                        <div class="door-game-studio">Steel Wool Studios</div>
                        <div class="door-game-track">Caught In A Loop</div>
                    </div>
                </div>
                <div class="door-game-output" id="doorGame-output"></div>
                <div class="door-game-buttons" id="doorGame-buttons"></div>
                <button class="door-game-close" id="doorGame-close">🚪 ВЫЙТИ (ПРОИГРЫШ НЕ ЗАСЧИТЫВАЕТСЯ)</button>
                <div class="door-game-message" id="doorGame-message"></div>
            `;
            
            overlay.appendChild(container);
            document.body.appendChild(overlay);
            
            doorGameState.active = true;
            doorGameState.currentCorridor = 0;
            doorGameState.hp = 5;
            
            const outputDiv = document.getElementById('doorGame-output');
            const buttonsDiv = document.getElementById('doorGame-buttons');
            
            document.getElementById('doorGame-close').onclick = () => {
                if (confirm('Выйти из лабиринта? Проигрыш не засчитывается, но куки за вход не вернутся.')) {
                    closeDoorGame();
                }
            };
            
            startCorridor(container, outputDiv, buttonsDiv);
        }
    });
    
    if (audio.readyState >= 4) {
        audio.dispatchEvent(new Event('canplaythrough'));
    }
    
    setTimeout(() => {
        if (!audioLoaded && loadingOverlay) {
            loadingOverlay.innerHTML = '<div>❌ ОШИБКА ЗАГРУЗКИ АУДИО</div><div style="font-size: 14px;">Проверь файл assets/audio/caught-in-a-loop.mp3</div>';
            setTimeout(() => {
                if (loadingOverlay) loadingOverlay.remove();
            }, 3000);
        }
    }, 15000);
};

// ========== СЕКРЕТНАЯ КОМАНДА СБРОСА ЛАБИРИНТА ==========
window.labNo = function() {
    doorGameState.won = false;
    doorGameState.banUntil = 0;
    doorGameState.currentCorridor = 0;
    doorGameState.hp = 5;
    doorGameState.active = false;
    
    saveDoorGameState();
    stopMusic();
    
    const overlay = document.getElementById('doorGame-overlay');
    if (overlay) overlay.remove();
    
    console.log('%c✅ ЛАБИРИНТ СБРОШЕН!', 'color: #4CAF50; font-size: 14px;');
    alert('Лабиринт сброшен! Можно начинать заново командой labCookie()');
};