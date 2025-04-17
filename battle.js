// Initialize Telegram Web App compatibility
let tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
    tg.expand();
}

// DOM Elements
const battleContainer = document.getElementById('battle-container'); // Added for controlling visibility
const battleMessages = document.getElementById('battle-messages');
const playerHealth = document.getElementById('player-health');
const enemyHealth = document.getElementById('enemy-health');
const enemyName = document.getElementById('enemy-name');
const enemyLevel = document.getElementById('enemy-level');
const enemyType = document.getElementById('enemy-type');
const enemyCharacter = document.getElementById('enemy-character');
const playerCharacter = document.getElementById('player-character');
const healingOrb = document.getElementById('healing-orb');
const backToMenuButton = document.getElementById('back-to-menu'); // Added reference

// Game variables
let battleInProgress = false;
let playerCurrentHealth = 100;
let enemyCurrentHealth = 100;
let playerMaxHealth = 100; // Base max health
let enemyMaxHealth = 100;
let currentEnemy = null;
let enemyAttackInterval = null;
let healingOrbInterval = null;
let playerDamage = 10; // Base damage
let healAmount = 20;   // Base heal amount
let playerDefense = 1; // Base defense
let clickCooldown = false;
let clickCooldownTime = 50; // Cooldown for player clicks
let battleRewards = [];
let basePlayerDamage = 10; // Store base damage before buffs
let baseHealAmount = 20;   // Store base heal amount before buffs
let basePlayerDefense = 1; // Store base defense before buffs

// Enemy definitions (same as before)
const enemies = [
    { name: 'Slime', type: 'Normal', level: 1, health: 80, attack: 3, defense: 1, attackSpeed: 300, cssClass: 'enemy-slime', rewards: { xp: 20, items: [{ name: 'Slime Goo', icon: '🧪', chance: 0.7 }, { name: 'Health Potion', icon: '❤️', chance: 0.3 }] } },
    { name: 'Goblin', type: 'Forest', level: 2, health: 100, attack: 4, defense: 2, attackSpeed: 280, cssClass: 'enemy-goblin', rewards: { xp: 35, items: [{ name: 'Goblin Dagger', icon: '🗡️', chance: 0.4 }, { name: 'Gold Coins', icon: '💰', chance: 0.6 }] } },
    { name: 'Ghost', type: 'Ethereal', level: 3, health: 120, attack: 5, defense: 2, attackSpeed: 270, cssClass: 'enemy-ghost', rewards: { xp: 50, items: [{ name: 'Spectral Essence', icon: '👻', chance: 0.5 }, { name: 'Magic Scroll', icon: '📜', chance: 0.3 }] } },
    { name: 'Dragon', type: 'Fire', level: 5, health: 200, attack: 7, defense: 4, attackSpeed: 250, cssClass: 'enemy-dragon', rewards: { xp: 100, items: [{ name: 'Dragon Scale', icon: '🔥', chance: 0.6 }, { name: 'Fire Crystal', icon: '💎', chance: 0.4 }, { name: 'Dragon Fang', icon: '🦷', chance: 0.2 }] } },
    { name: 'Dark Lord', type: 'Boss', level: 10, health: 300, attack: 10, defense: 5, attackSpeed: 220, cssClass: 'enemy-boss', rewards: { xp: 200, items: [{ name: 'Shadow Artifact', icon: '🔮', chance: 0.8 }, { name: 'Dark Armor', icon: '🛡️', chance: 0.5 }, { name: 'Legendary Weapon', icon: '⚔️', chance: 0.3 }] } }
];

