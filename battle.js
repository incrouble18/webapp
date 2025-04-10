// Battle system core variables
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
let healingSignMinInterval = 5000; // Minimum 5 seconds between healing signs

// DOM Elements - will be initialized when document is ready
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

// Save the original startBattle function to be called by the quiz system
window.originalStartBattle = startBattle;

// Initialize battle elements when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeBattleElements();
    addBattleStyles();
    setupEventListeners();
});

// Initialize all battle DOM elements
function initializeBattleElements() {
    // Get main battle elements
    battleMessages = document.querySelector('.battle-messages');
    battleControls = document.querySelector('.battle-controls');
    startBattleButton = document.getElementById('start-battle-button');
    healButton = document.getElementById('heal-button');
    specialButton = document.getElementById('special-button');
    continueButton = document.getElementById('continue-button');
    battleResultsContainer = document.querySelector('.battle-results');
    resultTitle = document.querySelector('.result-title');
    rewardsContainer = document.querySelector('.rewards-container');
    
    // Get health bar elements
    playerHealthBar = document.querySelector('.player-health-bar');
    playerHealthText = document.querySelector('.player-health-text');
    enemyHealthBar = document.querySelector('.enemy-health-bar');
    enemyHealthText = document.querySelector('.enemy-health-text');
    
    // If elements don't exist, create them
    if (!battleMessages) {
        createBattleUI();
        // Reinitialize after creation
        initializeBattleElements();
    }
}

// Create the entire battle UI if it doesn't exist
function createBattleUI() {
    const battleContainer = document.createElement('div');
    battleContainer.className = 'battle-container';
    
    battleContainer.innerHTML = `
        <h1>⚔️ Battle Arena</h1>
        <p>Click on the enemy to attack! Click on healing orbs when they appear!</p>
        
        <div class="battle-area">
            <div class="player-area">
                <h3>Player</h3>
                <div class="health-bar-container player-health-container">
                    <div class="health-bar player-health-bar"></div>
                    <span class="health-text player-health-text">100/100</span>
                </div>
                <div class="player-character-container"></div>
            </div>
            
            <div class="vs-indicator">VS</div>
            
            <div class="enemy-area">
                <h3>Enemy</h3>
                <div class="health-bar-container enemy-health-container">
                    <div class="health-bar enemy-health-bar"></div>
                    <span class="health-text enemy-health-text">100/100</span>
                </div>
                <div class="enemy-character-container"></div>
            </div>
        </div>
        
        <div class="battle-controls" style="display: none;">
            <button id="heal-button" class="battle-button">Heal</button>
            <button id="special-button" class="battle-button">Special Attack</button>
        </div>
        
        <button id="start-battle-button" class="battle-start-button">Start Battle</button>
        
        <div class="battle-messages"></div>
        
        <div class="battle-results" style="display: none;">
            <h3 class="result-title"></h3>
            <div class="rewards-container"></div>
            <button id="continue-button" class="battle-button">Continue</button>
        </div>
    `;
    
    document.body.appendChild(battleContainer);
}

// Set up event listeners for battle controls
function setupEventListeners() {
    // Start battle button
    if (startBattleButton) {
        startBattleButton.addEventListener('click', function() {
            // Initialize the battle quiz first
            if (typeof window.initBattleQuiz === 'function') {
                window.initBattleQuiz();
            } else {
                console.error('Battle quiz not initialized');
                // Fallback to direct battle start
                startBattle();
            }
        });
    }
    
    // Heal button
    if (healButton) {
        healButton.addEventListener('click', function() {
            if (battleInProgress) {
                useHeal();
            }
        });
    }
    
    // Special attack button
    if (specialButton) {
        specialButton.addEventListener('click', function() {
            if (battleInProgress) {
                useSpecialAttack();
            }
        });
    }
    
    // Continue button (after battle)
    if (continueButton) {
        continueButton.addEventListener('click', function() {
            hideElement(battleResultsContainer);
            showElement(startBattleButton);
        });
    }
}

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
            records: {
                mathTime: []
            },
            inventory: []
        };
    }
}

