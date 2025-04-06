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
const attackButtons = document.querySelectorAll('.attack-button');
const playerCharacter = document.getElementById('player-character');
const playerPet = document.querySelector('.player-pet');

// Game variables
let battleInProgress = false;
let playerCurrentHealth = 100;
let enemyCurrentHealth = 100;
let playerMaxHealth = 100;
let enemyMaxHealth = 100;
let currentEnemy = null;
let playerTurn = true;
let battleTimeout = null;
let specialMoveAvailable = true;

// Enemy types
const enemies = [
    {
        name: 'Slime',
        type: 'Normal',
        level: 1,
        health: 80,
        attack: 10,
        defense: 5,
        moves: ['Bounce', 'Splash', 'Vibrate'],
        cssClass: 'enemy-slime'
    },
    {
        name: 'Goblin',
        type: 'Forest',
        level: 2,
        health: 100,
        attack: 15,
        defense: 10,
        moves: ['Slash', 'Poke', 'Giggle'],
        cssClass: 'enemy-goblin'
    },
    {
        name: 'Ghost',
        type: 'Ethereal',
        level: 3,
        health: 120,
        attack: 20,
        defense: 15,
        moves: ['Haunt', 'Spook', 'Wail'],
        cssClass: 'enemy-ghost'
    },
    {
        name: 'Dragon',
        type: 'Fire',
        level: 5,
        health: 200,
        attack: 30,
        defense: 25,
        moves: ['Flame', 'Tail Whip', 'Roar'],
        cssClass: 'enemy-dragon'
    },
    {
        name: 'Dark Lord',
        type: 'Boss',
        level: 10,
        health: 300,
        attack: 40,
        defense: 30,
        moves: ['Shadow Strike', 'Dark Pulse', 'Nightmare'],
        cssClass: 'enemy-boss'
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
            }
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
    
    // Show pet if unlocked
    if (userData.pet && userData.pet.unlocked) {
        playerPet.style.display = 'block';
        
        // Apply pet styling
        const petBase = document.getElementById('player-pet');
        petBase.className = 'pet-container';
        petBase.classList.add(`pet-type-${userData.pet.type}`);
        petBase.classList.add(`pet-color-${userData.pet.color}`);
        
        if (userData.pet.accessory !== 'none') {
            petBase.classList.add(`pet-accessory-${userData.pet.accessory}`);
        }
    } else {
        playerPet.style.display = 'none';
    }
    
    // Apply CSS for character visualization
    applyCharacterStyles();
}