// Load user data from localStorage
function loadUserData() {
    const defaultUserData = {
        level: 1, xp: 0, lives: 5, lastPlayed: new Date().toISOString(),
        stats: { intelligence: 10, sports: 5, languages: 3, energy: 8, creativity: 7, health: 10 },
        equipment: { skin: 'light', outfit: 'casual', headgear: 'none', weapon: 'none' },
        // Removed pet and inventory from default structure here
        achievements: { memoryMaster: false, mathWizard: false, dailyStreak: false },
        records: { mathTime: [] },
        room: { theme: 'default', items: [] } // Keep room for buffs
    };
    const savedData = localStorage.getItem('brainTrainingUserData');
    if (savedData) {
        try {
            // Merge saved data with default structure
            const parsedData = JSON.parse(savedData);
            let mergedData = { ...defaultUserData, ...parsedData };
            mergedData.stats = { ...defaultUserData.stats, ...(parsedData.stats || {}) };
            mergedData.equipment = { ...defaultUserData.equipment, ...(parsedData.equipment || {}) };
            mergedData.achievements = { ...defaultUserData.achievements, ...(parsedData.achievements || {}) };
            mergedData.records = { ...defaultUserData.records, ...(parsedData.records || {}) };
            mergedData.room = { ...defaultUserData.room, ...(parsedData.room || {}) };
             // Ensure mathTime array exists
            if (!mergedData.records.mathTime) {
                mergedData.records.mathTime = [];
            }
            // Ensure room items array exists
            if (!mergedData.room.items) {
                mergedData.room.items = [];
            }
            return mergedData;
        } catch (e) {
            console.error("Error parsing user data in battle.js:", e);
            return defaultUserData; // Return default if parsing fails
        }
    }
    return defaultUserData; // Return default if no data saved
}

// Save user data to localStorage
function saveUserData(userData) {
    try {
        localStorage.setItem('brainTrainingUserData', JSON.stringify(userData));
    } catch (e) {
        console.error("Error saving user data in battle.js:", e);
    }
}

// Update the player character appearance
function updatePlayerAppearance() {
    const userData = loadUserData();
    playerCharacter.innerHTML = ''; // Clear previous layers

    // Apply base class
    playerCharacter.className = 'character-container';

    // Apply skin class
    playerCharacter.classList.add(`skin-${userData.equipment.skin || 'light'}`);

    // Apply outfit class if not none
    if (userData.equipment.outfit && userData.equipment.outfit !== 'none') {
        playerCharacter.classList.add(`outfit-${userData.equipment.outfit}`);
    }

    // Apply headgear class if not none
    if (userData.equipment.headgear && userData.equipment.headgear !== 'none') {
        playerCharacter.classList.add(`headgear-${userData.equipment.headgear}`);
    }

    // Apply weapon class if not none
    if (userData.equipment.weapon && userData.equipment.weapon !== 'none') {
        playerCharacter.classList.add(`weapon-${userData.equipment.weapon}`);
    }

    // Create character visualization layers dynamically (assuming character.css defines these)
    // This structure should match the one in character.css
    playerCharacter.innerHTML = `
        <div id="char-base" class="char-layer"></div> <!-- Base layer if needed -->
        <div id="char-body" class="char-layer"></div> <!-- Body layer -->
        <div id="char-outfit" class="char-layer"></div> <!-- Outfit layer -->
        <div id="char-head" class="char-layer"></div> <!-- Head layer -->
        <div id="char-face" class="char-layer"> <!-- Face layer -->
            <div id="char-mouth"></div> <!-- Mouth element if styled -->
        </div>
        <div id="char-headgear" class="char-layer"></div> <!-- Headgear layer -->
        <div id="char-weapon" class="char-layer"></div> <!-- Weapon layer -->
        <!-- <div id="char-accessory" class="char-layer"></div> --> <!-- Accessory layer if you add it later -->
    `;
}


