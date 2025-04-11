// Инициализация совместимости с Telegram Web App
let tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
    tg.expand();
}

// Основные переменные боевой системы
let battleInProgress = false;
let playerMaxHealth = 100;
let playerCurrentHealth = 100;
let playerBaseDamage = 5;
let playerDamage = 5;
let healBaseAmount = 15;
let healAmount = 15;
let enemyMaxHealth = 150;
let enemyCurrentHealth = 150;
let enemyBaseDamage = 3;
let enemyDamage = 3;
let enemyLevel = 1;
let enemyAttackInterval;
let battleMessages;
let battleRewards = [];
let healingSignsInterval;
let lastHealingSignTime = 0;
let healingSignMinInterval = 5000; // Минимум 5 секунд между знаками исцеления
let battleMessage = document.getElementById('battle-message');
let healingOrbInterval;

// DOM элементы
let playerHealthBar;
let playerHealthText;
let enemyHealthBar;
let enemyHealthText;
let battleControls;
let startBattleButton;
let healButton;
let specialButton;
let continueButton;
let battleResultsContainer;
let resultTitle;
let rewardsContainer;
let battleStartOverlay;
let battleResultsOverlay;
let enemyImage;
let xpEarned;
let itemEarned;
let enemyArea;
let battleArea;

// Типы врагов
const enemies = [
    { name: "Кибер-волк", health: 170, damage: 2, level: 1, image: "cyberwolf.png", xp: 17, drops: ["Простое кольцо", "Зелье здоровья"] },
    { name: "Фиолетовый демон", health: 220, damage: 3, level: 2, image: "purple_demon.png", xp: 25, drops: ["Магический амулет", "Энергетический напиток"] },
    { name: "Тёмный рыцарь", health: 300, damage: 4, level: 3, image: "dark_knight.png", xp: 40, drops: ["Стальной меч", "Щит"] }
];

// Текущий враг
let currentEnemy = enemies[0];

// Инициализация при загрузке документа
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация DOM элементов
    playerHealthBar = document.querySelector('.player-health-fill');
    playerHealthText = document.querySelector('.player-health-text');
    enemyHealthBar = document.querySelector('.enemy-health-fill');
    enemyHealthText = document.querySelector('.enemy-health-text');
    battleControls = document.querySelector('.battle-controls');
    startBattleButton = document.getElementById('start-battle-btn');
    healButton = document.getElementById('heal-btn');
    specialButton = document.getElementById('special-btn');
    continueButton = document.getElementById('continue-btn');
    battleResultsContainer = document.getElementById('battle-results-container');
    resultTitle = document.getElementById('result-title');
    rewardsContainer = document.getElementById('rewards-container');
    battleStartOverlay = document.getElementById('battle-start');
    battleResultsOverlay = document.getElementById('battle-results');
    enemyImage = document.querySelector('.enemy-image');
    xpEarned = document.getElementById('xp-earned');
    itemEarned = document.getElementById('item-earned');
    enemyArea = document.querySelector('.enemy-area');
    battleArea = document.getElementById('battle-area');
    
    // Настройка обработчиков событий кликов
    if (startBattleButton) {
        startBattleButton.addEventListener('click', startBattle);
    }
    if (healButton) {
        healButton.addEventListener('click', healPlayer);
    }
    if (specialButton) {
        specialButton.addEventListener('click', useSpecialAttack);
    }
    if (continueButton) {
        continueButton.addEventListener('click', resetBattle);
    }
    if (enemyImage) {
        enemyImage.addEventListener('click', attackEnemy);
    }
    
    // Инициализация полос здоровья
    updateHealthBars();
});

// Начать новый бой
function startBattle() {
    battleInProgress = true;
    
    if (battleStartOverlay) {
        battleStartOverlay.style.display = 'none';
    }
    
    // Выбрать случайного врага
    currentEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    
    // Установить изображение и характеристики врага
    if (enemyImage) {
        enemyImage.src = currentEnemy.image;
    }
    enemyMaxHealth = currentEnemy.health;
    enemyCurrentHealth = enemyMaxHealth;
    enemyDamage = currentEnemy.damage;
    enemyLevel = currentEnemy.level;
    
    // Обновить отображение здоровья
    updateHealthBars();
    
    // Запустить интервал атаки врага
    enemyAttackInterval = setInterval(enemyAttack, 2000);
    
    // Запустить интервал появления исцеляющих сфер
    healingOrbInterval = setInterval(spawnHealingOrb, 5000);
    
    // Обновить сообщение боя
    updateBattleMessage(`Битва началась! Вы сражаетесь против ${currentEnemy.name} ${enemyLevel} уровня!`);
    
    // Показать элементы управления боем, если они есть
    if (battleControls) {
        battleControls.style.display = 'flex';
    }
}

// Враг атакует игрока
function enemyAttack() {
    if (battleInProgress) {
        // Рассчитать урон с небольшой случайностью
        let damage = Math.max(1, Math.floor(enemyDamage * (0.8 + Math.random() * 0.4)));
        
        // Применить урон к игроку
        playerCurrentHealth = Math.max(0, playerCurrentHealth - damage);
        
        // Обновить интерфейс
        updateHealthBars();
        updateBattleMessage(`Враг наносит вам ${damage} урона!`);
        
        // Проверить, побежден ли игрок
        if (playerCurrentHealth <= 0) {
            endBattle(false);
        }
    }
}

// Игрок атакует врага
function attackEnemy() {
    if (battleInProgress) {
        // Рассчитать урон с небольшой случайностью
        let damage = Math.max(1, Math.floor(playerDamage * (0.8 + Math.random() * 0.4)));
        
        // Применить урон к врагу
        enemyCurrentHealth = Math.max(0, enemyCurrentHealth - damage);
        
        // Обновить интерфейс
        updateHealthBars();
        updateBattleMessage(`Вы наносите врагу ${damage} урона!`);
        
        // Применить анимацию урона к врагу
        if (enemyImage) {
            enemyImage.classList.add('damage-animation');
            setTimeout(() => {
                enemyImage.classList.remove('damage-animation');
            }, 500);
        }
        
        // Проверить, побежден ли враг
        if (enemyCurrentHealth <= 0) {
            endBattle(true);
        }
    }
}

// Исцеление игрока
function healPlayer() {
    if (battleInProgress && playerCurrentHealth < playerMaxHealth) {
        // Рассчитать значение лечения с небольшой случайностью
        const healValue = Math.floor(healAmount * (0.8 + Math.random() * 0.4));
        playerCurrentHealth = Math.min(playerMaxHealth, playerCurrentHealth + healValue);
        
        // Обновить интерфейс
        updateHealthBars();
        updateBattleMessage(`Вы исцелились на ${healValue} здоровья!`);
        
        // Отключить кнопку лечения на время перезарядки
        if (healButton) {
            healButton.disabled = true;
            setTimeout(() => {
                healButton.disabled = false;
            }, 3000); // 3 секунды перезарядки
        }
    }
}

// Использовать специальную атаку
function useSpecialAttack() {
    if (battleInProgress) {
        // Рассчитать урон для специальной атаки (двойной урон)
        let damage = Math.max(2, Math.floor(playerDamage * 2 * (0.8 + Math.random() * 0.4)));
        
        // Применить урон к врагу
        enemyCurrentHealth = Math.max(0, enemyCurrentHealth - damage);
        
        // Обновить интерфейс
        updateHealthBars();
        updateBattleMessage(`Специальная атака! Вы наносите врагу ${damage} урона!`);
        
        // Применить анимацию урона к врагу
        if (enemyImage) {
            enemyImage.classList.add('special-damage-animation');
            setTimeout(() => {
                enemyImage.classList.remove('special-damage-animation');
            }, 500);
        }
        
        // Отключить кнопку специальной атаки на время перезарядки
        if (specialButton) {
            specialButton.disabled = true;
            setTimeout(() => {
                specialButton.disabled = false;
            }, 5000); // 5 секунд перезарядки
        }
        
        // Проверить, побежден ли враг
        if (enemyCurrentHealth <= 0) {
            endBattle(true);
        }
    }
}

