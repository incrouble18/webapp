// Initialize Telegram Web App compatibility
let tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
    tg.expand();
}

// DOM Elements
const startBattleButton = document.getElementById('start-battle');
const backToMenuButton = document.getElementById('back-to-menu');
const battleMessages = document.getElementById('battle-messages');
const playerHealth = document.getElementById('player-health');
const enemyHealth = document.getElementById('enemy-health');
const enemyName = document.getElementById('enemy-name');
const enemyLevel = document.getElementById('enemy-level');
const enemyType = document.getElementById('enemy-type');
const enemyCharacter = document.getElementById('enemy-character');
const playerCharacter = document.getElementById('player-character');
const healingOrb = document.getElementById('healing-orb');

// Game variables
let battleInProgress = false;
let playerCurrentHealth = 100;
let enemyCurrentHealth = 100;
let playerMaxHealth = 100;
let enemyMaxHealth = 100;
let currentEnemy = null;
let enemyAttackInterval = null;
let healingOrbInterval = null;
let playerDamage = 10;
let healAmount = 20;
let clickCooldown = false;
let clickCooldownTime = 50; // уменьшенный кулдаун для более быстрых кликов
let battleRewards = [];
let playerDefense = 1; // Базовая защита игрока

// Enemy types - revised with fast attack speeds
const enemies = [
    {
        name: 'Slime',
        type: 'Normal',
        level: 1,
        health: 80,
        attack: 3,
        defense: 1,
        attackSpeed: 300, // 3+ атаки в секунду
        cssClass: 'enemy-slime',
        rewards: {
            xp: 20,
            items: [
                { name: 'Slime Goo', icon: '🧪', chance: 0.7 },
                { name: 'Health Potion', icon: '❤️', chance: 0.3 }
            ]
        }
    },
    {
        name: 'Goblin',
        type: 'Forest',
        level: 2,
        health: 100,
        attack: 4,
        defense: 2,
        attackSpeed: 280, // даже быстрее
        cssClass: 'enemy-goblin',
        rewards: {
            xp: 35,
            items: [
                { name: 'Goblin Dagger', icon: '🗡️', chance: 0.4 },
                { name: 'Gold Coins', icon: '💰', chance: 0.6 }
            ]
        }
    },
    {
        name: 'Ghost',
        type: 'Ethereal',
        level: 3,
        health: 120,
        attack: 5,
        defense: 2,
        attackSpeed: 270, // еще быстрее
        cssClass: 'enemy-ghost',
        rewards: {
            xp: 50,
            items: [
                { name: 'Spectral Essence', icon: '👻', chance: 0.5 },
                { name: 'Magic Scroll', icon: '📜', chance: 0.3 }
            ]
        }
    },
    {
        name: 'Dragon',
        type: 'Fire',
        level: 5,
        health: 200,
        attack: 7,
        defense: 4,
        attackSpeed: 250, // очень быстрые атаки
        cssClass: 'enemy-dragon',
        rewards: {
            xp: 100,
            items: [
                { name: 'Dragon Scale', icon: '🔥', chance: 0.6 },
                { name: 'Fire Crystal', icon: '💎', chance: 0.4 },
                { name: 'Dragon Fang', icon: '🦷', chance: 0.2 }
            ]
        }
    },
    {
        name: 'Dark Lord',
        type: 'Boss',
        level: 10,
        health: 300,
        attack: 10,
        defense: 5,
        attackSpeed: 220, // супер быстрые атаки
        cssClass: 'enemy-boss',
        rewards: {
            xp: 200,
            items: [
                { name: 'Shadow Artifact', icon: '🔮', chance: 0.8 },
                { name: 'Dark Armor', icon: '🛡️', chance: 0.5 },
                { name: 'Legendary Weapon', icon: '⚔️', chance: 0.3 }
            ]
        }
    }
];

