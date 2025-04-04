// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();

// --- Модальное окно ---
const modal = document.getElementById("modal");
const modalMessage = document.getElementById("modal-message");
const closeModal = document.querySelector(".close");

// Функция для показа модального окна
function showModal(message) {
    modalMessage.textContent = message;
    modal.style.display = "block";
}

// Закрытие модального окна
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});

// Закрытие модального окна при клике вне его
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// --- Обработчики иконок ---
document.querySelectorAll(".icon").forEach(icon => {
    icon.addEventListener("click", function() {
        const action = this.getAttribute("data-action");
        if (action === "inventory") {
            showModal("🎒 Инвентарь в разработке");
        } else if (action === "games") {
            // Уже находимся в разделе игр, ничего не делаем
            showModal("🎮 Вы уже в Игровом Мире!");
        } else if (action === "room") {
            showModal("🏠 Комната в разработке");
        } else if (action === "stats") {
            showModal("📊 Статистика в разработке");
        }
    });
});

// --- Игра Memory ---
function startMemoryGame() {
    document.getElementById("game-list").style.display = "none";
    const memoryGameScreen = document.getElementById("memory-game");
    memoryGameScreen.style.display = "block";

    // Список слов для запоминания
    const words = [
        "яблоко", "книга", "солнце", "река", "дерево", "машина", "дом", "цветок",
        "птица", "звезда", "луна", "облако", "стол", "окно", "дверь", "часы"
    ];

    // Отображаем слова
    const wordList = document.getElementById("word-list");
    wordList.innerHTML = words.join(", ");

    // Таймер на 2 минуты (120 секунд)
    let timeLeft = 120;
    const timerDisplay = document.getElementById("memory-timer");
    const timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            endMemoryGame(false);
        }
    }, 1000);

    // Обработчик кнопки "Готово"
    document.getElementById("memory-submit").addEventListener("click", () => {
        clearInterval(timer);
        endMemoryGame(true);
    });
}

function endMemoryGame(completed) {
    // Отправляем результат в бота
    const data = {
        action: "memory_game_result",
        completed: completed,
        initData: tg.initData
    };
    tg.sendData(JSON.stringify(data));
    tg.close();
}

// --- Игра Math ---
function startMathGame() {
    document.getElementById("game-list").style.display = "none";
    const mathGameScreen = document.getElementById("math-game");
    mathGameScreen.style.display = "block";

    // Генерируем пример (15 + 16)
    const problem = "15 + 16";
    document.getElementById("math-problem").textContent = problem;

    // Обработчик кнопки "Отправить"
    document.getElementById("math-submit").addEventListener("click", () => {
        const userAnswer = parseInt(document.getElementById("math-answer").value);
        const correctAnswer = 15 + 16; // 31
        const isCorrect = userAnswer === correctAnswer;
        endMathGame(isCorrect);
    });
}

function endMathGame(correct) {
    // Отправляем результат в бота
    const data = {
        action: "math_game_result",
        correct: correct,
        initData: tg.initData
    };
    tg.sendData(JSON.stringify(data));
    tg.close();
}

// --- Обработчики кнопок "START" ---
document.querySelectorAll(".start-button").forEach(button => {
    button.addEventListener("click", function() {
        const gameType = this.getAttribute("data-game");
        if (gameType === "memory") {
            startMemoryGame();
        } else if (gameType === "math") {
            startMathGame();
        }
    });
});