// Появление исцеляющей сферы
function spawnHealingOrb() {
    if (battleInProgress && playerCurrentHealth < playerMaxHealth && battleArea) {
        // Создать исцеляющую сферу
        const healingOrb = document.createElement('div');
        healingOrb.className = 'healing-orb';
        
        // Случайная позиция рядом с врагом
        const enemyRect = enemyArea ? enemyArea.getBoundingClientRect() : {left: 0, top: 0, width: 100, height: 100};
        const battleRect = battleArea.getBoundingClientRect();
        
        const randomX = Math.random() * (enemyRect.width - 30);
        const randomY = Math.random() * (enemyRect.height - 30);
        
        healingOrb.style.left = `${randomX + enemyRect.left - battleRect.left}px`;
        healingOrb.style.top = `${randomY + enemyRect.top - battleRect.top}px`;
        
        // Добавить событие клика
        healingOrb.addEventListener('click', function() {
            if (battleInProgress) {
                // Исцелить игрока
                const healValue = Math.floor(healAmount * (0.8 + Math.random() * 0.4));
                playerCurrentHealth = Math.min(playerMaxHealth, playerCurrentHealth + healValue);
                
                // Обновить интерфейс
                updateHealthBars();
                updateBattleMessage(`Вы исцелились на ${healValue} здоровья!`);
                
                // Удалить сферу
                battleArea.removeChild(healingOrb);
            }
        });
        
        // Добавить сферу в боевую область
        battleArea.appendChild(healingOrb);
        
        // Автоматически удалить через 3 секунды
        setTimeout(() => {
            if (battleArea.contains(healingOrb)) {
                battleArea.removeChild(healingOrb);
            }
        }, 3000);
    }
}

// Завершить бой
function endBattle(playerWon) {
    battleInProgress = false;
    
    // Очистить интервалы
    clearInterval(enemyAttackInterval);
    clearInterval(healingOrbInterval);
    
    // Удалить все исцеляющие сферы
    document.querySelectorAll('.healing-orb').forEach(orb => orb.remove());
    
    // Скрыть элементы управления боем, если они есть
    if (battleControls) {
        battleControls.style.display = 'none';
    }
    
    // Установить результаты боя
    if (playerWon) {
        if (resultTitle) {
            resultTitle.textContent = 'Победа!';
        }
        if (xpEarned) {
            xpEarned.textContent = currentEnemy.xp;
        }
        
        // Случайный предмет
        const randomItem = currentEnemy.drops[Math.floor(Math.random() * currentEnemy.drops.length)];
        if (itemEarned) {
            itemEarned.textContent = randomItem;
        }
        
        // Добавить награду
        battleRewards = [
            { type: 'xp', amount: currentEnemy.xp },
            { type: 'item', name: randomItem }
        ];
    } else {
        if (resultTitle) {
            resultTitle.textContent = 'Поражение!';
        }
        if (xpEarned) {
            xpEarned.textContent = Math.floor(currentEnemy.xp / 4);
        }
        if (itemEarned) {
            itemEarned.textContent = 'Ничего';
        }
        
        // Добавить меньшую награду за поражение
        battleRewards = [
            { type: 'xp', amount: Math.floor(currentEnemy.xp / 4) }
        ];
    }
    
    // Показать результаты боя
    if (battleResultsOverlay) {
        battleResultsOverlay.style.display = 'flex';
    }
}

// Сбросить для нового боя
function resetBattle() {
    // Скрыть результаты
    if (battleResultsOverlay) {
        battleResultsOverlay.style.display = 'none';
    }
    
    // Сбросить здоровье игрока
    playerCurrentHealth = playerMaxHealth;
    
    // Обновить интерфейс
    updateHealthBars();
    updateBattleMessage('Готов к новой битве!');
    
    // Показать оверлей начала боя
    if (battleStartOverlay) {
        battleStartOverlay.style.display = 'flex';
    }
}

// Обновить полосы здоровья и текст
function updateHealthBars() {
    // Обновить здоровье игрока
    const playerHealthPercent = (playerCurrentHealth / playerMaxHealth) * 100;
    if (playerHealthBar) {
        playerHealthBar.style.width = `${playerHealthPercent}%`;
    }
    if (playerHealthText) {
        playerHealthText.textContent = `${playerCurrentHealth}/${playerMaxHealth}`;
    }
    
    // Обновить здоровье врага
    const enemyHealthPercent = (enemyCurrentHealth / enemyMaxHealth) * 100;
    if (enemyHealthBar) {
        enemyHealthBar.style.width = `${enemyHealthPercent}%`;
    }
    if (enemyHealthText) {
        enemyHealthText.textContent = `${enemyCurrentHealth}/${enemyMaxHealth}`;
    }
}

// Обновить сообщение боя
function updateBattleMessage(message) {
    if (battleMessage) {
        battleMessage.textContent = message;
    }
}

// Функции повышения уровня и улучшения характеристик игрока
let playerLevel = 1;
let playerXP = 0;
let playerXPToNextLevel = 100;
let playerSkillPoints = 0;

// Повышение уровня игрока
function levelUp() {
    playerLevel++;
    playerSkillPoints += 3;
    
    // Увеличение базовых характеристик
    playerMaxHealth += 10;
    playerCurrentHealth = playerMaxHealth;
    playerBaseDamage += 1;
    playerDamage = playerBaseDamage;
    
    // Обновление XP для следующего уровня (увеличение на 50% от предыдущего значения)
    playerXPToNextLevel = Math.floor(playerXPToNextLevel * 1.5);
    
    // Обновление интерфейса
    updatePlayerStats();
    
    return {
        newLevel: playerLevel,
        healthIncrease: 10,
        damageIncrease: 1,
        skillPoints: 3
    };
}

// Добавление XP игроку и проверка повышения уровня
function addXP(amount) {
    playerXP += amount;
    let levelUps = 0;
    let levelUpData = [];
    
    // Проверка повышения уровня
    while (playerXP >= playerXPToNextLevel) {
        playerXP -= playerXPToNextLevel;
        levelUps++;
        levelUpData.push(levelUp());
    }
    
    // Обновление интерфейса
    updatePlayerStats();
    
    return {
        levelUps: levelUps,
        levelUpData: levelUpData,
        currentXP: playerXP,
        xpToNextLevel: playerXPToNextLevel
    };
}

// Улучшение характеристик игрока
function improveStats(stat) {
    if (playerSkillPoints <= 0) {
        return false;
    }
    
    switch (stat) {
        case 'health':
            playerMaxHealth += 5;
            playerCurrentHealth += 5;
            break;
        case 'damage':
            playerBaseDamage += 1;
            playerDamage = playerBaseDamage;
            break;
        case 'heal':
            healBaseAmount += 2;
            healAmount = healBaseAmount;
            break;
        default:
            return false;
    }
    
    playerSkillPoints--;
    updatePlayerStats();
    
    return true;
}

// Обновление отображения характеристик игрока
function updatePlayerStats() {
    const playerLevelElement = document.getElementById('player-level');
    const playerXPElement = document.getElementById('player-xp');
    const playerSkillPointsElement = document.getElementById('player-skill-points');
    
    if (playerLevelElement) {
        playerLevelElement.textContent = playerLevel;
    }
    
    if (playerXPElement) {
        playerXPElement.textContent = `${playerXP}/${playerXPToNextLevel}`;
    }
    
    if (playerSkillPointsElement) {
        playerSkillPointsElement.textContent = playerSkillPoints;
    }
    
    updateHealthBars();
}

// Система инвентаря
let playerInventory = {
    items: [],
    gold: 0,
    maxItems: 20
};

// Добавление предмета в инвентарь
function addItemToInventory(item) {
    if (playerInventory.items.length >= playerInventory.maxItems) {
        return false;
    }
    
    playerInventory.items.push(item);
    updateInventoryDisplay();
    
    return true;
}

// Удаление предмета из инвентаря
function removeItemFromInventory(index) {
    if (index < 0 || index >= playerInventory.items.length) {
        return false;
    }
    
    const removedItem = playerInventory.items.splice(index, 1)[0];
    updateInventoryDisplay();
    
    return removedItem;
}