// Load user data from localStorage
function loadUserData() {
    const savedData = localStorage.getItem('brainTrainingUserData');
    if (savedData) {
        return JSON.parse(savedData);
    } else {
        // Default user data
        return {
            level: 1,
            xp: 0,
            lives: 5,
            lastPlayed: new Date(),
            stats: {
                intelligence: 10,
                sports: 5,
                languages: 3,
                energy: 8,
                creativity: 7,
                health: 10
            },
            equipment: {
                skin: 'light',
                outfit: 'casual',
                headgear: 'none',
                weapon: 'none'
            },
            pet: {
                unlocked: false
            },
            inventory: []
        };
    }
}

// Save user data to localStorage
function saveUserData(userData) {
    localStorage.setItem('brainTrainingUserData', JSON.stringify(userData));
}

// Update the player character appearance
function updatePlayerAppearance() {
    const userData = loadUserData();
    
    // Apply character customization
    playerCharacter.className = 'character-container';
    
    // Apply skin class
    playerCharacter.classList.add(`skin-${userData.equipment.skin}`);
    
    // Apply outfit class if not none
    if (userData.equipment.outfit !== 'none') {
        playerCharacter.classList.add(`outfit-${userData.equipment.outfit}`);
    }
    
    // Apply headgear class if not none
    if (userData.equipment.headgear !== 'none') {
        playerCharacter.classList.add(`headgear-${userData.equipment.headgear}`);
    }
    
    // Apply weapon class if not none
    if (userData.equipment.weapon !== 'none') {
        playerCharacter.classList.add(`weapon-${userData.equipment.weapon}`);
    }
    
    // Create character visualization layers
    playerCharacter.innerHTML = `
        <div id="player-body" class="char-layer"></div>
        <div id="player-outfit" class="char-layer"></div>
        <div id="player-head" class="char-layer"></div>
        <div id="player-face" class="char-layer">
            <div id="player-mouth"></div>
        </div>
        <div id="player-headgear" class="char-layer"></div>
        <div id="player-weapon" class="char-layer"></div>
    `;
}

// Set up a new enemy
function setupEnemy() {
    // Select enemy based on player level
    const userData = loadUserData();
    const playerLevel = userData.level;
    
    // Filter enemies by level appropriate for player
    const availableEnemies = enemies.filter(enemy => enemy.level <= Math.max(1, playerLevel + 2));
    
    // If no appropriate enemies, use the first one
    if (availableEnemies.length === 0) {
        currentEnemy = {...enemies[0]};
    } else {
        // Randomly select from available enemies
        const randomIndex = Math.floor(Math.random() * availableEnemies.length);
        currentEnemy = {...availableEnemies[randomIndex]};
    }
    
    // Calculate player damage based on player stats and equipment
    calculatePlayerStats(userData);
    
    // Set enemy health
    enemyMaxHealth = currentEnemy.health;
    enemyCurrentHealth = enemyMaxHealth;
    
    // Update UI
    enemyName.textContent = currentEnemy.name;
    enemyLevel.textContent = 'Level: ' + currentEnemy.level;
    enemyType.textContent = 'Type: ' + currentEnemy.type;
    
    // Apply enemy appearance
    enemyCharacter.className = 'enemy-container ' + currentEnemy.cssClass;
    
    // Reset health bars
    playerHealth.style.width = '100%';
    enemyHealth.style.width = '100%';
    
    // Add battle message
    addBattleMessage('system', `A wild ${currentEnemy.name} appears! Click on the enemy to attack!`);
}

// Calculate player stats based on equipment
function calculatePlayerStats(userData) {
    // Base damage from sports stat
    playerDamage = 5 + Math.floor(userData.stats.sports / 2);
    
    // Base defense from health stat
    playerDefense = 1 + Math.floor(userData.stats.health / 5);
    
    // Apply weapon bonuses for damage
    if (userData.equipment.weapon === 'sword') {
        playerDamage += 5;
    } else if (userData.equipment.weapon === 'staff') {
        playerDamage += 3;
        playerDefense += 1;
    } else if (userData.equipment.weapon === 'bow') {
        playerDamage += 4;
    }
    
    // Apply outfit bonuses for defense
    if (userData.equipment.outfit === 'warrior') {
        playerDefense += 3;
        playerDamage += 2;
    } else if (userData.equipment.outfit === 'mage') {
        playerDefense += 1;
        playerDamage += 3;
    } else if (userData.equipment.outfit === 'formal') {
        playerDefense += 2;
    }
    
    // Apply headgear bonuses
    if (userData.equipment.headgear === 'helmet') {
        playerDefense += 2;
    } else if (userData.equipment.headgear === 'crown') {
        playerDamage += 2;
    } else if (userData.equipment.headgear === 'hat') {
        playerDefense += 1;
    }
}