// Calculate player base stats based on user data (stats, equipment, room buffs)
function calculatePlayerBaseStats() {
    const userData = loadUserData();

    // Base stats from user attributes
    basePlayerDamage = 5 + Math.floor(userData.stats.sports / 2);
    basePlayerDefense = 1 + Math.floor(userData.stats.health / 5);
    playerMaxHealth = 80 + Math.floor(userData.stats.health * 2); // Max health based on health stat
    baseHealAmount = 15 + Math.floor(userData.stats.intelligence / 3); // Healing based on intelligence

    // Apply equipment bonuses
    // Weapons (Damage primarily, maybe some defense)
    if (userData.equipment.weapon === 'sword') basePlayerDamage += 5;
    else if (userData.equipment.weapon === 'staff') { basePlayerDamage += 3; basePlayerDefense += 1; }
    else if (userData.equipment.weapon === 'bow') basePlayerDamage += 4;

    // Outfits (Defense primarily, maybe some damage)
    if (userData.equipment.outfit === 'warrior') { basePlayerDefense += 3; basePlayerDamage += 2; }
    else if (userData.equipment.outfit === 'mage') { basePlayerDefense += 1; basePlayerDamage += 3; }
    else if (userData.equipment.outfit === 'formal') basePlayerDefense += 2; // Formal wear gives some defense? :)

    // Headgear (Defense or Damage)
    if (userData.equipment.headgear === 'helmet') basePlayerDefense += 2;
    else if (userData.equipment.headgear === 'crown') basePlayerDamage += 2;
    else if (userData.equipment.headgear === 'hat') basePlayerDefense += 1;

    // Apply Room Buffs (Example: check room items and apply %)
    // Define potential room buffs and their effects
     const roomBuffEffects = {
        bed: { energy: 0.1 }, // 10% energy might not directly translate here, maybe affects healAmount?
        desk: { intelligence: 0.05 }, // Affects healAmount?
        bookshelf: { intelligence: 0.10 }, // Affects healAmount?
        plant: { health: 0.05 }, // Increase maxHealth or defense?
        poster: { creativity: 0.08 }, // Less direct combat effect
        lamp: { energy: 0.05 },
        rug: { health: 0.03, energy: 0.03 }, // Comfort = small health/energy boost
        computer: { intelligence: 0.08, creativity: 0.05 }
    };

    let totalIntelligenceBonus = 0;
    let totalHealthBonus = 0;

    if (userData.room && userData.room.items) {
        userData.room.items.forEach(item => {
            if (roomBuffEffects[item]) {
                 if (roomBuffEffects[item].intelligence) totalIntelligenceBonus += roomBuffEffects[item].intelligence;
                 if (roomBuffEffects[item].health) totalHealthBonus += roomBuffEffects[item].health;
                 // Add other stats if needed
            }
        });
    }

    // Apply calculated room buffs (example: intelligence affects healing, health affects defense/maxHP)
    baseHealAmount = Math.floor(baseHealAmount * (1 + totalIntelligenceBonus));
    basePlayerDefense = Math.floor(basePlayerDefense * (1 + totalHealthBonus));
    playerMaxHealth = Math.floor(playerMaxHealth * (1 + totalHealthBonus));


    console.log(`Calculated Base Stats: HP=${playerMaxHealth}, Damage=${basePlayerDamage}, Defense=${basePlayerDefense}, Heal=${baseHealAmount}`);

    // Reset current stats to base values before applying potential quiz buffs
    playerDamage = basePlayerDamage;
    healAmount = baseHealAmount;
    playerDefense = basePlayerDefense;
}


// Set up a new enemy
function setupEnemy() {
    const userData = loadUserData();
    const playerLevel = userData.level;

    // Filter enemies appropriate for player level
    const availableEnemies = enemies.filter(enemy => enemy.level <= Math.max(1, playerLevel + 2));
    currentEnemy = availableEnemies.length > 0
        ? { ...availableEnemies[Math.floor(Math.random() * availableEnemies.length)] }
        : { ...enemies[0] }; // Fallback to slime

    // Set enemy health
    enemyMaxHealth = currentEnemy.health;
    enemyCurrentHealth = enemyMaxHealth;

    // Update UI
    enemyName.textContent = currentEnemy.name;
    enemyLevel.textContent = 'Level: ' + currentEnemy.level;
    enemyType.textContent = 'Type: ' + currentEnemy.type;
    enemyCharacter.className = 'enemy-container ' + currentEnemy.cssClass; // Apply enemy appearance

    // Reset health bars visually
    playerHealth.style.width = '100%';
    playerHealth.style.backgroundColor = '#27ae60'; // Reset color
    enemyHealth.style.width = '100%';
    enemyHealth.style.backgroundColor = '#27ae60'; // Reset color

    addBattleMessage('system', `A wild ${currentEnemy.name} (Lv.${currentEnemy.level}) appears! Click on the enemy to attack!`);
}