// Использование предмета из инвентаря
function useItem(index) {
    if (index < 0 || index >= playerInventory.items.length) {
        return false;
    }
    
    const item = playerInventory.items[index];
    let itemEffect = false;
    
    switch (item.type) {
        case 'potion':
            if (playerCurrentHealth < playerMaxHealth) {
                playerCurrentHealth = Math.min(playerMaxHealth, playerCurrentHealth + item.value);
                updateHealthBars();
                itemEffect = true;
            }
            break;
        case 'buff':
            switch (item.stat) {
                case 'damage':
                    playerDamage = Math.floor(playerBaseDamage * (1 + item.value / 100));
                    setTimeout(() => {
                        playerDamage = playerBaseDamage;
                    }, item.duration * 1000);
                    itemEffect = true;
                    break;
                // Другие временные эффекты
            }
            break;
        case 'equipment':
            // Логика экипировки
            equipItem(item);
            itemEffect = true;
            break;
    }
    
    if (itemEffect) {
        removeItemFromInventory(index);
        return true;
    }
    
    return false;
}

// Экипировка предмета
let playerEquipment = {
    weapon: null,
    armor: null,
    ring: null,
    amulet: null
};

function equipItem(item) {
    if (item.slot && playerEquipment.hasOwnProperty(item.slot)) {
        // Снять текущий предмет
        const currentItem = playerEquipment[item.slot];
        if (currentItem) {
            addItemToInventory(currentItem);
        }
        
        // Экипировать новый предмет
        playerEquipment[item.slot] = item;
        
        // Применить бонусы
        applyEquipmentBonuses();
        
        return true;
    }
    
    return false;
}

// Снятие экипированного предмета
function unequipItem(slot) {
    if (playerEquipment.hasOwnProperty(slot) && playerEquipment[slot]) {
        const item = playerEquipment[slot];
        if (addItemToInventory(item)) {
            playerEquipment[slot] = null;
            applyEquipmentBonuses();
            return true;
        }
    }
    
    return false;
}

// Применение бонусов от экипировки
function applyEquipmentBonuses() {
    // Сброс к базовым характеристикам
    playerDamage = playerBaseDamage;
    
    // Применение бонусов оружия
    if (playerEquipment.weapon && playerEquipment.weapon.damage) {
        playerDamage += playerEquipment.weapon.damage;
    }
    
    // Обновление интерфейса
    updatePlayerStats();
}

// Обновление отображения инвентаря
function updateInventoryDisplay() {
    const inventoryElement = document.getElementById('inventory-items');
    const goldElement = document.getElementById('player-gold');
    
    if (inventoryElement) {
        inventoryElement.innerHTML = '';
        
        playerInventory.items.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            itemElement.dataset.index = index;
            
            // Создание иконки предмета
            const iconElement = document.createElement('div');
            iconElement.className = 'item-icon';
            if (item.icon) {
                iconElement.style.backgroundImage = `url(${item.icon})`;
            } else {
                // Фоновый цвет по типу предмета
                switch (item.type) {
                    case 'potion':
                        iconElement.style.backgroundColor = '#ff9999';
                        break;
                    case 'buff':
                        iconElement.style.backgroundColor = '#99ff99';
                        break;
                    case 'equipment':
                        iconElement.style.backgroundColor = '#9999ff';
                        break;
                    default:
                        iconElement.style.backgroundColor = '#cccccc';
                }
            }
            
            // Создание информации о предмете
            const infoElement = document.createElement('div');
            infoElement.className = 'item-info';
            infoElement.innerHTML = `
                <div class="item-name">${item.name}</div>
                <div class="item-description">${item.description || ''}</div>
            `;
            
            // Создание кнопок действий с предметом
            const actionsElement = document.createElement('div');
            actionsElement.className = 'item-actions';
            
            const useButton = document.createElement('button');
            useButton.className = 'item-use-btn';
            useButton.textContent = 'Использовать';
            useButton.addEventListener('click', () => useItem(index));
            
            const dropButton = document.createElement('button');
            dropButton.className = 'item-drop-btn';
            dropButton.textContent = 'Выбросить';
            dropButton.addEventListener('click', () => removeItemFromInventory(index));
            
            actionsElement.appendChild(useButton);
            actionsElement.appendChild(dropButton);
            
            // Добавление всех элементов
            itemElement.appendChild(iconElement);
            itemElement.appendChild(infoElement);
            itemElement.appendChild(actionsElement);
            
            inventoryElement.appendChild(itemElement);
        });
    }
    
    if (goldElement) {
        goldElement.textContent = playerInventory.gold;
    }
}

// Система магазина
let shopItems = [
    {
        id: 1,
        name: "Зелье здоровья",
        description: "Восстанавливает 30 здоровья",
        price: 20,
        type: "potion",
        value: 30,
        icon: "health_potion.png"
    },
    {
        id: 2,
        name: "Железный меч",
        description: "+3 к урону",
        price: 50,
        type: "equipment",
        slot: "weapon",
        damage: 3,
        icon: "iron_sword.png"
    },
    {
        id: 3,
        name: "Кожаная броня",
        description: "+10 к максимальному здоровью",
        price: 40,
        type: "equipment",
        slot: "armor",
        healthBonus: 10,
        icon: "leather_armor.png"
    },
    {
        id: 4,
        name: "Эликсир силы",
        description: "+50% урона на 30 секунд",
        price: 30,
        type: "buff",
        stat: "damage",
        value: 50,
        duration: 30,
        icon: "strength_elixir.png"
    }
];

// Покупка предмета в магазине
function buyItem(itemId) {
    const item = shopItems.find(item => item.id === itemId);
    
    if (!item || playerInventory.gold < item.price) {
        return false;
    }
    
    if (playerInventory.items.length >= playerInventory.maxItems) {
        return false;
    }
    
    playerInventory.gold -= item.price;
    addItemToInventory({...item});
    
    return true;
}

// Продажа предмета из инвентаря
function sellItem(index) {
    if (index < 0 || index >= playerInventory.items.length) {
        return false;
    }
    
    const item = playerInventory.items[index];
    // Обычно предметы продаются за половину цены
    const sellPrice = item.price ? Math.floor(item.price / 2) : 1;
    
    playerInventory.gold += sellPrice;
    removeItemFromInventory(index);
    
    updateInventoryDisplay();
    
    return sellPrice;
}

// Обновление отображения магазина
function updateShopDisplay() {
    const shopElement = document.getElementById('shop-items');
    
    if (shopElement) {
        shopElement.innerHTML = '';
        
        shopItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'shop-item';
            itemElement.dataset.id = item.id;
            
            // Создание иконки предмета
            const iconElement = document.createElement('div');
            iconElement.className = 'item-icon';
            if (item.icon) {
                iconElement.style.backgroundImage = `url(${item.icon})`;
            }
            
            // Создание информации о предмете
            const infoElement = document.createElement('div');
            infoElement.className = 'item-info';
            infoElement.innerHTML = `
                <div class="item-name">${item.name}</div>
                <div class="item-description">${item.description || ''}</div>
                <div class="item-price">${item.price} золота</div>
            `;
            
            // Создание кнопки покупки
            const buyButton = document.createElement('button');
            buyButton.className = 'item-buy-btn';
            buyButton.textContent = 'Купить';
            buyButton.disabled = playerInventory.gold < item.price;
            buyButton.addEventListener('click', () => {
                if (buyItem(item.id)) {
                    updateShopDisplay();
                }
            });
            
            // Добавление всех элементов
            itemElement.appendChild(iconElement);
            itemElement.appendChild(infoElement);
            itemElement.appendChild(buyButton);
            
            shopElement.appendChild(itemElement);
        });
    }
}

// Системное сообщение для вывода информации о действиях
function showSystemMessage(message, type = 'info') {
    const messagesContainer = document.getElementById('system-messages');
    
    if (messagesContainer) {
        const messageElement = document.createElement('div');
        messageElement.className = `system-message message-${type}`;
        messageElement.textContent = message;
        
        messagesContainer.appendChild(messageElement);
        
        // Автоматическое удаление сообщения через 5 секунд
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                if (messagesContainer.contains(messageElement)) {
                    messagesContainer.removeChild(messageElement);
                }
            }, 1000);
        }, 4000);
    }
}

