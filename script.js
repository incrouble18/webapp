// Получаем объект WebApp от Telegram
const tg = window.Telegram.WebApp;

// Элементы DOM
const userIdSpan = document.getElementById('user-id');
const mainMenu = document.getElementById('main-menu');
const gameSection = document.getElementById('game-section');
const charSection = document.getElementById('char-section');
const houseSection = document.getElementById('house-section');
const backButtons = document.querySelectorAll('.back-btn');

const playGameBtn = document.getElementById('play-game-btn');
const viewCharBtn = document.getElementById('view-char-btn');
const viewHouseBtn = document.getElementById('view-house-btn');

// Элементы игры
const clickBtn = document.getElementById('click-btn');
const clickCountSpan = document.getElementById('click-count');
const timeLeftSpan = document.getElementById('time-left');
const sendResultBtn = document.getElementById('send-result-btn');

let clickCount = 0;
let timeLeft = 5;
let gameInterval;
let gameActive = false;

// --- Инициализация Web App ---
tg.ready(); // Сообщаем Telegram, что приложение готово
tg.expand(); // Раскрываем Web App на весь экран

// Пытаемся получить данные пользователя (небезопасный способ, для отображения)
if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
    userIdSpan.textContent = tg.initDataUnsafe.user.id;
} else {
    userIdSpan.textContent = "Не удалось получить ID";
    // Можно запросить у бэкенда или показать ошибку
}

// --- Навигация ---
function showSection(sectionToShow) {
    mainMenu.style.display = 'none';
    gameSection.style.display = 'none';
    charSection.style.display = 'none';
    houseSection.style.display = 'none';
    sectionToShow.style.display = 'block';
}

function showMainMenu() {
    showSection(mainMenu);
}

playGameBtn.addEventListener('click', () => {
    showSection(gameSection);
    resetGame(); // Сбрасываем игру при входе
});
viewCharBtn.addEventListener('click', () => showSection(charSection));
viewHouseBtn.addEventListener('click', () => showSection(houseSection));
backButtons.forEach(btn => btn.addEventListener('click', showMainMenu));

// --- Логика Мини-Игры ---
function resetGame() {
    clickCount = 0;
    timeLeft = 5;
    clickCountSpan.textContent = clickCount;
    timeLeftSpan.textContent = timeLeft;
    clickBtn.disabled = false;
    sendResultBtn.style.display = 'none';
    gameActive = false;
    if (gameInterval) clearInterval(gameInterval);
}

clickBtn.addEventListener('click', () => {
    if (!gameActive) {
        // Начинаем игру по первому клику
        gameActive = true;
        gameInterval = setInterval(() => {
            timeLeft--;
            timeLeftSpan.textContent = timeLeft;
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    if (gameActive && timeLeft > 0) {
        clickCount++;
        clickCountSpan.textContent = clickCount;
    }
});

function endGame() {
    clearInterval(gameInterval);
    clickBtn.disabled = true;
    gameActive = false;
    sendResultBtn.style.display = 'block'; // Показываем кнопку отправки
    alert(`Игра окончена! Ваш результат: ${clickCount} кликов.`);
}

// --- Отправка данных Боту ---
sendResultBtn.addEventListener('click', () => {
    const dataToSend = {
        action: 'game_result',
        score: clickCount
    };

    // Используем API Telegram для отправки данных
    // Бот получит это как строку JSON
    tg.sendData(JSON.stringify(dataToSend));

    // Опционально: можно закрыть Web App после отправки
    // tg.close();
    alert('Результат отправлен боту!');
    sendResultBtn.style.display = 'none'; // Скрываем кнопку после отправки
});

// Пример: Кнопка для закрытия Web App (если нужна)
// const closeBtn = document.createElement('button');
// closeBtn.innerText = 'Закрыть';
// closeBtn.style.backgroundColor = 'grey';
// closeBtn.addEventListener('click', () => {
//     tg.close();
// });
// document.body.appendChild(closeBtn);