// Add a message to the battle log
function addBattleMessage(type, message) {
    const messageElement = document.createElement('div');
    messageElement.className = `battle-message ${type}-message`;
    messageElement.textContent = message;
    battleMessages.appendChild(messageElement);
    
    // Auto-scroll to bottom
    battleMessages.scrollTop = battleMessages.scrollHeight;
}

// Show damage number animation
function showDamageNumber(target, damage, isHeal = false) {
    const damageElement = document.createElement('div');
    damageElement.className = isHeal ? 'heal-number' : 'damage-number';
    damageElement.textContent = isHeal ? '+' + damage : '-' + damage;
    
    // Position the damage number
    const rect = target.getBoundingClientRect();
    const randomX = Math.random() * rect.width;
    
    damageElement.style.left = randomX + 'px';
    damageElement.style.top = (rect.height / 3) + 'px';
    
    target.appendChild(damageElement);
    
    // Remove the element after animation completes
    setTimeout(() => {
        if (damageElement.parentNode === target) {
            target.removeChild(damageElement);
        }
    }, 1000);
}

// Player attack function - now triggered by clicking on enemy
function playerAttack() {
    if (!battleInProgress || clickCooldown) return;
    
    // Set cooldown to prevent rapid clicking
    clickCooldown = true;
    setTimeout(() => {
        clickCooldown = false;
    }, clickCooldownTime);
    
    // Animate player attack
    playerCharacter.classList.add('attack-animation');
    setTimeout(() => {
        playerCharacter.classList.remove('attack-animation');
    }, 300); // Сокращенное время анимации для более быстрых кликов
    
    // Calculate damage with some randomness
    const randomFactor = 0.8 + Math.random() * 0.4;
    const damage = Math.max(1, Math.floor(playerDamage * randomFactor - (currentEnemy.defense * 0.3)));
    
    // Animate enemy taking damage
    enemyCharacter.classList.add('damaged-animation');
    setTimeout(() => {
        enemyCharacter.classList.remove('damaged-animation');
    }, 300); // Сокращенное время анимации
    
    // Show damage number
    showDamageNumber(enemyCharacter, damage);
    
    // Reduce enemy health
    enemyCurrentHealth = Math.max(0, enemyCurrentHealth - damage);
    const healthPercentage = (enemyCurrentHealth / enemyMaxHealth) * 100;
    enemyHealth.style.width = healthPercentage + '%';
    
    // Change health bar color based on remaining health
    if (healthPercentage < 25) {
        enemyHealth.style.backgroundColor = '#e74c3c';
    } else if (healthPercentage < 50) {
        enemyHealth.style.backgroundColor = '#f39c12';
    }
    
    // Check if enemy is defeated
    if (enemyCurrentHealth <= 0) {
        battleVictory();
    }
}

// Enemy attack function - now automatic based on interval
function enemyAttack() {
    if (!battleInProgress) return;
    
    // Animate enemy attack
    enemyCharacter.classList.add('attack-animation');
    setTimeout(() => {
        enemyCharacter.classList.remove('attack-animation');
    }, 200); // Очень короткое время анимации для быстрых атак
    
    // Calculate damage with some randomness
    const randomFactor = 0.8 + Math.random() * 0.4;
    
    // Учитываем защиту игрока
    const damage = Math.max(1, Math.floor((currentEnemy.attack * randomFactor) - (playerDefense * 0.5)));
    
    // Animate player taking damage
    playerCharacter.classList.add('damaged-animation');
    setTimeout(() => {
        playerCharacter.classList.remove('damaged-animation');
    }, 200); // Короткая анимация для быстрых атак
    
    // Show damage number
    showDamageNumber(playerCharacter, damage);
    
    // Reduce player health
    playerCurrentHealth = Math.max(0, playerCurrentHealth - damage);
    const healthPercentage = (playerCurrentHealth / playerMaxHealth) * 100;
    playerHealth.style.width = healthPercentage + '%';
    
    // Change health bar color based on remaining health
    if (healthPercentage < 25) {
        playerHealth.style.backgroundColor = '#e74c3c';
    } else if (healthPercentage < 50) {
        playerHealth.style.backgroundColor = '#f39c12';
    }
    
    // Check if player is defeated
    if (playerCurrentHealth <= 0) {
        battleDefeat();
    }
}