// Система заданий
let questsData = [
    {
        id: 1,
        title: "Охота на волков",
        description: "Победите 3 Кибер-волка",
        type: "kill",
        targetEnemy: "Кибер-волк",
        targetCount: 3,
        currentCount: 0,
        rewards: {
            xp: 50,
            gold: 30,
            items: [
                { 
                    name: "Амулет силы", 
                    description: "+1 к базовому урону", 
                    type: "equipment", 
                    slot: "amulet",
                    damage: 1,
                    icon: "power_amulet.png"
                }
            ]
        },
        completed: false,
        active: false
    },
    {
        id: 2,
        title: "Охотник на демонов",
        description: "Победите Фиолетового демона",
        type: "kill",
        targetEnemy: "Фиолетовый демон",
        targetCount: 1,
        currentCount: 0,
        rewards: {
            xp: 70,
            gold: 50,
            items: [
                { 
                    name: "Демонический клинок", 
                    description: "+5 к базовому урону", 
                    type: "equipment", 
                    slot: "weapon",
                    damage: 5,
                    icon: "demon_blade.png"
                }
            ]
        },
        completed: false,
        active: false
    },
    {
        id: 3,
        title: "Испытание тьмой",
        description: "Победите Тёмного рыцаря",
        type: "kill",
        targetEnemy: "Тёмный рыцарь",
        targetCount: 1,
        currentCount: 0,
        rewards: {
            xp: 100,
            gold: 100,
            items: [
                { 
                    name: "Тёмная броня", 
                    description: "+20 к максимальному здоровью", 
                    type: "equipment", 
                    slot: "armor",
                    healthBonus: 20,
                    icon: "dark_armor.png"
                }
            ]
        },
        completed: false,
        active: false
    }
];

let activeQuests = [];

// Активация задания
function activateQuest(questId) {
    const quest = questsData.find(q => q.id === questId);
    
    if (!quest || quest.active || quest.completed) {
        return false;
    }
    
    quest.active = true;
    activeQuests.push(quest);
    
    // Обновить отображение заданий
    updateQuestsDisplay();
    
    return true;
}

// Обновление прогресса задания
function updateQuestProgress(enemyName) {
    let questsUpdated = false;
    
    activeQuests.forEach(quest => {
        if (quest.type === "kill" && quest.targetEnemy === enemyName && !quest.completed) {
            quest.currentCount++;
            
            // Проверить выполнение задания
            if (quest.currentCount >= quest.targetCount) {
                completeQuest(quest.id);
            }
            
            questsUpdated = true;
        }
    });
    
    if (questsUpdated) {
        updateQuestsDisplay();
    }
}

// Завершение задания
function completeQuest(questId) {
    const quest = questsData.find(q => q.id === questId);
    
    if (!quest || quest.completed || !quest.active) {
        return false;
    }
    
    // Выдать награды
    if (quest.rewards) {
        // Опыт
        if (quest.rewards.xp) {
            const levelUpInfo = addXP(quest.rewards.xp);
            if (levelUpInfo.levelUps > 0) {
                showSystemMessage(`Вы повысили уровень до ${playerLevel}!`, 'success');
            }
        }
        
        // Золото
        if (quest.rewards.gold) {
            playerInventory.gold += quest.rewards.gold;
        }
        
        // Предметы
        if (quest.rewards.items && quest.rewards.items.length > 0) {
            quest.rewards.items.forEach(item => {
                addItemToInventory({...item});
            });
        }
    }
    
    // Обновить статус задания
    quest.completed = true;
    quest.active = false;
    activeQuests = activeQuests.filter(q => q.id !== quest.id);
    
    // Показать системное сообщение
    showSystemMessage(`Задание "${quest.title}" выполнено!`, 'success');
    
    // Обновить отображение
    updateQuestsDisplay();
    updateInventoryDisplay();
    
    return true;
}

// Обновление отображения заданий
function updateQuestsDisplay() {
    const questsListElement = document.getElementById('quests-list');
    const activeQuestsElement = document.getElementById('active-quests');
    
    // Отображение доступных заданий
    if (questsListElement) {
        questsListElement.innerHTML = '';
        
        questsData.forEach(quest => {
            if (!quest.active && !quest.completed) {
                const questElement = document.createElement('div');
                questElement.className = 'quest-item';
                
                questElement.innerHTML = `
                    <div class="quest-title">${quest.title}</div>
                    <div class="quest-description">${quest.description}</div>
                    <div class="quest-rewards">
                        <span>Награды:</span>
                        <ul>
                            ${quest.rewards.xp ? `<li>${quest.rewards.xp} опыта</li>` : ''}
                            ${quest.rewards.gold ? `<li>${quest.rewards.gold} золота</li>` : ''}
                            ${quest.rewards.items ? quest.rewards.items.map(item => `<li>${item.name}</li>`).join('') : ''}
                        </ul>
                    </div>
                `;
                
                const acceptButton = document.createElement('button');
                acceptButton.className = 'quest-accept-btn';
                acceptButton.textContent = 'Принять';
                acceptButton.addEventListener('click', () => {
                    if (activateQuest(quest.id)) {
                        showSystemMessage(`Вы приняли задание "${quest.title}"`, 'info');
                        updateQuestsDisplay();
                    }
                });
                
                questElement.appendChild(acceptButton);
                questsListElement.appendChild(questElement);
            }
        });
    }
    
    // Отображение активных заданий
    if (activeQuestsElement) {
        activeQuestsElement.innerHTML = '';
        
        activeQuests.forEach(quest => {
            const questElement = document.createElement('div');
            questElement.className = 'active-quest-item';
            
            questElement.innerHTML = `
                <div class="quest-title">${quest.title}</div>
                <div class="quest-description">${quest.description}</div>
                <div class="quest-progress">Прогресс: ${quest.currentCount}/${quest.targetCount}</div>
            `;
            
            activeQuestsElement.appendChild(questElement);
        });
    }
}

// Система достижений
let achievementsData = [
    {
        id: 1,
        title: "Первая кровь",
        description: "Победите своего первого врага",
        condition: "killCount",
        targetValue: 1,
        currentValue: 0,
        rewards: {
            xp: 20
        },
        completed: false
    },
    {
        id: 2,
        title: "Истребитель",
        description: "Победите 10 врагов",
        condition: "killCount",
        targetValue: 10,
        currentValue: 0,
        rewards: {
            xp: 50,
            gold: 20
        },
        completed: false
    },
    {
        id: 3,
        title: "Мастер боя",
        description: "Достигните 5 уровня",
        condition: "playerLevel",
        targetValue: 5,
        currentValue: 1,
        rewards: {
            xp: 100,
            gold: 50,
            items: [
                {
                    name: "Кольцо мастерства",
                    description: "+2 к базовому урону",
                    type: "equipment",
                    slot: "ring",
                    damage: 2,
                    icon: "mastery_ring.png"
                }
            ]
        },
        completed: false
    }
];

// Счетчики для достижений
let achievementCounters = {
    killCount: 0,
    playerLevel: 1,
    goldEarned: 0,
    itemsCollected: 0
};

// Обновление прогресса достижений
function updateAchievementsProgress(counter, value) {
    achievementCounters[counter] = value;
    
    let achievementsCompleted = false;
    
    achievementsData.forEach(achievement => {
        if (!achievement.completed && achievement.condition === counter) {
            achievement.currentValue = value;
            
            // Проверить выполнение достижения
            if (achievement.currentValue >= achievement.targetValue) {
                completeAchievement(achievement.id);
                achievementsCompleted = true;
            }
        }
    });
    
    if (achievementsCompleted) {
        updateAchievementsDisplay();
    }
}

// Завершение достижения
function completeAchievement(achievementId) {
    const achievement = achievementsData.find(a => a.id === achievementId);
    
    if (!achievement || achievement.completed) {
        return false;
    }
    
    // Выдать награды
    if (achievement.rewards) {
        // Опыт
        if (achievement.rewards.xp) {
            addXP(achievement.rewards.xp);
        }
        
        // Золото
        if (achievement.rewards.gold) {
            playerInventory.gold += achievement.rewards.gold;
        }
        
        // Предметы
        if (achievement.rewards.items && achievement.rewards.items.length > 0) {
            achievement.rewards.items.forEach(item => {
                addItemToInventory({...item});
            });
        }
    }
    
    // Обновить статус достижения
    achievement.completed = true;
    
    // Показать системное сообщение
    showSystemMessage(`Достижение получено: "${achievement.title}"!`, 'achievement');
    
    // Обновить отображение
    updateAchievementsDisplay();
    updateInventoryDisplay();
    
    return true;
}