// Save user data to localStorage
function saveUserData(userData) {
    localStorage.setItem('brainTrainingUserData', JSON.stringify(userData));
}

// Add CSS styles for battle animations to the document
function addBattleStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .damaged {
            animation: shake 0.5s ease-in-out;
            filter: brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(3);
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-10px); }
            40%, 80% { transform: translateX(10px); }
        }
        
        .damage-effect {
            position: absolute;
            font-size: 24px;
            font-weight: bold;
            width: 30px;
            height: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 50%;
            z-index: 1000;
            opacity: 1;
            transition: transform 1s ease-out, opacity 1s ease-out;
        }
        
        .healing-sign {
            position: absolute;
            width: 40px;
            height: 40px;
            background-color: #2ecc71;
            color: white;
            font-size: 24px;
            font-weight: bold;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            box-shadow: 0 0 15px rgba(46, 204, 113, 0.8);
            z-index: 1000;
            animation: float 10s linear forwards;
        }
        
        @keyframes float {
            0% {
                opacity: 0;
                transform: translate(0, 0) scale(0.5);
            }
            10% {
                opacity: 1;
                transform: translate(20px, -20px) scale(1);
            }
            90% {
                opacity: 1;
                transform: translate(100px, -100px) scale(1);
            }
            100% {
                opacity: 0;
                transform: translate(120px, -120px) scale(0.5);
            }
        }
        
        .battle-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            background-color: rgba(0, 0, 0, 0.3);
            border-radius: 15px;
            margin: 20px auto;
            width: 90%;
            max-width: 500px;
        }
        
        .battle-area {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin: 20px 0;
        }
        
        .player-area, .enemy-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
            padding: 10px;
        }
        
        .health-bar-container {
            width: 100%;
            height: 20px;
            background-color: #333;
            border-radius: 10px;
            overflow: hidden;
            position: relative;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .health-bar {
            height: 100%;
            width: 100%;
            background-color: #2ecc71;
            transition: width 0.3s ease-in-out;
        }
        
        .health-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 12px;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
        }
        
        .player-character-container, .enemy-character-container {
            position: relative;
            width: 150px;
            height: 200px;
            margin: 10px auto;
        }
        
        .enemy-character-container {
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .enemy-character-container:hover {
            transform: scale(1.05);
        }
        
        .enemy-character-container:active {
            transform: scale(0.95);
        }
        
        .battle-video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: none;
            z-index: 10;
        }
        
        .battle-messages {
            margin-top: 20px;
            height: 100px;
            overflow-y: auto;
            width: 100%;
            padding: 10px;
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            font-size: 14px;
            color: white;
        }
        
        .battle-message {
            margin-bottom: 5px;
            padding: 5px;
            border-radius: 5px;
        }
        
        .message-system {
            background-color: rgba(52, 152, 219, 0.3);
        }
        
        .message-player {
            background-color: rgba(46, 204, 113, 0.3);
        }
        
        .message-enemy {
            background-color: rgba(231, 76, 60, 0.3);
        }
        
        .battle-start-button {
            padding: 15px 30px;
            background-color: #e74c3c;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            cursor: pointer;
            margin: 20px auto;
            display: block;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            transition: all 0.3s;
        }
        
        .battle-start-button:hover {
            background-color: #c0392b;
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }
        
        .battle-button {
            padding: 10px 20px;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
            margin: 0 5px;
        }
        
        .battle-button:hover {
            background-color: #2980b9;
        }
    `;
    document.head.appendChild(styleElement);
}

// Start Battle function - called after quiz completion
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
    
    // Set player stats based on user data and equipment
    setupPlayerStats(userData);
    
    // Set enemy stats based on level
    setupEnemyStats(userData.level);
    
    playerCurrentHealth = playerMaxHealth;
    enemyCurrentHealth = enemyMaxHealth;
    battleMessages.innerHTML = '';
    battleRewards = [];

    // Apply buffs from quiz if available
    applyBattleBuffs();

    // Initialize battle UI
    updateHealthDisplays();
    showElement(battleControls);
    hideElement(startBattleButton);
    
    // Initialize character images and battle video
    initializeCharacterImages();
    
    // Start enemy attack interval - 3 clicks per second (333ms)
    startEnemyAttacks();
    
    // Start spawning healing signs
    startHealingSignsSpawn();
    
    // Start battle message
    addBattleMessage('system', 'Battle started! Click on the enemy to attack!');
}

// Setup player stats based on user data and equipment
function setupPlayerStats(userData) {
    // Base stats
    playerMaxHealth = 80 + (userData.stats.health * 2);
    playerBaseDamage = 3 + Math.floor(userData.level / 2);
    
    // Add equipment bonuses (if any)
    if (userData.equipment) {
        if (userData.equipment.head) playerMaxHealth += userData.equipment.head.healthBonus || 0;
        if (userData.equipment.body) playerMaxHealth += userData.equipment.body.healthBonus || 0;
        if (userData.equipment.accessory) playerBaseDamage += userData.equipment.accessory.damageBonus || 0;
    }
    
    // Set current values
    playerDamage = playerBaseDamage;
    healBaseAmount = Math.floor(playerMaxHealth * 0.15); // Heal 15% of max health
    healAmount = healBaseAmount;
}

// Setup enemy stats based on player level
function setupEnemyStats(playerLevel) {
    enemyLevel = playerLevel;
    enemyMaxHealth = 100 + (enemyLevel * 10);
    enemyBaseDamage = 2 + Math.floor(enemyLevel / 3);
    enemyDamage = enemyBaseDamage;
}

// Apply buffs from quiz results
function applyBattleBuffs() {
    const battleBuffsString = localStorage.getItem('battleBuffs');
    if (battleBuffsString) {
        try {
            const battleBuffs = JSON.parse(battleBuffsString);
            // Apply buffs to player stats
            playerDamage = Math.floor(playerBaseDamage * battleBuffs.damage);
            healAmount = Math.floor(healBaseAmount * battleBuffs.healing);
            enemyDamage = Math.floor(enemyBaseDamage * (2.0 - battleBuffs.defense));
            
            // Display buff/debuff info
            if (battleBuffs.damage > 1.0) {
                addBattleMessage('system', `Your damage is increased by ${Math.floor((battleBuffs.damage - 1.0) * 100)}%!`);
            } else if (battleBuffs.damage < 1.0) {
                addBattleMessage('system', `Your damage is decreased by ${Math.floor((1.0 - battleBuffs.damage) * 100)}%!`);
            }
            
            if (battleBuffs.healing > 1.0) {
                addBattleMessage('system', `Your healing is increased by ${Math.floor((battleBuffs.healing - 1.0) * 100)}%!`);
            } else if (battleBuffs.healing < 1.0) {
                addBattleMessage('system', `Your healing is decreased by ${Math.floor((1.0 - battleBuffs.healing) * 100)}%!`);
            }
            
            if (battleBuffs.defense > 1.0) {
                addBattleMessage('system', `Enemy damage is decreased by ${Math.floor((battleBuffs.defense - 1.0) * 100)}%!`);
            } else if (battleBuffs.defense < 1.0) {
                addBattleMessage('system', `Enemy damage is increased by ${Math.floor((1.0 - battleBuffs.defense) * 100)}%!`);
            }
        } catch (error) {
            console.error('Error parsing battle buffs:', error);
        }
    }
}

// Initialize player and enemy character images
function initializeCharacterImages() {
    const playerContainer = document.querySelector('.player-character-container');
    const enemyContainer = document.querySelector('.enemy-character-container');
    
    if (playerContainer && !playerContainer.querySelector('img')) {
        // Create player image
        const playerImage = document.createElement('img');
        playerImage.src = 'm11.png';
        playerImage.alt = 'Player Character';
        playerImage.style.width = '100%';
        playerImage.style.height = '100%';
        playerImage.style.objectFit = 'contain';
        playerContainer.appendChild(playerImage);
    }
    
    if (enemyContainer) {
        // Clear enemy container
        enemyContainer.innerHTML = '';
        
        // Create enemy image
        const enemyImage = document.createElement('img');
        enemyImage.src = 'cyberwolf.png';
        enemyImage.alt = 'Enemy Character';
        enemyImage.style.width = '100%';
        enemyImage.style.height = '100%';
        enemyImage.style.objectFit = 'contain';
        enemyContainer.appendChild(enemyImage);
        
        // Create video element for damage animation
        const videoElement = document.createElement('video');
        videoElement.className = 'battle-video';
        videoElement.src = 'Standard_Mode_damaged_mechanical_stumble__futu.mp4';
        videoElement.muted = true; // Mute to not annoy users
        enemyContainer.appendChild(videoElement);
        
        // Add click event for attacking
        enemyContainer.addEventListener('click', function() {
            if (battleInProgress) {
                playerAttack();
            }
        });
    }
}

// Start enemy attack interval
function startEnemyAttacks() {
    // Clear any existing interval
    if (enemyAttackInterval) {
        clearInterval(enemyAttackInterval);
    }
    
    // Set up new attack interval - 3 attacks per second
    enemyAttackInterval = setInterval(function() {
        if (battleInProgress && playerCurrentHealth > 0) {
            enemyAttack();
        } else {
            clearInterval(enemyAttackInterval);
        }
    }, 333); // 333ms = 3 times per second
}

// Start spawning healing signs
function startHealingSignsSpawn() {
    // Clear any existing interval
    if (healingSignsInterval) {
        clearInterval(healingSignsInterval);
    }
    
    // Set up new interval for healing signs - check every second
    healingSignsInterval = setInterval(function() {
        if (battleInProgress && playerCurrentHealth > 0) {
            // 20% chance to spawn a healing sign if enough time has passed
            const currentTime = Date.now();
            if (currentTime - lastHealingSignTime > healingSignMinInterval && Math.random() < 0.2) {
                spawnHealingSign();
                lastHealingSignTime = currentTime;
            }
        } else {
            clearInterval(healingSignsInterval);
        }
    }, 1000);
}

// Spawn a healing sign that player must click
function spawnHealingSign() {
    const battleContainer = document.querySelector('.battle-container');
    if (!battleContainer) return;
    
    const healingSign = document.createElement('div');
    healingSign.className = 'healing-sign';
    healingSign.innerHTML = '+';
    
    // Random position within the battle container
    const containerRect = battleContainer.getBoundingClientRect();
    const randomX = Math.random() * (containerRect.width - 80) + 40;
    const randomY = Math.random() * (containerRect.height - 80) + 40;
    
    healingSign.style.left = `${randomX}px`;
    healingSign.style.top = `${randomY}px`;
    
    // Click event to heal
    healingSign.addEventListener('click', function() {
        if (battleInProgress) {
            const healingAmount = Math.floor(healAmount * (0.8 + Math.random() * 0.4)); // 80-120% of heal amount
            playerHeal(healingAmount);
            battleContainer.removeChild(healingSign);
        }
    });
    
    battleContainer.appendChild(healingSign);
    
    // Remove after animation completes (10 seconds)
    setTimeout(() => {
        if (battleContainer.contains(healingSign)) {
            battleContainer.removeChild(healingSign);
        }
    }, 10000);
}

// Player attacks the enemy
function playerAttack() {
    if (!battleInProgress) return;
    
    // Calculate damage with some randomness
    const damageVariance = 0.3; // ±30% damage variance
    const actualDamage = Math.floor(playerDamage * (1 - damageVariance + Math.random() * (damageVariance * 2)));
    
    // Apply damage to enemy
    enemyTakeDamage(actualDamage);
    
    // Play damage animation video
    playEnemyDamageAnimation();
    
    // Create visual damage effect
    const enemyContainer = document.querySelector('.enemy-character-container');
    if (enemyContainer) {
        createDamageEffect(enemyContainer);
    }
    
    // Add attack message
    addBattleMessage('player', `You dealt ${actualDamage} damage to the enemy!`);
    
    // Check if enemy is defeated
    if (enemyCurrentHealth <= 0) {
        endBattle(true);
    }
}

// Enemy attacks the player
function enemyAttack() {
    if (!battleInProgress || enemyCurrentHealth <= 0) return;
    
    // Calculate damage with some randomness
    const damageVariance = 0.2; // ±20% damage variance
    const actualDamage = Math.floor(enemyDamage * (1 - damageVariance + Math.random() * (damageVariance * 2)));
    
    // Apply damage to player
    playerTakeDamage(actualDamage);
    
    // Create visual damage effect
    const playerContainer = document.querySelector('.player-character-container');
    if (playerContainer) {
        createDamageEffect(playerContainer);
    }
    
    // Add attack message (only 25% of the time to avoid message spam)
    if (Math.random() < 0.25) {
        addBattleMessage('enemy', `Enemy dealt ${actualDamage} damage to you!`);
    }
    
    // Check if player is defeated
    if (playerCurrentHealth <= 0) {
        endBattle(false);
    }
}

// Player healing function
function playerHeal(amount) {
    if (!battleInProgress) return;
    
    // Cap healing to avoid exceeding max health
    const actualHeal = Math.min(amount, playerMaxHealth - playerCurrentHealth);
    playerCurrentHealth += actualHeal;
    
    // Update health display
    updateHealthDisplays();
    
    // Create visual healing effect
    const playerContainer = document.querySelector('.player-character-container');
    if (playerContainer) {
        createDamageEffect(playerContainer, true); // true = healing
    }
    
    // Add healing message
    addBattleMessage('player', `You healed for ${actualHeal} health!`);
}

// Manual heal button function
function useHeal() {
    const healingAmount = Math.floor(healAmount * (0.9 + Math.random() * 0.2)); // 90-110% of heal amount
    playerHeal(healingAmount);
    
    // Disable heal button for 5 seconds
    healButton.disabled = true;
    setTimeout(() => {
        healButton.disabled = false;
    }, 5000);
}

// Special attack function
function useSpecialAttack() {
    if (!battleInProgress) return;
    
    // Special attack does 2-3x normal damage
    const damageMultiplier = 2 + Math.random();
    const actualDamage = Math.floor(playerDamage * damageMultiplier);
    
    // Apply damage to enemy
    enemyTakeDamage(actualDamage);
    
    // Play damage animation video
    playEnemyDamageAnimation();
    
    // Create visual damage effect (multiple effects for special attack)
    const enemyContainer = document.querySelector('.enemy-character-container');
    if (enemyContainer) {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                createDamageEffect(enemyContainer);
            }, i * 200);
        }
    }
    
    // Add attack message
    addBattleMessage('player', `You used a special attack and dealt ${actualDamage} damage!`);
    
    // Check if enemy is defeated
    if (enemyCurrentHealth <= 0) {
        endBattle(true);
    }
    
    // Disable special button for 10 seconds
    specialButton.disabled = true;
    setTimeout(() => {
        specialButton.disabled = false;
    }, 10000);
}

// Enemy takes damage
function enemyTakeDamage(damage) {
    enemyCurrentHealth -= damage;
    if (enemyCurrentHealth < 0) enemyCurrentHealth = 0;
    updateHealthDisplays();
}

// Player takes damage
function playerTakeDamage(damage) {
    playerCurrentHealth -= damage;
    if (playerCurrentHealth < 0) playerCurrentHealth = 0;
    updateHealthDisplays();
}

// Play enemy damage animation video
function playEnemyDamageAnimation() {
    const videoElement = document.querySelector('.battle-video');
    if (videoElement) {
        videoElement.style.display = 'block';
        videoElement.currentTime = 0;
        videoElement.play();
        
        // Hide video after it ends
        videoElement.onended = function() {
            videoElement.style.display = 'none';
        };
    }
}

// Create visual damage/healing effect
function createDamageEffect(target, isHealing = false) {
    const element = document.createElement('div');
    element.className = 'damage-effect';
    
    // Positioning the effect
    const targetRect = target.getBoundingClientRect();
    const offsetX = Math.random() * 60 - 30;
    const offsetY = Math.random() * 60 - 30;
    
    element.style.left = `${targetRect.left + targetRect.width / 2 + offsetX}px`;
    element.style.top = `${targetRect.top + targetRect.height / 2 + offsetY}px`;
    
    // Style based on healing or damage
    if (isHealing) {
        element.innerHTML = '+';
        element.style.color = '#2ecc71'; // Green color for healing
        element.style.backgroundColor = 'rgba(46, 204, 113, 0.3)'; // Light green background
    } else {
        element.innerHTML = '-';
        element.style.color = '#e74c3c'; // Red color for damage
        element.style.backgroundColor = 'rgba(231, 76, 60, 0.3)'; // Light red background
    }
    
    document.body.appendChild(element);
    
    // Animation
    setTimeout(() => {
        element.style.transform = 'translateY(-50px) scale(1.5)';
        element.style.opacity = '0';
    }, 50);
    
    // Remove after animation
    setTimeout(() => {
        if (document.body.contains(element)) {
            document.body.removeChild(element);
        }
    }, 1000);
}

// Update health bars and text
function updateHealthDisplays() {
    if (!playerHealthBar || !playerHealthText || !enemyHealthBar || !enemyHealthText) {
        return;
    }
    
    // Update player health
    const playerHealthPercent = (playerCurrentHealth / playerMaxHealth) * 100;
    playerHealthBar.style.width = `${playerHealthPercent}%`;
    playerHealthText.textContent = `${playerCurrentHealth}/${playerMaxHealth}`;
    
    // Change color based on health percentage
    if (playerHealthPercent < 25) {
        playerHealthBar.style.backgroundColor = '#e74c3c'; // Red for low health
    } else if (playerHealthPercent < 50) {
        playerHealthBar.style.backgroundColor = '#f39c12'; // Orange for medium health
    } else {
        playerHealthBar.style.backgroundColor = '#2ecc71'; // Green for good health
    }
    
    // Update enemy health
    const enemyHealthPercent = (enemyCurrentHealth / enemyMaxHealth) * 100;
    enemyHealthBar.style.width = `${enemyHealthPercent}%`;
    enemyHealthText.textContent = `${enemyCurrentHealth}/${enemyMaxHealth}`;
    
    // Change color based on health percentage
    if (enemyHealthPercent < 25) {
        enemyHealthBar.style.backgroundColor = '#e74c3c'; // Red for low health
    } else if (enemyHealthPercent < 50) {
        enemyHealthBar.style.backgroundColor = '#f39c12'; // Orange for medium health
    } else {
        enemyHealthBar.style.backgroundColor = '#2ecc71'; // Green for good health
    }
}

// Add message to battle log
function addBattleMessage(type, message) {
  if (!battleMessages) return;
    
  const messageElement = document.createElement('div');
  messageElement.className = `battle-message message-${type}`;
  messageElement.textContent = message;
  
  battleMessages.appendChild(messageElement);
  battleMessages.scrollTop = battleMessages.scrollHeight; // Auto-scroll to bottom
}

// End battle function
function endBattle(playerWon) {
  // Stop battle
  battleInProgress = false;
  
  // Clear intervals
  if (enemyAttackInterval) {
      clearInterval(enemyAttackInterval);
      enemyAttackInterval = null;
  }
  
  if (healingSignsInterval) {
      clearInterval(healingSignsInterval);
      healingSignsInterval = null;
  }
  
  // Remove all healing signs
  const healingSigns = document.querySelectorAll('.healing-sign');
  healingSigns.forEach(sign => {
      sign.parentNode.removeChild(sign);
  });
  
  // Hide battle controls
  hideElement(battleControls);
  
  // Update user data
  const userData = loadUserData();
  
  if (playerWon) {
      // Calculate rewards
      const xpReward = calculateXpReward(enemyLevel);
      const itemReward = generateItemReward(enemyLevel);
      
      // Add rewards
      userData.xp += xpReward;
      battleRewards.push({ type: 'xp', amount: xpReward });
      
      if (itemReward) {
          userData.inventory.push(itemReward);
          battleRewards.push({ type: 'item', item: itemReward });
      }
      
      // Check for level up
      const newLevel = calculateLevel(userData.xp);
      if (newLevel > userData.level) {
          userData.level = newLevel;
          battleRewards.push({ type: 'level', newLevel: newLevel });
      }
      
      // Battle victory message
      addBattleMessage('system', 'You won the battle!');
      
      // Display results
      resultTitle.textContent = 'Victory!';
      displayBattleRewards();
      
  } else {
      // Player lost
      userData.lives--;
      
      // Battle defeat message
      addBattleMessage('system', 'You were defeated!');
      
      // Display results
      resultTitle.textContent = 'Defeat!';
      rewardsContainer.innerHTML = `
          <div class="reward-item">Lives remaining: ${userData.lives}</div>
      `;
  }
  
  // Save updated user data
  saveUserData(userData);
  
  // Show battle results
  showElement(battleResultsContainer);
  
  // Clear battle buffs
  localStorage.removeItem('battleBuffs');
}

// Calculate XP reward based on enemy level
function calculateXpReward(enemyLevel) {
  const baseXp = 10;
  const levelMultiplier = 1 + (enemyLevel * 0.1);
  return Math.floor(baseXp * levelMultiplier);
}

// Generate a random item reward based on enemy level
function generateItemReward(enemyLevel) {
  // 30% chance to get an item
  if (Math.random() < 0.3) {
      const itemTypes = ['weapon', 'armor', 'accessory', 'potion'];
      const randomType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
      
      const rarity = calculateRarity(enemyLevel);
      
      return {
          id: generateUniqueId(),
          type: randomType,
          name: generateItemName(randomType, rarity),
          rarity: rarity,
          stats: generateItemStats(randomType, rarity, enemyLevel)
      };
  }
  
  return null;
}

// Calculate rarity based on enemy level
function calculateRarity(enemyLevel) {
  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const rarityChances = [
      0.6 - (enemyLevel * 0.02),  // common
      0.3,                        // uncommon
      0.08 + (enemyLevel * 0.01), // rare
      0.02 + (enemyLevel * 0.005),// epic
      0.005 + (enemyLevel * 0.001)// legendary
  ];
  
  const roll = Math.random();
  let cumulativeChance = 0;
  
  for (let i = 0; i < rarities.length; i++) {
      cumulativeChance += Math.max(0, rarityChances[i]);
      if (roll < cumulativeChance) {
          return rarities[i];
      }
  }
  
  return rarities[0]; // default to common
}

// Generate a unique ID for items
function generateUniqueId() {
  return 'item_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

// Generate item name based on type and rarity
function generateItemName(type, rarity) {
  const rarityPrefixes = {
      'common': ['Simple', 'Basic', 'Standard'],
      'uncommon': ['Fine', 'Quality', 'Superior'],
      'rare': ['Exceptional', 'Remarkable', 'Magnificent'],
      'epic': ['Heroic', 'Mythical', 'Legendary'],
      'legendary': ['Divine', 'Celestial', 'Godly']
  };
  
  const typeNames = {
      'weapon': ['Sword', 'Axe', 'Dagger', 'Staff', 'Wand'],
      'armor': ['Armor', 'Shield', 'Helmet', 'Gloves', 'Boots'],
      'accessory': ['Ring', 'Amulet', 'Earring', 'Bracelet', 'Belt'],
      'potion': ['Health Potion', 'Energy Potion', 'Strength Elixir', 'Intelligence Brew']
  };
  
  const prefix = rarityPrefixes[rarity][Math.floor(Math.random() * rarityPrefixes[rarity].length)];
  const typeName = typeNames[type][Math.floor(Math.random() * typeNames[type].length)];
  
  return `${prefix} ${typeName}`;
}

// Generate item stats based on type, rarity, and level
function generateItemStats(type, rarity, level) {
  const rarityMultipliers = {
      'common': 1,
      'uncommon': 1.5,
      'rare': 2,
      'epic': 3,
      'legendary': 5
  };
  
  const multiplier = rarityMultipliers[rarity] * (1 + (level * 0.1));
  
  const stats = {};
  
  switch(type) {
      case 'weapon':
          stats.damageBonus = Math.floor(2 * multiplier);
          break;
      case 'armor':
          stats.healthBonus = Math.floor(10 * multiplier);
          stats.defenseBonus = Math.floor(1 * multiplier);
          break;
      case 'accessory':
          // Random stat boost
          const statTypes = ['intelligence', 'sports', 'energy', 'creativity', 'health'];
          const randomStat = statTypes[Math.floor(Math.random() * statTypes.length)];
          stats[randomStat + 'Bonus'] = Math.floor(2 * multiplier);
          break;
      case 'potion':
          stats.healthRestore = Math.floor(20 * multiplier);
          break;
  }
  
  return stats;
}

// Calculate player level based on XP
function calculateLevel(xp) {
  // Simple level calculation: each level requires 100 * level XP
  let level = 1;
  let xpRequired = 100;
  
  while (xp >= xpRequired) {
      level++;
      xp -= xpRequired;
      xpRequired = 100 * level;
  }
  
  return level;
}

// Display battle rewards in the rewards container
function displayBattleRewards() {
  rewardsContainer.innerHTML = '';
  
  battleRewards.forEach(reward => {
      const rewardElement = document.createElement('div');
      rewardElement.className = 'reward-item';
      
      switch(reward.type) {
          case 'xp':
              rewardElement.textContent = `+${reward.amount} XP`;
              rewardElement.style.color = '#3498db'; // Blue for XP
              break;
          case 'level':
              rewardElement.textContent = `Level Up! New level: ${reward.newLevel}`;
              rewardElement.style.color = '#f39c12'; // Orange for level up
              break;
          case 'item':
              rewardElement.innerHTML = `New Item: <span style="color: ${getRarityColor(reward.item.rarity)}">${reward.item.name}</span>`;
              break;
      }
      
      rewardsContainer.appendChild(rewardElement);
  });
}

// Get color code for item rarity
function getRarityColor(rarity) {
  const rarityColors = {
      'common': '#95a5a6',     // Gray
      'uncommon': '#2ecc71',   // Green
      'rare': '#3498db',       // Blue
      'epic': '#9b59b6',       // Purple
      'legendary': '#f1c40f'   // Gold
  };
  
  return rarityColors[rarity] || '#95a5a6';
}

// Helper function to show an element
function showElement(element) {
  if (element) {
      element.style.display = 'block';
  }
}

// Helper function to hide an element
function hideElement(element) {
  if (element) {
      element.style.display = 'none';
  }
}

// Export functions to be used by other modules
window.startBattle = startBattle;
window.addBattleMessage = addBattleMessage;
window.playerAttack = playerAttack;
window.useHeal = useHeal;
window.useSpecialAttack = useSpecialAttack;