// Create and show healing orb
function showHealingOrb() {
    if (!battleInProgress) return;
    
    // Random position in the battle container
    const container = document.querySelector('.battle-container');
    const rect = container.getBoundingClientRect();
    
    const randomX = Math.floor(Math.random() * (rect.width - 40));
    const randomY = Math.floor(Math.random() * (rect.height - 40));
    
    healingOrb.style.left = randomX + 'px';
    healingOrb.style.top = randomY + 'px';
    healingOrb.style.display = 'flex';
    healingOrb.style.backgroundColor = '#27ae60'; // Зеленый цвет для шарика
    
    // Auto hide after certain time
    setTimeout(() => {
        if (healingOrb.style.display !== 'none') {
            healingOrb.style.display = 'none';
        }
    }, 2000); // Сокращаем время до 2 секунд
}

// Handle healing orb click
function healPlayer() {
    if (!battleInProgress) return;
    
    // Hide the orb
    healingOrb.style.display = 'none';
    
    // Apply healing
    const healValue = healAmount;
    playerCurrentHealth = Math.min(playerMaxHealth, playerCurrentHealth + healValue);
    
    // Update health bar
    const healthPercentage = (playerCurrentHealth / playerMaxHealth) * 100;
    playerHealth.style.width = healthPercentage + '%';
    
    // Show healing effect
    showDamageNumber(playerCharacter, healValue, true);
    
    // Change health bar color based on remaining health
    if (healthPercentage >= 50) {
        playerHealth.style.backgroundColor = '#27ae60';
    } else if (healthPercentage >= 25) {
        playerHealth.style.backgroundColor = '#f39c12';
    }
}

// Battle victory function
function battleVictory() {
    battleInProgress = false;
    
    // Clear intervals
    clearInterval(enemyAttackInterval);
    clearInterval(healingOrbInterval);
    
    healingOrb.style.display = 'none';
    
    // Add victory message
    addBattleMessage('system', `You defeated the ${currentEnemy.name}!`);
    
    // Calculate rewards
    calculateRewards();
    
    // Update user data
    const userData = loadUserData();
    
    // Add XP
    userData.xp += currentEnemy.rewards.xp;
    
    // Check for level up
    const xpForNextLevel = userData.level * 100;
    if (userData.xp >= xpForNextLevel) {
        userData.level++;
        userData.xp -= xpForNextLevel;
        addBattleMessage('system', `Level up! You are now level ${userData.level}!`);
        
        // Increase a random stat
        const stats = ['intelligence', 'sports', 'languages', 'energy', 'creativity', 'health'];
        const randomStat = stats[Math.floor(Math.random() * stats.length)];
        userData.stats[randomStat] += 1;
        addBattleMessage('system', `Your ${randomStat} increased by 1!`);
    }
    
    // Add items to inventory
    for (const reward of battleRewards) {
        if (!userData.inventory) {
            userData.inventory = [];
        }
        userData.inventory.push({
            name: reward.name,
            icon: reward.icon,
            type: 'item',
            quantity: 1
        });
    }
    
    saveUserData(userData);
    
    // Re-enable start battle button
    startBattleButton.disabled = false;
    startBattleButton.textContent = 'Start New Battle';
}