// Обновление отображения достижений
function updateAchievementsDisplay() {
    const achievementsElement = document.getElementById('achievements-list');
    
    if (achievementsElement) {
        achievementsElement.innerHTML = '';
        
        achievementsData.forEach(achievement => {
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement-item ${achievement.completed ? 'completed' : ''}`;
            
            // Расчет прогресса
            const progressPercent = Math.min(100, Math.floor((achievement.currentValue / achievement.targetValue) * 100));
            
            achievementElement.innerHTML = `
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
                <div class="achievement-progress-bar">
                    <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div class="achievement-progress-text">${achievement.currentValue}/${achievement.targetValue}</div>
                <div class="achievement-rewards">
                    ${achievement.rewards.xp ? `<span>${achievement.rewards.xp} опыта</span>` : ''}
                    ${achievement.rewards.gold ? `<span>${achievement.rewards.gold} золота</span>` : ''}
                </div>
            `;
            
            achievementsElement.appendChild(achievementElement);
        });
    }
}

// Система навыков
let playerSkills = [
    {
        id: 1,
        name: "Берсерк",
        description: "Увеличивает урон на 50% на 10 секунд",
        cooldown: 30, // в секундах
        lastUsed: 0,
        unlocked: false,
        icon: "berserk.png"
    },
    {
        id: 2,
        name: "Регенерация",
        description: "Восстанавливает 5 здоровья каждую секунду в течение 5 секунд",
        cooldown: 45,
        lastUsed: 0,
        unlocked: false,
        icon: "regeneration.png"
    },
    {
        id: 3,
        name: "Уклонение",
        description: "70% шанс уклониться от следующей атаки врага в течение 3 секунд",
        cooldown: 60,
        lastUsed: 0,
        unlocked: false,
        icon: "dodge.png"
    }
];

// Разблокировка навыка
function unlockSkill(skillId) {
    if (playerSkillPoints <= 0) {
        return false;
    }
    
    const skill = playerSkills.find(s => s.id === skillId);
    
    if (!skill || skill.unlocked) {
        return false;
    }
    
    skill.unlocked = true;
    playerSkillPoints--;
    
    updatePlayerStats();
    updateSkillsDisplay();
    
    return true;
}

// Использование навыка
function useSkill(skillId) {
    const skill = playerSkills.find(s => s.id === skillId);
    const currentTime = Date.now() / 1000; // Текущее время в секундах
    
    if (!skill || !skill.unlocked) {
        return false;
    }
    
    // Проверка перезарядки
    if (currentTime - skill.lastUsed < skill.cooldown) {
        return false;
    }
    
    // Применение эффекта навыка
    switch (skill.id) {
        case 1: // Берсерк
            const originalDamage = playerDamage;
            playerDamage = Math.floor(playerDamage * 1.5);
            
            // Вернуть обычный урон через 10 секунд
            setTimeout(() => {
                playerDamage = originalDamage;
                showSystemMessage("Эффект Берсерка закончился", 'info');
            }, 10000);
            
            showSystemMessage("Берсерк активирован! Урон увеличен на 50%", 'skill');
            break;
            
        case 2: // Регенерация
            let healTicks = 0;
            const regenInterval = setInterval(() => {
                if (healTicks < 5 && battleInProgress) {
                    playerCurrentHealth = Math.min(playerMaxHealth, playerCurrentHealth + 5);
                    updateHealthBars();
                    healTicks++;
                } else {
                    clearInterval(regenInterval);
                    showSystemMessage("Эффект Регенерации закончился", 'info');
                }
            }, 1000);
            
            showSystemMessage("Регенерация активирована! +5 здоровья каждую секунду", 'skill');
            break;
            
        case 3: // Уклонение
            let dodgeActive = true;
            setTimeout(() => {
                dodgeActive = false;
                showSystemMessage("Эффект Уклонения закончился", 'info');
            }, 3000);
            
            // Переопределение функции атаки врага для добавления шанса уклонения
            const originalEnemyAttack = enemyAttack;
            enemyAttack = function() {
                if (battleInProgress) {
                    if (dodgeActive && Math.random() < 0.7) {
                        showSystemMessage("Вы уклонились от атаки!", 'success');
                        return; // Пропустить атаку
                    }
                    
                    // Вызвать оригинальную функцию атаки
                    originalEnemyAttack();
                }
            };
            
            // Вернуть оригинальную функцию атаки через 3 секунды
            setTimeout(() => {
                enemyAttack = originalEnemyAttack;
            }, 3000);
            
            showSystemMessage("Уклонение активировано! 70% шанс уклониться от атаки", 'skill');
            break;
    }
    
    // Обновить время последнего использования
    skill.lastUsed = currentTime;
    
    // Обновить отображение
    updateSkillsDisplay();
    
    return true;
}

// Обновление отображения навыков
function updateSkillsDisplay() {
    const skillsElement = document.getElementById('skills-list');
    
    if (skillsElement) {
        skillsElement.innerHTML = '';
        
        playerSkills.forEach(skill => {
            const skillElement = document.createElement('div');
            skillElement.className = `skill-item ${skill.unlocked ? 'unlocked' : 'locked'}`;
            
            // Вычисление оставшегося времени перезарядки
            const currentTime = Date.now() / 1000;
            const cooldownRemaining = skill.cooldown - (currentTime - skill.lastUsed);
            const isOnCooldown = cooldownRemaining > 0 && skill.unlocked;
            
            // Создание иконки навыка
            const iconElement = document.createElement('div');
            iconElement.className = 'skill-icon';
            if (skill.icon) {
                iconElement.style.backgroundImage = `url(${skill.icon})`;
            }
            
            // Добавление оверлея перезарядки, если навык на перезарядке
            if (isOnCooldown) {
                const cooldownOverlay = document.createElement('div');
                cooldownOverlay.className = 'cooldown-overlay';
                cooldownOverlay.style.height = `${(cooldownRemaining / skill.cooldown) * 100}%`;
                iconElement.appendChild(cooldownOverlay);
                
                const cooldownText = document.createElement('div');
                cooldownText.className = 'cooldown-text';
                cooldownText.textContent = Math.ceil(cooldownRemaining);
                iconElement.appendChild(cooldownText);
            }
            
            // Создание информации о навыке
            const infoElement = document.createElement('div');
            infoElement.className = 'skill-info';
            infoElement.innerHTML = `
                <div class="skill-name">${skill.name}</div>
                <div class="skill-description">${skill.description}</div>
                <div class="skill-cooldown">Перезарядка: ${skill.cooldown} сек</div>
            `;
            
            // Создание кнопки использования/разблокировки
            const actionButton = document.createElement('button');
            
            if (!skill.unlocked) {
                actionButton.className = 'skill-unlock-btn';
                actionButton.textContent = 'Разблокировать';
                actionButton.disabled = playerSkillPoints <= 0;
                actionButton.addEventListener('click', () => {
                    if (unlockSkill(skill.id)) {
                        showSystemMessage(`Навык "${skill.name}" разблокирован!`, 'success');
                    }
                });
            } else {
                actionButton.className = 'skill-use-btn';
                actionButton.textContent = 'Использовать';
                actionButton.disabled = isOnCooldown || !battleInProgress;
                actionButton.addEventListener('click', () => {
                    if (useSkill(skill.id)) {
                        // Успешное использование
                    } else if (isOnCooldown) {
                        showSystemMessage(`Навык "${skill.name}" еще перезаряжается`, 'error');
                    } else if (!battleInProgress) {
                        showSystemMessage("Навык можно использовать только в бою", 'error');
                    }
                });
            }
            
            // Добавление всех элементов
            skillElement.appendChild(iconElement);
            skillElement.appendChild(infoElement);
            skillElement.appendChild(actionButton);
            
            skillsElement.appendChild(skillElement);
        });
    }
}

// Система ежедневных наград
let dailyRewards = {
    lastClaimed: 0, // Timestamp последнего получения
    streak: 0, // Текущая серия дней
    rewards: [
        { day: 1, gold: 10, xp: 5 },
        { day: 2, gold: 20, xp: 10 },
        { day: 3, gold: 30, xp: 15 },
        { day: 4, gold: 40, xp: 20 },
        { day: 5, gold: 50, xp: 25 },
        { day: 6, gold: 60, xp: 30 },
        { day: 7, gold: 100, xp: 50, item: {
            name: "Сундук героя",
            description: "Содержит ценный предмет",
            type: "chest",
            rarity: "rare",
            icon: "hero_chest.png"
        }}
    ]
};

// Проверка доступности ежедневной награды
function checkDailyReward() {
    const now = Date.now();
    const lastClaimDate = new Date(dailyRewards.lastClaimed);
    const today = new Date();
    
    // Сбросить до начала дня
    lastClaimDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    // Разница в днях
    const diffTime = today - lastClaimDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 1) {
        // Если прошел ровно 1 день, увеличиваем серию
        if (diffDays === 1) {
            dailyRewards.streak = (dailyRewards.streak % 7) + 1;
        } else {
            // Если пропустили день, начинаем серию сначала
            dailyRewards.streak = 1;
        }
        
        return true;
    }
    
    return false;
}

// Получение ежедневной награды
function claimDailyReward() {
    if (!checkDailyReward()) {
        return false;
    }
    
    const reward = dailyRewards.rewards[dailyRewards.streak - 1];
    
    // Выдача наград
    if (reward.gold) {
        playerInventory.gold += reward.gold;
    }
    
    if (reward.xp) {
        addXP(reward.xp);
    }
    
    if (reward.item) {
        addItemToInventory({...reward.item});
    }
    
    // Обновление времени последнего получения
    dailyRewards.lastClaimed = Date.now();
    
    // Обновление интерфейса
    updateInventoryDisplay();
    updateDailyRewardDisplay();
    
    showSystemMessage(`Получена ежедневная награда за день ${dailyRewards.streak}!`, 'success');
    
    return true;
}

// Обновление отображения ежедневных наград
function updateDailyRewardDisplay() {
    const dailyRewardElement = document.getElementById('daily-reward');
    
    if (dailyRewardElement) {
        const canClaim = checkDailyReward();
        
        dailyRewardElement.innerHTML = '';
        
        // Создание заголовка
        const titleElement = document.createElement('div');
        titleElement.className = 'reward-title';
        titleElement.textContent = 'Ежедневная награда';
        
        // Создание информации о серии
        const streakElement = document.createElement('div');
        streakElement.className = 'reward-streak';
        streakElement.textContent = `Текущая серия: ${dailyRewards.streak}/7`;
        
        // Создание контейнера для наград по дням
        const daysContainer = document.createElement('div');
        daysContainer.className = 'reward-days-container';
        
        // Добавление дней
        dailyRewards.rewards.forEach((reward, index) => {
            const dayElement = document.createElement('div');
            dayElement.className = `reward-day ${index + 1 <= dailyRewards.streak ? 'claimed' : ''} ${index + 1 === dailyRewards.streak && canClaim ? 'current' : ''}`;
            
            dayElement.innerHTML = `
                <div class="day-number">День ${index + 1}</div>
                <div class="day-rewards">
                    ${reward.gold ? `<div>${reward.gold} золота</div>` : ''}
                    ${reward.xp ? `<div>${reward.xp} опыта</div>` : ''}
                    ${reward.item ? `<div>${reward.item.name}</div>` : ''}
                </div>
            `;
            
            daysContainer.appendChild(dayElement);
        });
        
        // Создание кнопки получения
        const claimButton = document.createElement('button');
        claimButton.className = 'reward-claim-btn';
        claimButton.textContent = 'Получить награду';
        claimButton.disabled = !canClaim;
        claimButton.addEventListener('click', claimDailyReward);
        
        // Добавление всех элементов
        dailyRewardElement.appendChild(titleElement);
        dailyRewardElement.appendChild(streakElement);
        dailyRewardElement.appendChild(daysContainer);
        dailyRewardElement.appendChild(claimButton);
    }
}

// Сохранение и загрузка прогресса
function saveGameProgress() {
    const gameData = {
        player: {
            level: playerLevel,
            xp: playerXP,
            xpToNextLevel: playerXPToNextLevel,
            maxHealth: playerMaxHealth,
            baseDamage: playerBaseDamage,
            skillPoints: playerSkillPoints
        },
        inventory: playerInventory,
        equipment: playerEquipment,
        quests: questsData,
        achievements: {
            data: achievementsData,
            counters: achievementCounters
        },
        skills: playerSkills,
        dailyRewards: dailyRewards
    };
    
    // Сохранение в localStorage
    localStorage.setItem('battleGameProgress', JSON.stringify(gameData));
    
    return true;
}

// Загрузка прогресса
function loadGameProgress() {
    const savedData = localStorage.getItem('battleGameProgress');
    
    if (!savedData) {
        return false;
    }
    
    try {
        const gameData = JSON.parse(savedData);
        
        // Загрузка данных игрока
        if (gameData.player) {
            playerLevel = gameData.player.level || 1;
            playerXP = gameData.player.xp || 0;
            playerXPToNextLevel = gameData.player.xpToNextLevel || 100;
            playerMaxHealth = gameData.player.maxHealth || 100;
            playerCurrentHealth = playerMaxHealth;
            playerBaseDamage = gameData.player.baseDamage || 5;
            playerDamage = playerBaseDamage;
            playerSkillPoints = gameData.player.skillPoints || 0;
        }
        
        // Загрузка инвентаря
        if (gameData.inventory) {
            playerInventory = gameData.inventory;
        }
        
        // Загрузка экипировки
        if (gameData.equipment) {
            playerEquipment = gameData.equipment;
            applyEquipmentBonuses();
        }
        
        // Загрузка заданий
        if (gameData.quests) {
            questsData = gameData.quests;
            activeQuests = questsData.filter(q => q.active && !q.completed);
        }
        
        // Загрузка достижений
        if (gameData.achievements) {
            if (gameData.achievements.data) {
                achievementsData = gameData.achievements.data;
            }
            if (gameData.achievements.counters) {
                achievementCounters = gameData.achievements.counters;
            }
        }
        
        // Загрузка навыков
        if (gameData.skills) {
            playerSkills = gameData.skills;
        }
        
        // Загрузка ежедневных наград
        if (gameData.dailyRewards) {
            dailyRewards = gameData.dailyRewards;
        }
        
        // Обновление интерфейса
        updateHealthBars();
        updatePlayerStats();
        updateInventoryDisplay();
        updateQuestsDisplay();
        updateAchievementsDisplay();
        updateSkillsDisplay();
        updateDailyRewardDisplay();
        
        return true;
    } catch (error) {
        console.error("Error loading game progress:", error);
        return false;
    }
}

// Автоматическое сохранение каждые 5 минут
setInterval(saveGameProgress, 5 * 60 * 1000);

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Загрузка сохраненного прогресса
    if (!loadGameProgress()) {
        // Если нет сохранения, инициализируем новую игру
        updateHealthBars();
        updatePlayerStats();
        updateInventoryDisplay();
        updateQuestsDisplay();
        updateAchievementsDisplay();
        updateSkillsDisplay();
        updateDailyRewardDisplay();
    }
    
    // Проверка ежедневной награды
    if (checkDailyReward()) {
        showSystemMessage("Доступна ежедневная награда!", 'info');
    }
});
// Система уровней сложности
let difficultyLevels = [
    { name: "Легкий", playerMultiplier: 1.2, enemyMultiplier: 0.8 },
    { name: "Нормальный", playerMultiplier: 1.0, enemyMultiplier: 1.0 },
    { name: "Сложный", playerMultiplier: 0.8, enemyMultiplier: 1.2 }
];

let currentDifficulty = 1; // Индекс текущей сложности (по умолчанию "Нормальный")

// Изменение уровня сложности
function changeDifficulty(difficultyIndex) {
    if (difficultyIndex < 0 || difficultyIndex >= difficultyLevels.length) {
        return false;
    }
    
    currentDifficulty = difficultyIndex;
    
    // Применение множителей к текущим характеристикам
    const difficulty = difficultyLevels[currentDifficulty];
    
    // Обновление урона игрока с учетом сложности
    playerDamage = Math.floor(playerBaseDamage * difficulty.playerMultiplier);
    
    // Обновление количества исцеления
    healAmount = Math.floor(healBaseAmount * difficulty.playerMultiplier);
    
    // Обновление интерфейса
    updateDifficultyDisplay();
    
    return true;
}

// Обновление отображения уровня сложности
function updateDifficultyDisplay() {
    const difficultySelector = document.getElementById('difficulty-selector');
    
    if (difficultySelector) {
        difficultySelector.innerHTML = '';
        
        difficultyLevels.forEach((difficulty, index) => {
            const option = document.createElement('div');
            option.className = `difficulty-option ${index === currentDifficulty ? 'selected' : ''}`;
            option.textContent = difficulty.name;
            option.addEventListener('click', () => {
                changeDifficulty(index);
            });
            
            difficultySelector.appendChild(option);
        });
    }
}

// Система всплывающих подсказок
function showTooltip(element, text) {
    // Создаем элемент подсказки
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    
    // Позиционирование подсказки
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.bottom + 5) + 'px';
    
    // Добавляем подсказку в документ
    document.body.appendChild(tooltip);
    
    // Функция для удаления подсказки
    function removeTooltip() {
        if (document.body.contains(tooltip)) {
            document.body.removeChild(tooltip);
        }
        element.removeEventListener('mouseleave', removeTooltip);
        element.removeEventListener('click', removeTooltip);
    }
    
    // Добавляем обработчики событий для удаления подсказки
    element.addEventListener('mouseleave', removeTooltip);
    element.addEventListener('click', removeTooltip);
}

// Добавление подсказок к элементам интерфейса
function initializeTooltips() {
    // Подсказки для кнопок боя
    const healButton = document.getElementById('heal-btn');
    if (healButton) {
        healButton.addEventListener('mouseenter', () => {
            showTooltip(healButton, `Восстанавливает ${healAmount} здоровья. Перезарядка: 3 секунды.`);
        });
    }
    
    const specialButton = document.getElementById('special-btn');
    if (specialButton) {
        specialButton.addEventListener('mouseenter', () => {
            showTooltip(specialButton, `Наносит ${playerDamage * 2} урона. Перезарядка: 5 секунд.`);
        });
    }
    
    // Подсказки для статистики игрока
    const playerLevelElement = document.getElementById('player-level');
    if (playerLevelElement) {
        playerLevelElement.addEventListener('mouseenter', () => {
            showTooltip(playerLevelElement, `При повышении уровня вы получаете: +10 к максимальному здоровью, +1 к базовому урону и 3 очка навыков.`);
        });
    }
    
    // Подсказки для предметов в инвентаре
    document.querySelectorAll('.inventory-item').forEach(item => {
        const index = parseInt(item.dataset.index);
        if (index >= 0 && index < playerInventory.items.length) {
            const itemData = playerInventory.items[index];
            item.addEventListener('mouseenter', () => {
                showTooltip(item, itemData.description);
            });
        }
    });
}

// Система звуковых эффектов
let soundEnabled = true;
const sounds = {
    attack: new Audio('sounds/attack.mp3'),
    enemyAttack: new Audio('sounds/enemy_attack.mp3'),
    heal: new Audio('sounds/heal.mp3'),
    victory: new Audio('sounds/victory.mp3'),
    defeat: new Audio('sounds/defeat.mp3'),
    levelUp: new Audio('sounds/level_up.mp3'),
    button: new Audio('sounds/button_click.mp3')
};

// Воспроизведение звука
function playSound(soundName) {
    if (soundEnabled && sounds[soundName]) {
        sounds[soundName].currentTime = 0;
        sounds[soundName].play().catch(e => console.error("Error playing sound:", e));
    }
}

// Включение/выключение звука
function toggleSound() {
    soundEnabled = !soundEnabled;
    
    // Обновление кнопки звука
    const soundButton = document.getElementById('sound-toggle');
    if (soundButton) {
        soundButton.className = soundEnabled ? 'sound-on' : 'sound-off';
        soundButton.title = soundEnabled ? 'Выключить звук' : 'Включить звук';
    }
}

// Инициализация звуковых элементов управления
function initializeSoundControls() {
    const soundButton = document.getElementById('sound-toggle');
    if (soundButton) {
        soundButton.className = soundEnabled ? 'sound-on' : 'sound-off';
        soundButton.title = soundEnabled ? 'Выключить звук' : 'Включить звук';
        soundButton.addEventListener('click', toggleSound);
    }
}

// Модифицируем функции для воспроизведения звуков
const originalAttackEnemy = attackEnemy;
attackEnemy = function() {
    const result = originalAttackEnemy.apply(this, arguments);
    playSound('attack');
    return result;
};

const originalEnemyAttack = enemyAttack;
enemyAttack = function() {
    const result = originalEnemyAttack.apply(this, arguments);
    playSound('enemyAttack');
    return result;
};

const originalHealPlayer = healPlayer;
healPlayer = function() {
    const result = originalHealPlayer.apply(this, arguments);
    if (result !== false) {
        playSound('heal');
    }
    return result;
};

const originalEndBattle = endBattle;
endBattle = function(playerWon) {
    const result = originalEndBattle.apply(this, arguments);
    playSound(playerWon ? 'victory' : 'defeat');
    return result;
};

// Система анимаций
function animateElement(element, animationClass, duration = 1000) {
    if (element) {
        element.classList.add(animationClass);
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, duration);
    }
}

// Анимация текста урона
function showDamageText(target, amount, isCritical = false) {
    if (!battleArea) return;
    
    // Создание элемента текста урона
    const damageText = document.createElement('div');
    damageText.className = `damage-text ${isCritical ? 'critical' : ''}`;
    damageText.textContent = isCritical ? `${amount} КРИТ!` : amount;
    
    // Случайное смещение для текста
    const randomOffsetX = (Math.random() - 0.5) * 40;
    
    // Позиционирование текста
    const targetRect = target.getBoundingClientRect();
    const battleRect = battleArea.getBoundingClientRect();
    
    damageText.style.left = `${targetRect.left - battleRect.left + targetRect.width / 2 + randomOffsetX}px`;
    damageText.style.top = `${targetRect.top - battleRect.top + targetRect.height / 3}px`;
    
    // Добавление текста на поле боя
    battleArea.appendChild(damageText);
    
    // Удаление текста после анимации
    setTimeout(() => {
        if (battleArea.contains(damageText)) {
            battleArea.removeChild(damageText);
        }
    }, 1000);
}

// Модифицируем функции для добавления анимаций
const originalAttackEnemyWithAnimation = attackEnemy;
attackEnemy = function() {
    if (battleInProgress) {
        // Рассчитать урон с небольшой случайностью
        let damage = Math.max(1, Math.floor(playerDamage * (0.8 + Math.random() * 0.4)));
        
        // Шанс критического удара (10%)
        const isCritical = Math.random() < 0.1;
        if (isCritical) {
            damage = Math.floor(damage * 1.5);
        }
        
        // Применить урон к врагу
        enemyCurrentHealth = Math.max(0, enemyCurrentHealth - damage);
        
        // Обновить интерфейс
        updateHealthBars();
        updateBattleMessage(`Вы наносите врагу ${isCritical ? 'критический удар на ' : ''}${damage} урона!`);
        
        // Показать анимацию текста урона
        if (enemyImage) {
            showDamageText(enemyImage, damage, isCritical);
        }
        
        // Применить анимацию урона к врагу
        if (enemyImage) {
            enemyImage.classList.add(isCritical ? 'critical-damage-animation' : 'damage-animation');
            setTimeout(() => {
                enemyImage.classList.remove('damage-animation');
                enemyImage.classList.remove('critical-damage-animation');
            }, 500);
        }
        
        // Проверить, побежден ли враг
        if (enemyCurrentHealth <= 0) {
            endBattle(true);
        }
    }
};

const originalEnemyAttackWithAnimation = enemyAttack;
enemyAttack = function() {
    if (battleInProgress) {
        // Рассчитать урон с небольшой случайностью
        let damage = Math.max(1, Math.floor(enemyDamage * (0.8 + Math.random() * 0.4)));
        
        // Применить урон к игроку
        playerCurrentHealth = Math.max(0, playerCurrentHealth - damage);
        
        // Обновить интерфейс
        updateHealthBars();
        updateBattleMessage(`Враг наносит вам ${damage} урона!`);
        
        // Показать анимацию текста урона на игроке
        const playerElement = document.querySelector('.player-section');
        if (playerElement) {
            showDamageText(playerElement, damage);
        }
        
        // Анимация получения урона для всего интерфейса
        const gameContainer = document.querySelector('.container');
        if (gameContainer) {
            animateElement(gameContainer, 'damage-flash', 300);
        }
        
        // Проверить, побежден ли игрок
        if (playerCurrentHealth <= 0) {
            endBattle(false);
        }
    }
};

// Функции для работы с мобильными устройствами
function initializeMobileSupport() {
    // Определение, является ли устройство мобильным
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Добавление класса к body для адаптации стилей
        document.body.classList.add('mobile');
        
        // Настройка интерфейса для сенсорных экранов
        const touchElements = document.querySelectorAll('.clickable');
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            element.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            });
        });
    }
}

// Система обучения (туториал)
let tutorialSteps = [
    {
        id: 1,
        title: "Добро пожаловать в игру!",
        message: "Это боевая система, где вы сражаетесь с различными врагами.",
        target: ".container",
        position: "center"
    },
    {
        id: 2,
        title: "Атака",
        message: "Нажмите на врага, чтобы атаковать его.",
        target: ".enemy-image",
        position: "bottom"
    },
    {
        id: 3,
        title: "Здоровье",
        message: "Это ваша полоса здоровья. Если она опустеет, вы проиграете.",
        target: ".player-health-fill",
        position: "top"
    },
    {
        id: 4,
        title: "Исцеление",
        message: "Собирайте зеленые сферы, появляющиеся во время боя, чтобы восстановить здоровье.",
        target: ".healing-orb",
        position: "right"
    },
    {
        id: 5,
        title: "Победа",
        message: "Уменьшите здоровье врага до нуля, чтобы победить и получить награды!",
        target: ".enemy-health-fill",
        position: "bottom"
    }
];

let currentTutorialStep = 0;
let tutorialActive = false;

// Показать шаг обучения
function showTutorialStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= tutorialSteps.length) {
        endTutorial();
        return;
    }
    
    const step = tutorialSteps[stepIndex];
    currentTutorialStep = stepIndex;
    
    // Создание элементов обучения
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    
    const popup = document.createElement('div');
    popup.className = 'tutorial-popup';
    
    // Определение позиции попапа
    const targetElement = document.querySelector(step.target);
    if (targetElement) {
        const targetRect = targetElement.getBoundingClientRect();
        
        // Подсветка целевого элемента
        const highlight = document.createElement('div');
        highlight.className = 'tutorial-highlight';
        highlight.style.left = `${targetRect.left}px`;
        highlight.style.top = `${targetRect.top}px`;
        highlight.style.width = `${targetRect.width}px`;
        highlight.style.height = `${targetRect.height}px`;
        
        // Позиционирование попапа в зависимости от указанной позиции
        switch (step.position) {
            case 'top':
                popup.style.left = `${targetRect.left + targetRect.width / 2}px`;
                popup.style.top = `${targetRect.top - 10}px`;
                popup.style.transform = 'translate(-50%, -100%)';
                break;
            case 'bottom':
                popup.style.left = `${targetRect.left + targetRect.width / 2}px`;
                popup.style.top = `${targetRect.bottom + 10}px`;
                popup.style.transform = 'translate(-50%, 0)';
                break;
            case 'left':
                popup.style.left = `${targetRect.left - 10}px`;
                popup.style.top = `${targetRect.top + targetRect.height / 2}px`;
                popup.style.transform = 'translate(-100%, -50%)';
                break;
            case 'right':
                popup.style.left = `${targetRect.right + 10}px`;
                popup.style.top = `${targetRect.top + targetRect.height / 2}px`;
                popup.style.transform = 'translate(0, -50%)';
                break;
            case 'center':
            default:
                popup.style.left = '50%';
                popup.style.top = '50%';
                popup.style.transform = 'translate(-50%, -50%)';
        }
        
        document.body.appendChild(highlight);
    } else {
        // Если целевой элемент не найден, отображаем попап по центру
        popup.style.left = '50%';
        popup.style.top = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
    }
    
    // Заполнение попапа
    popup.innerHTML = `
        <div class="tutorial-header">
            <h3>${step.title}</h3>
        </div>
        <div class="tutorial-body">
            <p>${step.message}</p>
        </div>
        <div class="tutorial-footer">
            <button class="tutorial-next-btn">Далее</button>
            <button class="tutorial-skip-btn">Пропустить обучение</button>
        </div>
    `;
    
    // Добавление обработчиков событий
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
    
    const nextButton = popup.querySelector('.tutorial-next-btn');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            clearTutorialElements();
            showTutorialStep(currentTutorialStep + 1);
        });
    }
    
    const skipButton = popup.querySelector('.tutorial-skip-btn');
    if (skipButton) {
        skipButton.addEventListener('click', endTutorial);
    }
}

// Очистка элементов обучения
function clearTutorialElements() {
    const overlay = document.querySelector('.tutorial-overlay');
    const popup = document.querySelector('.tutorial-popup');
    const highlight = document.querySelector('.tutorial-highlight');
    
    if (overlay) document.body.removeChild(overlay);
    if (popup) document.body.removeChild(popup);
    if (highlight) document.body.removeChild(highlight);
}

// Завершение обучения
function endTutorial() {
    clearTutorialElements();
    tutorialActive = false;
    
    // Сохранение информации о прохождении обучения
    localStorage.setItem('tutorialCompleted', 'true');
    
    // Показать сообщение о завершении обучения
    showSystemMessage("Обучение завершено! Теперь вы готовы к бою!", 'success');
}

// Запуск обучения
function startTutorial() {
    if (localStorage.getItem('tutorialCompleted') !== 'true') {
        tutorialActive = true;
        showTutorialStep(0);
    }
}

// Телеграм-интеграция
function initializeTelegramIntegration() {
    if (tg) {
        // Настройка темы
        if (tg.colorScheme) {
            document.body.setAttribute('data-theme', tg.colorScheme);
        }
        
        // Обработка изменения темы
        tg.onEvent('themeChanged', () => {
            document.body.setAttribute('data-theme', tg.colorScheme);
        });
        
        // Кнопка "Поделиться" для отправки результатов в Телеграм
        const shareButton = document.createElement('button');
        shareButton.id = 'telegram-share-btn';
        shareButton.className = 'telegram-share-btn';
        shareButton.textContent = 'Поделиться результатом';
        shareButton.addEventListener('click', shareResult);
        
        // Добавление кнопки на страницу
        const controlsContainer = document.querySelector('.controls-container');
        if (controlsContainer) {
            controlsContainer.appendChild(shareButton);
        }
    }
}

// Функция для отправки результатов в Телеграм
function shareResult() {
    if (tg && tg.sendData) {
        // Формирование данных для отправки
        const resultData = {
            playerLevel: playerLevel,
            playerXP: playerXP,
            killCount: achievementCounters.killCount,
            lastBattleResult: battleRewards.length > 0 ? 'victory' : 'defeat'
        };
        
        // Отправка данных в Телеграм
        tg.sendData(JSON.stringify(resultData));
    }
}

// Инициализация всех функций при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Загрузка сохраненного прогресса
    if (!loadGameProgress()) {
        // Если нет сохранения, инициализируем новую игру
        updateHealthBars();
        updatePlayerStats();
        updateInventoryDisplay();
        updateQuestsDisplay();
        updateAchievementsDisplay();
        updateSkillsDisplay();
        updateDailyRewardDisplay();
        updateDifficultyDisplay();
    }
    
    // Проверка ежедневной награды
    if (checkDailyReward()) {
        showSystemMessage("Доступна ежедневная награда!", 'info');
    }
    
    // Инициализация подсказок
    initializeTooltips();
    
    // Инициализация звукового управления
    initializeSoundControls();
    
    // Инициализация поддержки мобильных устройств
    initializeMobileSupport();
    
    // Запуск обучения для новых игроков
    if (localStorage.getItem('tutorialCompleted') !== 'true') {
        setTimeout(startTutorial, 1000);
    }
    
    // Инициализация интеграции с Телеграм
    initializeTelegramIntegration();
});