// Add a message to the battle log
function addBattleMessage(type, message) {
    const messageElement = document.createElement('div');
    messageElement.className = `battle-message ${type}-message`; // e.g., system-message, reward-message
    messageElement.textContent = message;
    battleMessages.appendChild(messageElement);

    // Auto-scroll to bottom
    battleMessages.scrollTop = battleMessages.scrollHeight;
}

// Show damage/heal number animation
function showNumberAnimation(target, value, isHeal = false) {
    const numberElement = document.createElement('div');
    numberElement.className = isHeal ? 'heal-number' : 'damage-number';
    numberElement.textContent = isHeal ? `+${value}` : `-${value}`;

    // Position the number within the target element
    const rect = target.getBoundingClientRect();
    const targetStyle = window.getComputedStyle(target); // Get computed style for positioning
    const randomXOffset = (Math.random() - 0.5) * (rect.width * 0.5); // Random horizontal offset
    const startY = rect.height * 0.3; // Start slightly down from top

    numberElement.style.position = 'absolute'; // Ensure absolute positioning
    numberElement.style.left = `calc(50% + ${randomXOffset}px)`;
    numberElement.style.top = `${startY}px`;
    numberElement.style.transform = 'translateX(-50%)'; // Center horizontally
    numberElement.style.pointerEvents = 'none'; // Prevent interaction
    numberElement.style.zIndex = '100';

    // Check if target has relative/absolute positioning, otherwise add it
    if (targetStyle.position !== 'relative' && targetStyle.position !== 'absolute') {
        target.style.position = 'relative'; // Necessary for absolute positioning of children
    }

    target.appendChild(numberElement);

    // Clean up the element after animation (animation duration is 1s in CSS)
    setTimeout(() => {
        if (numberElement.parentNode === target) {
            target.removeChild(numberElement);
        }
    }, 1000);
}


// Player attack function (triggered by clicking enemy)
function playerAttack() {
    if (!battleInProgress || clickCooldown) return;

    clickCooldown = true;
    setTimeout(() => { clickCooldown = false; }, clickCooldownTime);

    // Animate player attack
    playerCharacter.classList.add('attack-animation');
    setTimeout(() => playerCharacter.classList.remove('attack-animation'), 300);

    // Calculate damage (Player Damage vs Enemy Defense)
    const randomFactor = 0.8 + Math.random() * 0.4; // 80% to 120% damage variance
    const damageDealt = Math.max(1, Math.floor(playerDamage * randomFactor - (currentEnemy.defense * 0.5))); // Enemy defense reduces damage

    // Animate enemy taking damage
    enemyCharacter.classList.add('damaged-animation');
    setTimeout(() => enemyCharacter.classList.remove('damaged-animation'), 300);

    // Show damage number on enemy
    showNumberAnimation(enemyCharacter, damageDealt, false);

    // Reduce enemy health
    enemyCurrentHealth = Math.max(0, enemyCurrentHealth - damageDealt);
    const enemyHealthPercentage = (enemyCurrentHealth / enemyMaxHealth) * 100;
    enemyHealth.style.width = enemyHealthPercentage + '%';

    // Change enemy health bar color based on health
    if (enemyHealthPercentage < 25) enemyHealth.style.backgroundColor = '#e74c3c'; // Red
    else if (enemyHealthPercentage < 50) enemyHealth.style.backgroundColor = '#f39c12'; // Orange
    else enemyHealth.style.backgroundColor = '#27ae60'; // Green

    // Check if enemy is defeated
    if (enemyCurrentHealth <= 0) {
        battleVictory();
    }
}