// Calculate and display battle rewards
function calculateRewards() {
    battleRewards = [];
    const rewards = currentEnemy.rewards;
    
    // Add XP reward message
    addBattleMessage('reward', `🏆 Gained ${rewards.xp} XP`);
    
    // Calculate item drops based on chances
    for (const item of rewards.items) {
        if (Math.random() < item.chance) {
            battleRewards.push({
                name: item.name,
                icon: item.icon
            });
            
            // Add item reward message
            addBattleMessage('reward', `${item.icon} Found ${item.name}`);
        }
    }
    
    // 10% шанс получить случайное оружие
    if (Math.random() < 0.1) {
        const weapons = ['sword', 'staff', 'bow'];
        const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];
        const weaponIcons = {'sword': '🗡️', 'staff': '🔮', 'bow': '🏹'};
        
        battleRewards.push({
            name: `${randomWeapon.charAt(0).toUpperCase() + randomWeapon.slice(1)}`,
            icon: weaponIcons[randomWeapon],
            type: 'weapon'
        });
        
        addBattleMessage('reward', `${weaponIcons[randomWeapon]} Rare weapon found: ${randomWeapon.charAt(0).toUpperCase() + randomWeapon.slice(1)}!`);
    }
}

// Battle defeat function
function battleDefeat() {
    battleInProgress = false;
    
    // Clear intervals
    clearInterval(enemyAttackInterval);
    clearInterval(healingOrbInterval);
    
    healingOrb.style.display = 'none';
    
    // Add defeat message
    addBattleMessage('system', `You were defeated by the ${currentEnemy.name}!`);
    
    // Reduce a life
    const userData = loadUserData();
    if (userData.lives > 0) {
        userData.lives -= 1;
        addBattleMessage('system', `You lost a life! Lives remaining: ${userData.lives}`);
    }
    saveUserData(userData);
    
    // Re-enable start battle button
    startBattleButton.disabled = false;
    startBattleButton.textContent = 'Try Again';
}

// Start battle function
function startBattle() {
    if (battleInProgress) return;
    
    // Check if player has lives
    const userData = loadUserData();
    if (userData.lives <= 0) {
        addBattleMessage('system', 'You have no lives left! Come back tomorrow or earn more lives by completing challenges.');
        return;
    }
    
    // Reset battle state
    battleInProgress = true;
    playerCurrentHealth = playerMaxHealth;
    battleMessages.innerHTML = '';
    battleRewards = [];
    
    // Set up a new enemy
    setupEnemy();
    
    // Start enemy attack interval (очень быстрые атаки)
    enemyAttackInterval = setInterval(enemyAttack, currentEnemy.attackSpeed);
    
    // Start healing orb interval (каждые 4-8 секунд)
    healingOrbInterval = setInterval(showHealingOrb, 4000 + Math.random() * 4000);
    
    // Disable start button
    startBattleButton.disabled = true;
}

// Event Listeners
enemyCharacter.addEventListener('click', playerAttack);
healingOrb.addEventListener('click', healPlayer);
startBattleButton.addEventListener('click', startBattle);

// Back to menu button event listener
backToMenuButton.addEventListener('click', function() {
    if (enemyAttackInterval) {
        clearInterval(enemyAttackInterval);
    }
    if (healingOrbInterval) {
        clearInterval(healingOrbInterval);
    }
    window.location.href = 'index.html';
});

// Handle icon clicks for navigation
document.querySelectorAll('.icon').forEach(icon => {
    icon.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        if (action === 'games') {
            window.location.href = 'index.html';
        } else if (action === 'stats') {
            window.location.href = 'stats.html';
        } else if (action === 'room') {
            window.location.href = 'room.html';
        } else if (action === 'inventory') {
            alert('Inventory is coming soon! 🎒');
        } else if (action === 'battle') {
            // Already on battle page
        }
    });
});

// Initialize the page
window.onload = function() {
    updatePlayerAppearance();
    
    // Load theme preference
    const savedTheme = localStorage.getItem("preferred-theme");
    if (savedTheme) {
        document.body.className = savedTheme + "-theme";
    } else {
        document.body.className = "colorful-theme";
    }
};