// Apply CSS styles for character visualization
function applyCharacterStyles() {
    // Similar to the character styles in stats.js
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Base character components */
        #player-body {
            background-color: #4a90e2;
            clip-path: polygon(40% 40%, 60% 40%, 65% 90%, 35% 90%);
        }
        
        #player-head {
            background-color: #ffcc99;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            position: absolute;
            top: 15px;
            left: 50%;
            transform: translateX(-50%);
        }
        
        #player-face {
            position: absolute;
            top: 15px;
            left: 0;
            right: 0;
            height: 50px;
        }
        
        #player-face::before, #player-face::after {
            content: '';
            position: absolute;
            width: 8px;
            height: 8px;
            background-color: #333;
            border-radius: 50%;
            top: 25px;
        }
        
        #player-face::before {
            left: calc(50% - 15px);
        }
        
        #player-face::after {
            right: calc(50% - 15px);
        }
        
        #player-mouth {
            content: '';
            position: absolute;
            width: 12px;
            height: 6px;
            border-bottom: 2px solid #333;
            border-radius: 50%;
            top: 40px;
            left: 50%;
            transform: translateX(-50%);
        }
        
        /* Character color variations */
        .skin-light #player-head {
            background-color: #ffcc99;
        }
        
        .skin-medium #player-head {
            background-color: #e6b27f;
        }
        
        .skin-dark #player-head {
            background-color: #9e6c45;
        }
        
        .skin-fantasy #player-head {
            background-color: #a3e4d7;
        }
        
        /* Outfit variations */
        .outfit-casual #player-outfit {
            background-color: #5cb85c;
            clip-path: polygon(38% 42%, 62% 42%, 68% 91%, 32% 91%);
        }
        
        .outfit-formal #player-outfit {
            background-color: #333333;
            clip-path: polygon(38% 42%, 62% 42%, 68% 91%, 32% 91%);
        }
        
        .outfit-warrior #player-outfit {
            background-color: #8B4513;
            clip-path: polygon(38% 42%, 62% 42%, 70% 91%, 30% 91%);
        }
        
        .outfit-mage #player-outfit {
            background-color: #7B68EE;
            clip-path: polygon(35% 42%, 65% 42%, 75% 91%, 25% 91%);
        }
        
        /* Headgear variations */
        .headgear-hat #player-headgear {
            background-color: #f0ad4e;
            clip-path: polygon(35% 15%, 65% 15%, 60% 30%, 40% 30%);
        }
        
        .headgear-crown #player-headgear {
            background-color: #FFD700;
            clip-path: polygon(40% 15%, 45% 5%, 50% 15%, 55% 5%, 60% 15%);
        }
        
        .headgear-helmet #player-headgear {
            background-color: #C0C0C0;
            clip-path: polygon(35% 15%, 65% 15%, 60% 35%, 40% 35%);
        }
        
        /* Weapon variations */
        .weapon-sword #player-weapon {
            background-color: #C0C0C0;
            clip-path: polygon(70% 45%, 75% 45%, 75% 95%, 70% 95%);
        }
        
        .weapon-staff #player-weapon {
            background-color: #8B4513;
            clip-path: polygon(20% 20%, 22% 20%, 22% 95%, 20% 95%);
        }
        
        .weapon-bow #player-weapon {
            border: 2px solid #8B4513;
            border-radius: 50%;
            width: 30px;
            height: 60px;
            position: absolute;
            top: 50%;
            left: 80%;
            transform: translate(-50%, -50%);
        }
        
        /* Pet styles */
        .pet-container {
            position: relative;
            width: 60px;
            height: 60px;
            margin: 0 auto;
        }
        
        .pet-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        
        /* Pet types */
        .pet-type-cat #pet-body {
            background-color: #f39c12;
            clip-path: ellipse(40% 45% at 50% 50%);
        }
        
        .pet-type-cat #pet-head {
            background-color: #f39c12;
            clip-path: circle(30% at 50% 30%);
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Set up a new enemy
function setupEnemy() {
    // Select enemy based on player level
    const userData = loadUserData();
    const playerLevel = userData.level;
    
    // Filter enemies by level appropriate for player
    const availableEnemies = enemies.filter(enemy => enemy.level <= playerLevel);
    
    // If no appropriate enemies, use the first one
    if (availableEnemies.length === 0) {
        currentEnemy = {...enemies[0]};
    } else {
        // Randomly select from available enemies
        const randomIndex = Math.floor(Math.random() * availableEnemies.length);
        currentEnemy = {...availableEnemies[randomIndex]};
    }
    
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
    
    // Enable attack buttons
    attackButtons.forEach(button => {
        button.disabled = false;
    });
    
    // Add battle message
    addBattleMessage('system', `A wild ${currentEnemy.name} appears!`);
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

// Calculate attack damage
function calculateDamage(attacker, defender, moveType) {
    let baseDamage = attacker.attack;
    const defense = defender.defense;
    
    // Adjust based on move type
    switch (moveType) {
        case 'quick':
            // Quick attacks have high hit chance but lower damage
            baseDamage = Math.max(5, baseDamage * 0.7);
            break;
        case 'heavy':
            // Heavy attacks have lower hit chance but higher damage
            if (Math.random() > 0.3) { // 70% hit chance
                baseDamage = baseDamage * 1.5;
            } else {
                addBattleMessage('system', 'The attack missed!');
                return 0;
            }
            break;
        case 'special':
            // Special attacks are powerful but limited use
            baseDamage = baseDamage * 2;
            break;
        case 'defend':
            // Defend reduces incoming damage next turn
            return 0;
    }
    
    // Apply randomness factor (±20%)
    const randomFactor = 0.8 + Math.random() * 0.4;
    baseDamage *= randomFactor;
    
    // Apply defense reduction
    let finalDamage = Math.max(1, Math.floor(baseDamage - (defense * 0.5)));
    
    return finalDamage;
}

// Player attack function
function playerAttack(moveType) {
    if (!battleInProgress) return;
    
    // Disable buttons during attack animation
    attackButtons.forEach(button => {
        button.disabled = true;
    });
    
    // Get user data for stat-based bonuses
    const userData = loadUserData();
    
    // Create player stats object based on user data
    const playerStats = {
        attack: 10 + Math.floor(userData.stats.sports / 2),
        defense: 5 + Math.floor(userData.stats.health / 3),
        intelligence: userData.stats.intelligence,
        creativity: userData.stats.creativity
    };
    
    // Apply weapon bonuses
    if (userData.equipment.weapon === 'sword') {
        playerStats.attack += 5;
    } else if (userData.equipment.weapon === 'staff') {
        playerStats.attack += 3;
        playerStats.defense += 2;
    } else if (userData.equipment.weapon === 'bow') {
        playerStats.attack += 4;
    }
    
    // Handle special move availability
    if (moveType === 'special') {
        if (!specialMoveAvailable) {
            addBattleMessage('system', 'Special move is not ready yet!');
            attackButtons.forEach(button => {
                button.disabled = false;
            });
            return;
        }
        specialMoveAvailable = false;
        
        // Special move is based on intelligence and creativity
        const specialBonus = Math.floor((playerStats.intelligence + playerStats.creativity) / 5);
        playerStats.attack += specialBonus;
    }
    
    // Animate player attack
    playerCharacter.classList.add('attack-animation');
    setTimeout(() => {
        playerCharacter.classList.remove('attack-animation');
    }, 500);
    
    // Calculate damage
    const damage = calculateDamage(playerStats, currentEnemy, moveType);
    
    // Handle defend move
    if (moveType === 'defend') {
        playerStats.defense += 10; // Temporary defense boost
        addBattleMessage('player', 'You brace for impact!');
        
        // Skip to enemy turn
        setTimeout(() => {
            playerTurn = false;
            enemyTurn();
        }, 1000);
        return;
    }
    
    // Apply damage if greater than 0
    if (damage > 0) {
        // Animate enemy taking damage
        enemyCharacter.classList.add('damaged-animation');
        setTimeout(() => {
            enemyCharacter.classList.remove('damaged-animation');
        }, 500);
        
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
        
        // Add battle message
        addBattleMessage('player', `You used ${moveType === 'quick' ? 'a quick attack' : moveType === 'heavy' ? 'a heavy attack' : 'your special move'} and dealt ${damage} damage!`);
        
        // Check if enemy is defeated
        if (enemyCurrentHealth <= 0) {
            battleVictory();
            return;
        }
    } else {
        addBattleMessage('player', 'Your attack had no effect!');
    }
    
    // Switch to enemy turn
    playerTurn = false;
    setTimeout(() => {
        enemyTurn();
    }, 1000);
}

// Enemy turn function
function enemyTurn() {
    if (!battleInProgress) return;
    
    // Select a random enemy move
    const moveIndex = Math.floor(Math.random() * currentEnemy.moves.length);
    const enemyMove = currentEnemy.moves[moveIndex];
    
    // Animate enemy attack
    enemyCharacter.classList.add('attack-animation');
    setTimeout(() => {
        enemyCharacter.classList.remove('attack-animation');
    }, 500);
    
    // Get user data for player defense
    const userData = loadUserData();
    
    // Create player stats object
    const playerStats = {
        attack: 10 + Math.floor(userData.stats.sports / 2),
        defense: 5 + Math.floor(userData.stats.health / 3)
    };
    
    // Calculate damage
    const damage = calculateDamage(currentEnemy, playerStats, 'normal');
    
    // Apply damage
    if (damage > 0) {
        // Animate player taking damage
        playerCharacter.classList.add('damaged-animation');
        setTimeout(() => {
            playerCharacter.classList.remove('damaged-animation');
        }, 500);
        
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
        
        // Add battle message
        addBattleMessage('enemy', `${currentEnemy.name} used ${enemyMove} and dealt ${damage} damage!`);
        
        // Check if player is defeated
        if (playerCurrentHealth <= 0) {
            battleDefeat();
            return;
        }
    } else {
        addBattleMessage('enemy', `${currentEnemy.name}'s attack had no effect!`);
    }
    
    // Switch back to player turn
    playerTurn = true;
    
    // Re-enable attack buttons
    attackButtons.forEach(button => {
        button.disabled = false;
    });
    
    // Make special move available again after 3 turns
    if (!specialMoveAvailable) {
        // There's a 20% chance for special move to become available each turn
        if (Math.random() < 0.2) {
            specialMoveAvailable = true;
            addBattleMessage('system', 'Your special move is ready again!');
        }
    }
}

// Battle victory function
function battleVictory() {
    battleInProgress = false;
    
    // Add victory message
    addBattleMessage('system', `You defeated the ${currentEnemy.name}!`);
    
    // Calculate XP gained based on enemy level
    const xpGained = currentEnemy.level * 20;
    addBattleMessage('system', `You gained ${xpGained} XP!`);
    
    // Update user data
    const userData = loadUserData();
    userData.xp += xpGained;
    
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
    
    saveUserData(userData);
    
    // Re-enable start battle button
    startBattleButton.disabled = false;
    startBattleButton.textContent = 'Start New Battle';
    
    // Disable attack buttons
    attackButtons.forEach(button => {
        button.disabled = true;
    });
}

// Battle defeat function
function battleDefeat() {
    battleInProgress = false;
    
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
    
    // Disable attack buttons
    attackButtons.forEach(button => {
        button.disabled = true;
    });
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
    playerTurn = true;
    playerCurrentHealth = playerMaxHealth;
    battleMessages.innerHTML = '';
    specialMoveAvailable = true;
    
    // Set up a new enemy
    setupEnemy();
    
    // Disable start button
    startBattleButton.disabled = true;
}

// Set up attack button event listeners
attackButtons.forEach(button => {
    button.addEventListener('click', function() {
        if (battleInProgress && playerTurn) {
            const attackType = this.getAttribute('data-attack');
            playerAttack(attackType);
        }
    });
});

// Start battle button event listener
startBattleButton.addEventListener('click', startBattle);

// Back to menu button event listener
backToMenuButton.addEventListener('click', function() {
    if (battleTimeout) {
        clearTimeout(battleTimeout);
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