// Enemy attack function (automatic based on interval)
function enemyAttack() {
    if (!battleInProgress || enemyCurrentHealth <= 0 || playerCurrentHealth <= 0) return; // Stop if battle ended

    // Animate enemy attack
    enemyCharacter.classList.add('attack-animation');
    setTimeout(() => enemyCharacter.classList.remove('attack-animation'), 200);

    // Calculate damage (Enemy Attack vs Player Defense)
    const randomFactor = 0.8 + Math.random() * 0.4; // 80% to 120% damage variance
    const damageTaken = Math.max(1, Math.floor((currentEnemy.attack * randomFactor) - (playerDefense * 0.6))); // Player defense reduces more damage

    // Animate player taking damage
    playerCharacter.classList.add('damaged-animation');
    setTimeout(() => playerCharacter.classList.remove('damaged-animation'), 200);

    // Show damage number on player
    showNumberAnimation(playerCharacter, damageTaken, false);

    // Reduce player health
    playerCurrentHealth = Math.max(0, playerCurrentHealth - damageTaken);
    const playerHealthPercentage = (playerCurrentHealth / playerMaxHealth) * 100;
    playerHealth.style.width = playerHealthPercentage + '%';

    // Change player health bar color based on health
    if (playerHealthPercentage < 25) playerHealth.style.backgroundColor = '#e74c3c'; // Red
    else if (playerHealthPercentage < 50) playerHealth.style.backgroundColor = '#f39c12'; // Orange
    else playerHealth.style.backgroundColor = '#27ae60'; // Green

    // Check if player is defeated
    if (playerCurrentHealth <= 0) {
        battleDefeat();
    }
}

// Show healing orb
function showHealingOrb() {
    if (!battleInProgress || playerCurrentHealth <= 0 || enemyCurrentHealth <= 0) return; // Don't show if battle ended

    const containerRect = battleContainer.getBoundingClientRect();
    const orbSize = 40; // Match CSS

    // Ensure orb appears within the visible bounds of the container
    // Adjusting for potential padding/margins if needed
    const randomX = Math.floor(Math.random() * (containerRect.width - orbSize));
    const randomY = Math.floor(Math.random() * (containerRect.height - orbSize * 2)) + orbSize; // Avoid very top/bottom

    healingOrb.style.left = `${randomX}px`;
    healingOrb.style.top = `${randomY}px`;
    healingOrb.style.display = 'flex';

    // Auto hide after a short time
    setTimeout(() => {
        if (healingOrb.style.display !== 'none') {
            healingOrb.style.display = 'none';
        }
    }, 2000); // Orb visible for 2 seconds
}

// Handle healing orb click
function healPlayer() {
    if (!battleInProgress || playerCurrentHealth <= 0 || playerCurrentHealth >= playerMaxHealth) return; // No healing if defeated or full health

    healingOrb.style.display = 'none'; // Hide orb immediately

    // Apply healing
    const healValue = healAmount; // Use potentially buffed heal amount
    const healthBeforeHeal = playerCurrentHealth;
    playerCurrentHealth = Math.min(playerMaxHealth, playerCurrentHealth + healValue);
    const actualHealed = playerCurrentHealth - healthBeforeHeal; // How much was actually healed

    if (actualHealed > 0) {
        // Update health bar
        const healthPercentage = (playerCurrentHealth / playerMaxHealth) * 100;
        playerHealth.style.width = healthPercentage + '%';

        // Show healing effect number
        showNumberAnimation(playerCharacter, actualHealed, true);

        // Change health bar color if needed
        if (healthPercentage >= 50) playerHealth.style.backgroundColor = '#27ae60';
        else if (healthPercentage >= 25) playerHealth.style.backgroundColor = '#f39c12';

        addBattleMessage('system', `You healed for ${actualHealed} HP!`);
    }
}

// End the battle (common cleanup)
function endBattle() {
    battleInProgress = false;
    clearInterval(enemyAttackInterval);
    clearInterval(healingOrbInterval);
    enemyAttackInterval = null;
    healingOrbInterval = null;
    healingOrb.style.display = 'none';
    // Re-enable start button from quiz script if needed
    if (typeof enableQuizStartButton === 'function') {
        enableQuizStartButton('Start New Battle'); // Or 'Try Again' on defeat
    }
}

// Battle victory function
function battleVictory() {
    addBattleMessage('system', `Victory! You defeated the ${currentEnemy.name}!`);
    endBattle();
    calculateRewards();

    // Update user data
    const userData = loadUserData();
    userData.xp += currentEnemy.rewards.xp;

    // Check for level up
    const xpForNextLevel = userData.level * 100;
    if (userData.xp >= xpForNextLevel) {
        userData.level++;
        userData.xp -= xpForNextLevel;
        addBattleMessage('system', `Level up! You reached level ${userData.level}!`);

        // Optional: Increase a random stat on level up
        const stats = ['intelligence', 'sports', 'languages', 'energy', 'creativity', 'health'];
        const randomStat = stats[Math.floor(Math.random() * stats.length)];
        userData.stats[randomStat] = (userData.stats[randomStat] || 0) + 1; // Ensure stat exists before incrementing
        addBattleMessage('system', `Your ${randomStat} increased by 1!`);
    }

    // Add items to inventory (if inventory system existed)
    // For now, just log the rewards found
    battleRewards.forEach(reward => {
         addBattleMessage('reward', `${reward.icon} Found ${reward.name}`);
         // If you re-implement inventory:
         // find or create item stack and increment quantity
    });

    saveUserData(userData);
    // Re-enable the start button via the quiz script interface
     if (typeof enableQuizStartButton === 'function') {
        enableQuizStartButton('Start New Battle');
    }
}

// Calculate and log battle rewards
function calculateRewards() {
    battleRewards = []; // Reset rewards for this battle
    const rewards = currentEnemy.rewards;

    addBattleMessage('reward', `🏆 Gained ${rewards.xp} XP`);

    // Item drops based on chances
    if (rewards.items) {
        rewards.items.forEach(item => {
            if (Math.random() < item.chance) {
                battleRewards.push({ name: item.name, icon: item.icon });
                // Message added in battleVictory after saving data
            }
        });
    }

    // Example: Chance for a random low-tier equipment drop
    if (Math.random() < 0.05) { // 5% chance
        const basicWeapons = ['sword', 'staff', 'bow'];
        const basicOutfits = ['casual', 'formal']; // Example items
        const dropType = Math.random() < 0.5 ? 'weapon' : 'outfit';
        let droppedItemName = '';
        let droppedItemIcon = '❓';

        if (dropType === 'weapon') {
            droppedItemName = basicWeapons[Math.floor(Math.random() * basicWeapons.length)];
            const icons = {'sword': '🗡️', 'staff': '🔮', 'bow': '🏹'};
            droppedItemIcon = icons[droppedItemName];
        } else {
            droppedItemName = basicOutfits[Math.floor(Math.random() * basicOutfits.length)];
            const icons = {'casual': '👕', 'formal': '👔'};
            droppedItemIcon = icons[droppedItemName];
        }

        battleRewards.push({
            name: `${droppedItemName.charAt(0).toUpperCase() + droppedItemName.slice(1)} (${dropType})`,
            icon: droppedItemIcon
        });
         // Message added in battleVictory
    }
}

// Battle defeat function
function battleDefeat() {
    addBattleMessage('system', `Defeat! You were vanquished by the ${currentEnemy.name}!`);
    endBattle();

    // Reduce a life
    const userData = loadUserData();
    if (userData.lives > 0) {
        userData.lives -= 1;
        addBattleMessage('system', `You lost a life! Lives remaining: ${userData.lives}`);
    } else {
        addBattleMessage('system', `You are out of lives! Come back tomorrow.`);
    }
    saveUserData(userData);
     // Re-enable the start button via the quiz script interface
     if (typeof enableQuizStartButton === 'function') {
        enableQuizStartButton('Try Again');
    }
}


// This function will be called by battle_quiz.js to start the actual fight
function startActualBattle(buffs) {
    console.log("startActualBattle called with buffs:", buffs);
    if (battleInProgress) return;

    const userData = loadUserData();
    if (userData.lives <= 0) {
        addBattleMessage('system', 'You have no lives left! Come back tomorrow.');
        // Ensure quiz button is re-enabled if possible
        if (typeof enableQuizStartButton === 'function') {
             enableQuizStartButton('No Lives Left');
        }
        return;
    }

    battleInProgress = true;
    battleMessages.innerHTML = ''; // Clear previous messages
    battleRewards = [];

    // Calculate base stats first
    calculatePlayerBaseStats();

    // Apply buffs/debuffs from quiz
    playerDamage = Math.floor(basePlayerDamage * buffs.damage);
    healAmount = Math.floor(baseHealAmount * buffs.healing);
    playerDefense = Math.floor(basePlayerDefense * buffs.defense);

    addBattleMessage('system', 'Battle starting...');
    if (buffs.damage > 1) addBattleMessage('system', `Quiz buff: Damage increased!`);
    else if (buffs.damage < 1) addBattleMessage('system', `Quiz debuff: Damage decreased!`);
    if (buffs.healing > 1) addBattleMessage('system', `Quiz buff: Healing increased!`);
    else if (buffs.healing < 1) addBattleMessage('system', `Quiz debuff: Healing decreased!`);
    if (buffs.defense > 1) addBattleMessage('system', `Quiz buff: Defense increased!`);
    else if (buffs.defense < 1) addBattleMessage('system', `Quiz debuff: Defense decreased!`);

    // Set player health for this battle
    playerCurrentHealth = playerMaxHealth;

    // Set up enemy and update UI
    setupEnemy();
    updatePlayerAppearance(); // Ensure player appearance is current

    // Show the battle container
    battleContainer.style.display = 'flex';

    // Start intervals
    if (enemyAttackInterval) clearInterval(enemyAttackInterval);
    enemyAttackInterval = setInterval(enemyAttack, currentEnemy.attackSpeed);

    if (healingOrbInterval) clearInterval(healingOrbInterval);
    healingOrbInterval = setInterval(showHealingOrb, 4000 + Math.random() * 4000); // 4-8 seconds
}

// Make startActualBattle globally accessible for battle_quiz.js
window.startActualBattle = startActualBattle;

// Event Listeners
enemyCharacter.addEventListener('click', playerAttack);
healingOrb.addEventListener('click', healPlayer);

backToMenuButton.addEventListener('click', function() {
    // Stop intervals before navigating away
    if (enemyAttackInterval) clearInterval(enemyAttackInterval);
    if (healingOrbInterval) clearInterval(healingOrbInterval);
    window.location.href = 'index.html';
});

// Navigation Icon Listeners (Copied from script.js, adjusted)
document.querySelectorAll('.icon').forEach(icon => {
    icon.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        console.log("Icon clicked:", action);
        if (action === 'games') {
            window.location.href = 'index.html';
        } else if (action === 'stats') {
            window.location.href = 'stats.html';
        } else if (action === 'battle') {
            // Already on battle page, maybe refresh or do nothing?
            window.location.reload(); // Simple reload for now
        }
    });
});

// Theme switcher functionality (Copied from script.js)
const themeButtons = document.querySelectorAll(".theme-switcher button");
themeButtons.forEach(button => {
  button.addEventListener("click", function() {
    const themeId = this.id;
    console.log("Theme button clicked:", themeId);
    document.body.className = themeId; // Set body class directly
    try {
      localStorage.setItem("preferred-theme", themeId);
    } catch (e) {
      console.error("Error saving theme preference:", e);
    }
  });
});

// Load saved theme preference (Copied from script.js)
function loadThemePreference() {
    try {
        const savedTheme = localStorage.getItem("preferred-theme");
        if (savedTheme && ["colorful-theme", "light-theme", "dark-theme"].includes(savedTheme)) {
            document.body.className = savedTheme;
        } else {
            document.body.className = "colorful-theme"; // Default theme
        }
    } catch (e) {
        console.error("Error loading theme preference:", e);
        document.body.className = "colorful-theme"; // Fallback to default
    }
}


// Initialize the page
window.onload = function() {
    console.log("Battle page loaded");
    loadThemePreference(); // Load theme first
    updatePlayerAppearance(); // Load player visuals initially
    // The battle itself is started by battle_quiz.js calling startActualBattle
    // Hide the battle container initially, quiz will show it
    if(battleContainer) {
        battleContainer.style.display = 'none';
    }
};