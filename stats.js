// Initialize Telegram Web App compatibility
let tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
    tg.expand();
}

// DOM Elements
const levelValue = document.getElementById("level-value");
const xpValue = document.getElementById("xp-value");
const xpNextLevel = document.getElementById("xp-next-level");
const xpFill = document.getElementById("xp-fill");
const livesContainer = document.getElementById("lives-container");
const buffsContainer = document.getElementById("buffs-container"); // For room buffs
// Attribute Value Elements
const intelligenceValueEl = document.getElementById("intelligence-value");
const sportsValueEl = document.getElementById("sports-value");
const languagesValueEl = document.getElementById("languages-value");
const energyValueEl = document.getElementById("energy-value");
const creativityValueEl = document.getElementById("creativity-value");
const healthValueEl = document.getElementById("health-value");
// Buttons
const customizeButton = document.getElementById("customize-button");
const petButton = document.getElementById("pet-button");
const backToHomeButton = document.getElementById("back-to-home");
// Modal Elements
const customizationModal = document.getElementById("customization-modal");
const closeModalButton = customizationModal ? customizationModal.querySelector(".close") : null;
const modalContent = customizationModal ? customizationModal.querySelector(".customization-content") : null;
// Character & Pet Display
const characterContainer = document.getElementById("character-base");
const petDisplay = document.getElementById("pet-display");
const petBase = document.getElementById("pet-base"); // Container inside petDisplay
// Equipment & Achievements
const equipmentContainer = document.querySelector(".equipment-container");
const achievementsList = document.getElementById("achievements-list");

// User data storage
let userData;

// Default data structure (important for merging and ensuring keys exist)
const defaultUserData = {
    level: 1, xp: 0, lives: 5, lastPlayed: new Date().toISOString(),
    stats: { intelligence: 10, sports: 5, languages: 3, energy: 8, creativity: 7, health: 10 },
    equipment: { skin: 'light', outfit: 'casual', headgear: 'none', weapon: 'none' },
    pet: { unlocked: false, type: 'cat', color: 'default', accessory: 'none', abilities: { loyalty: 50, intelligence: 70, speed: 60, strength: 40 } },
    achievements: { memoryMaster: false, mathWizard: false, dailyStreak: false /* Add more keys here */ },
    records: { mathTime: [] },
    room: { theme: 'default', items: [] } // Keep room data for buffs
};

// Character customization options (same as before)
const characterOptions = {
    skin: ['light', 'medium', 'dark', 'fantasy'],
    outfit: ['none', 'casual', 'formal', 'warrior', 'mage'], // Added 'none' option
    headgear: ['none', 'hat', 'crown', 'helmet'],
    weapon: ['none', 'sword', 'staff', 'bow']
};

// Pet customization options (assuming pet functionality might be added back later)
const petOptions = {
    type: ['cat', 'dog', 'dragon', 'bird'],
    color: ['default', 'black', 'white', 'gold', 'blue'],
    accessory: ['none', 'bow', 'hat', 'glasses']
};

// Room items and their buffs (needed for display on stats page)
const roomItemBuffs = {
    bed: { buff: 'Energy +10%', buffIcon: '💤', statBoost: { energy: 10 } },
    desk: { buff: 'Intelligence +5%', buffIcon: '📝', statBoost: { intelligence: 5 } },
    bookshelf: { buff: 'Intelligence +10%', buffIcon: '📚', statBoost: { intelligence: 10 } },
    plant: { buff: 'Health +5%', buffIcon: '🌿', statBoost: { health: 5 } },
    poster: { buff: 'Creativity +8%', buffIcon: '🎨', statBoost: { creativity: 8 } },
    lamp: { buff: 'Energy +5%', buffIcon: '💡', statBoost: { energy: 5 } },
    rug: { buff: 'Comfort +10%', buffIcon: '🧶', statBoost: { health: 3, energy: 3 } }, // Example multi-stat buff
    computer: { buff: 'Intelligence +8%, Creativity +5%', buffIcon: '💻', statBoost: { intelligence: 8, creativity: 5 } }
};


// --- Data Handling ---

function loadUserData() {
    const savedData = localStorage.getItem('brainTrainingUserData');
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            // Deep merge with default structure to ensure all properties exist
            userData = mergeDeep(defaultUserData, parsedData);
            // Ensure arrays exist if they were missing in saved data
            if (!userData.records.mathTime) userData.records.mathTime = [];
            if (!userData.room.items) userData.room.items = [];
            if (!userData.achievements) userData.achievements = defaultUserData.achievements;
             if (!userData.pet) userData.pet = defaultUserData.pet; // Ensure pet object exists
            if (!userData.pet.abilities) userData.pet.abilities = defaultUserData.pet.abilities; // Ensure abilities exist
        } catch (e) {
            console.error("Error parsing user data:", e);
            userData = { ...defaultUserData }; // Use a copy of default data
        }
    } else {
        userData = { ...defaultUserData }; // Use a copy of default data if nothing is saved
    }
    console.log("Loaded User Data:", userData);
}

function saveUserData() {
    try {
        localStorage.setItem('brainTrainingUserData', JSON.stringify(userData));
        console.log("User Data Saved:", userData);
    } catch (e) {
        console.error("Error saving user data:", e);
    }
}

// Helper function for deep merging objects (to handle nested structures like stats, equipment)
function mergeDeep(target, source) {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                } else {
                    output[key] = mergeDeep(target[key], source[key]);
                }
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}


// --- UI Update Functions ---

function updateStatsDisplay() {
    if (!userData) return; // Don't run if data isn't loaded

    // Level and XP
    levelValue.textContent = userData.level;
    xpValue.textContent = userData.xp;
    const xpForNextLevel = userData.level * 100;
    xpNextLevel.textContent = xpForNextLevel;
    const xpPercentage = Math.min(100, (userData.xp / xpForNextLevel) * 100);
    xpFill.style.width = `${xpPercentage}%`;

    // Lives
    livesContainer.innerHTML = ''; // Clear existing icons
    const lifeCount = userData.lives || 0;
    for (let i = 0; i < 5; i++) { // Always show 5 slots
         const lifeIcon = document.createElement("div");
         lifeIcon.className = "life-icon";
         lifeIcon.textContent = i < lifeCount ? "❤️" : "🖤"; // Full or empty heart
         livesContainer.appendChild(lifeIcon);
     }


    // Attributes
    const stats = userData.stats;
    intelligenceValueEl.textContent = stats.intelligence || 0;
    sportsValueEl.textContent = stats.sports || 0;
    languagesValueEl.textContent = stats.languages || 0;
    energyValueEl.textContent = stats.energy || 0;
    creativityValueEl.textContent = stats.creativity || 0;
    healthValueEl.textContent = stats.health || 0;
    updateAttributeBar('intelligence', stats.intelligence);
    updateAttributeBar('sports', stats.sports);
    updateAttributeBar('languages', stats.languages);
    updateAttributeBar('energy', stats.energy);
    updateAttributeBar('creativity', stats.creativity);
    updateAttributeBar('health', stats.health);

    // Update other sections
    updateBuffsDisplay();
    loadEquipmentSlots();
    updateCharacterAppearance();
    updatePetAppearance();
    updateAchievementsDisplay();

     // Show/hide pet button based on unlock status
    if (userData.pet && userData.pet.unlocked) {
        petButton.style.display = 'inline-block'; // Or 'block' depending on layout
    } else {
        petButton.style.display = 'none';
    }
}

function updateAttributeBar(attribute, value) {
    const maxValue = 100; // Assuming 100 is the max for the bar display
    const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100)); // Clamp between 0-100
    const barFill = document.querySelector(`.${attribute}-fill`);
    if (barFill) {
        // Animate the bar fill
        barFill.style.width = '0%'; // Reset first
        setTimeout(() => {
            barFill.style.width = `${percentage}%`;
        }, 100); // Small delay for animation effect
    }
}

function updateBuffsDisplay() {
    if (!buffsContainer) return;
    buffsContainer.innerHTML = ''; // Clear previous buffs
    let hasBuffs = false;

    if (userData.room && userData.room.items && userData.room.items.length > 0) {
        userData.room.items.forEach(itemName => {
            if (roomItemBuffs[itemName]) {
                const itemBuff = roomItemBuffs[itemName];
                const buffItem = document.createElement('div');
                buffItem.className = 'buff-item';
                buffItem.innerHTML = `
                    <div class="buff-icon">${itemBuff.buffIcon || '⭐'}</div>
                    <div class="buff-text">${itemBuff.buff || 'Unknown Buff'}</div>
                `;
                buffsContainer.appendChild(buffItem);
                hasBuffs = true;
            }
        });
    }

    if (!hasBuffs) {
        buffsContainer.innerHTML = '<div class="no-buffs">No active buffs from room items</div>';
    }
}

function loadEquipmentSlots() {
    if (!equipmentContainer) return;
    equipmentContainer.innerHTML = ''; // Clear existing slots

    const equipmentOrder = ['headgear', 'outfit', 'weapon', 'skin']; // Define order
    const equipmentIcons = {
        headgear: { none: '?', hat: '🎩', crown: '👑', helmet: '🛡️' },
        outfit: { none: '?', casual: '👕', formal: '👔', warrior: '⚔️', mage: '🔮' },
        weapon: { none: '?', sword: '🗡️', staff: '🌟', bow: '🏹' },
        skin: { light: '🖐🏻', medium: '🖐🏽', dark: '🖐🏿', fantasy: '👽' } // Example icons for skin
    };
    const equipmentLabels = {
        headgear: 'Head', outfit: 'Body', weapon: 'Weapon', skin: 'Skin'
    };

    equipmentOrder.forEach(slotType => {
        const currentItem = userData.equipment[slotType] || (slotType === 'skin' ? 'light' : 'none');
        const isEmpty = currentItem === 'none' && slotType !== 'skin';
        const iconText = equipmentIcons[slotType]?.[currentItem] || '?';

        const slotDiv = document.createElement('div');
        slotDiv.className = 'equipment-slot';
        slotDiv.setAttribute('data-slot', slotType);

        const nameDiv = document.createElement('div');
        nameDiv.className = 'slot-name';
        nameDiv.textContent = equipmentLabels[slotType] || slotType;

        const iconDiv = document.createElement('div');
        iconDiv.className = `slot-icon ${isEmpty ? 'empty' : 'equipped'}`;
        iconDiv.textContent = iconText;

        slotDiv.appendChild(nameDiv);
        slotDiv.appendChild(iconDiv);

        // Make slots clickable to open customization modal
        slotDiv.addEventListener('click', () => {
             openCustomizationModal('character'); // Open character modal when any equipment slot is clicked
        });

        equipmentContainer.appendChild(slotDiv);
    });
}

function updateCharacterAppearance() {
    if (!characterContainer || !userData || !userData.equipment) return;

    // Build class list based on equipment
    let classes = ['character-container'];
    classes.push(`skin-${userData.equipment.skin || 'light'}`);
    if (userData.equipment.outfit && userData.equipment.outfit !== 'none') {
        classes.push(`outfit-${userData.equipment.outfit}`);
    }
    if (userData.equipment.headgear && userData.equipment.headgear !== 'none') {
        classes.push(`headgear-${userData.equipment.headgear}`);
    }
    if (userData.equipment.weapon && userData.equipment.weapon !== 'none') {
        classes.push(`weapon-${userData.equipment.weapon}`);
    }

    characterContainer.className = classes.join(' ');

    // Ensure inner structure for CSS targeting exists
     characterContainer.innerHTML = `
        <div id="char-base" class="char-layer"></div>
        <div id="char-body" class="char-layer"></div>
        <div id="char-outfit" class="char-layer"></div>
        <div id="char-head" class="char-layer"></div>
        <div id="char-face" class="char-layer"><div id="char-mouth"></div></div>
        <div id="char-headgear" class="char-layer"></div>
        <div id="char-weapon" class="char-layer"></div>
    `;
}

function updatePetAppearance() {
     if (!petDisplay || !petBase || !userData || !userData.pet) return;

    if (userData.pet.unlocked) {
        petDisplay.style.display = 'block'; // Show the container

        let classes = ['pet-container'];
        classes.push(`pet-type-${userData.pet.type || 'cat'}`);
        classes.push(`pet-color-${userData.pet.color || 'default'}`);
        if (userData.pet.accessory && userData.pet.accessory !== 'none') {
            classes.push(`pet-accessory-${userData.pet.accessory}`);
        }

        petBase.className = classes.join(' ');

         // Ensure inner structure for CSS targeting exists
         petBase.innerHTML = `
            <div id="pet-body" class="pet-layer"></div>
            <div id="pet-head" class="pet-layer"></div>
            <div id="pet-face" class="pet-layer"><div id="pet-mouth"></div></div>
            <div id="pet-accessory" class="pet-layer"></div>
        `;

    } else {
        petDisplay.style.display = 'none'; // Hide if not unlocked
    }
}


function updateAchievementsDisplay() {
    if (!achievementsList) return;
    achievementsList.innerHTML = ''; // Clear current list

     // Define all possible achievements here
    const allAchievements = {
        memoryMaster: { name: "Memory Master", desc: "Remember 30 words", icon: "🧠" },
        mathWizard: { name: "Math Wizard", desc: "Solve 87 problems < 4min", icon: "🔢" },
        // dailyStreak: { name: "Daily Streak", desc: "Play 7 days in a row", icon: "📅" } // Example
    };

     Object.keys(allAchievements).forEach(key => {
        const achievementData = allAchievements[key];
        const isUnlocked = userData.achievements && userData.achievements[key]; // Check if unlocked

        const achievementDiv = document.createElement('div');
        achievementDiv.id = `achievement-${key}`;
        achievementDiv.className = `achievement ${isUnlocked ? 'unlocked' : 'locked'}`;

        achievementDiv.innerHTML = `
            <div class="achievement-icon">${isUnlocked ? achievementData.icon : '❓'}</div>
            <div class="achievement-info">
                <div class="achievement-name">${achievementData.name}</div>
                <div class="achievement-desc">${achievementData.desc}</div>
            </div>
            ${isUnlocked ? '<div class="checkmark">✔️</div>' : ''} <!-- Optional checkmark -->
        `;
         achievementsList.appendChild(achievementDiv);
    });
}

// --- Modal Functions ---

function openCustomizationModal(type = 'character') { // 'character' or 'pet'
    if (!customizationModal || !modalContent) return;

    modalContent.innerHTML = ''; // Clear previous content

    // Add close button
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => customizationModal.style.display = 'none';
    modalContent.appendChild(closeBtn);

    // Add title
    const title = document.createElement('h2');
    title.textContent = type === 'pet' ? 'Pet Customization' : 'Character Customization';
    modalContent.appendChild(title);

    if (type === 'character') {
        populateCharacterModal();
    } else if (type === 'pet') {
        populatePetModal();
    }

    // Add Save/Close button for the modal
    const bottomButtonContainer = document.createElement('div');
    bottomButtonContainer.style.textAlign = 'center'; // Center the button
    bottomButtonContainer.style.marginTop = '20px';

    const closeButton = document.createElement('button');
    closeButton.className = 'action-button'; // Use consistent button style
    closeButton.textContent = 'Close';
    closeButton.onclick = () => customizationModal.style.display = 'none';
    bottomButtonContainer.appendChild(closeButton);
    modalContent.appendChild(bottomButtonContainer);


    customizationModal.style.display = 'block';
}

function populateCharacterModal() {
    for (const [category, options] of Object.entries(characterOptions)) {
        const section = document.createElement("div");
        section.className = "customization-section";

        const sectionTitle = document.createElement("h3");
        sectionTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        section.appendChild(sectionTitle);

        const optionsContainer = document.createElement("div");
        optionsContainer.className = "options-container";

        options.forEach(optionValue => {
            const optionButton = document.createElement("button");
            optionButton.className = "option-button";
            // Check if this is the currently selected option
            if (userData.equipment[category] === optionValue) {
                optionButton.classList.add("selected");
            }
            optionButton.textContent = optionValue.charAt(0).toUpperCase() + optionValue.slice(1);
            optionButton.setAttribute("data-category", category);
            optionButton.setAttribute("data-option", optionValue);

            optionButton.addEventListener("click", function() {
                // Update visually selected button
                document.querySelectorAll(`.option-button[data-category="${category}"]`).forEach(btn => {
                    btn.classList.remove("selected");
                });
                this.classList.add("selected");

                // Update user data
                userData.equipment[category] = optionValue;
                saveUserData(); // Save changes immediately

                // Update character appearance live
                updateCharacterAppearance();
                loadEquipmentSlots(); // Update equipment slots display
            });

            optionsContainer.appendChild(optionButton);
        });

        section.appendChild(optionsContainer);
        modalContent.appendChild(section);
    }
}


function populatePetModal() {
     // Check if pet is unlocked
    if (!userData.pet || !userData.pet.unlocked) {
        const petLockedMessage = document.createElement("div");
        petLockedMessage.style.textAlign = 'center';
        petLockedMessage.style.padding = '20px';
        petLockedMessage.innerHTML = `
            <div style="font-size: 3em; margin-bottom: 15px;">🔒</div>
            <p style="margin-bottom: 20px;">You don't have a pet yet! Find one on your adventures or in the (future) shop.</p>
            <button id="unlock-pet-demo" class="action-button">Unlock Demo Pet</button> <!-- Demo button -->
        `;
        modalContent.appendChild(petLockedMessage);

        // Add demo unlock button functionality
        const unlockDemoButton = modalContent.querySelector("#unlock-pet-demo");
        if(unlockDemoButton) {
            unlockDemoButton.addEventListener("click", function() {
                userData.pet.unlocked = true;
                // Optionally set default pet type if needed
                if (!userData.pet.type) userData.pet.type = 'cat';
                 if (!userData.pet.color) userData.pet.color = 'default';
                 if (!userData.pet.accessory) userData.pet.accessory = 'none';
                saveUserData();
                updatePetAppearance(); // Update main page appearance
                openCustomizationModal('pet'); // Re-open the modal, now unlocked
            });
        }
        return; // Stop here if pet is locked
    }


    // If unlocked, show customization options
     for (const [category, options] of Object.entries(petOptions)) {
        const section = document.createElement("div");
        section.className = "customization-section";

        const sectionTitle = document.createElement("h3");
        sectionTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        section.appendChild(sectionTitle);

        const optionsContainer = document.createElement("div");
        optionsContainer.className = "options-container";

        options.forEach(optionValue => {
            const optionButton = document.createElement("button");
            optionButton.className = "option-button";
            // Check if this is the currently selected option
            if (userData.pet[category] === optionValue) {
                optionButton.classList.add("selected");
            }
            optionButton.textContent = optionValue.charAt(0).toUpperCase() + optionValue.slice(1);
            optionButton.setAttribute("data-category", category);
            optionButton.setAttribute("data-option", optionValue);

            optionButton.addEventListener("click", function() {
                // Update visually selected button
                document.querySelectorAll(`.option-button[data-category="${category}"]`).forEach(btn => {
                    btn.classList.remove("selected");
                });
                this.classList.add("selected");

                // Update user data
                userData.pet[category] = optionValue;
                saveUserData(); // Save changes immediately

                // Update pet appearance live
                updatePetAppearance();
            });

            optionsContainer.appendChild(optionButton);
        });

        section.appendChild(optionsContainer);
        modalContent.appendChild(section);
    }

     // Display pet abilities (read-only for now)
    const abilitiesSection = document.createElement("div");
    abilitiesSection.className = "customization-section";
    abilitiesSection.innerHTML = `<h3>Pet Abilities</h3>`;
    const abilitiesGrid = document.createElement("div");
    abilitiesGrid.className = "attributes-grid"; // Reuse attribute styling

     if (userData.pet.abilities) {
         for (const [ability, value] of Object.entries(userData.pet.abilities)) {
            const abilityDiv = document.createElement('div');
            abilityDiv.className = 'attribute'; // Reuse attribute style
            abilityDiv.innerHTML = `
                <div class="attribute-name">${ability.charAt(0).toUpperCase() + ability.slice(1)}</div>
                <div class="attribute-bar"><div class="attribute-fill" style="width: ${Math.min(100, value)}%; background-color: #f39c12;"></div></div> <!-- Example color -->
                <div class="attribute-value">${value}</div>
            `;
            abilitiesGrid.appendChild(abilityDiv);
        }
     } else {
         abilitiesGrid.innerHTML = "<p>No ability data found.</p>";
     }
    abilitiesSection.appendChild(abilitiesGrid);
    modalContent.appendChild(abilitiesSection);
}


// --- Event Listeners ---

customizeButton.addEventListener('click', () => openCustomizationModal('character'));
petButton.addEventListener('click', () => openCustomizationModal('pet'));
backToHomeButton.addEventListener('click', () => window.location.href = 'index.html');

// Close modal listeners
if (closeModalButton) {
    closeModalButton.addEventListener('click', () => {
        if (customizationModal) customizationModal.style.display = 'none';
    });
}
window.addEventListener('click', (event) => {
    if (event.target === customizationModal) {
        if (customizationModal) customizationModal.style.display = 'none';
    }
});

// Navigation Icon Listeners
document.querySelectorAll('.icon').forEach(icon => {
    icon.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        if (action === 'games') {
            window.location.href = 'index.html';
        } else if (action === 'stats') {
            // Already here, maybe refresh?
             window.location.reload();
        } else if (action === 'battle') {
            window.location.href = 'battle.html';
        }
        // No inventory or room actions
    });
});

// Theme switcher listeners
document.querySelectorAll(".theme-switcher button").forEach(button => {
  button.addEventListener("click", function() {
    const themeId = this.id;
    document.body.className = themeId;
    localStorage.setItem("preferred-theme", themeId);
  });
});

// Load theme preference on page load
function loadThemePreference() {
    const savedTheme = localStorage.getItem("preferred-theme");
    if (savedTheme && ["colorful-theme", "light-theme", "dark-theme"].includes(savedTheme)) {
        document.body.className = savedTheme;
    } else {
        document.body.className = "colorful-theme"; // Default
    }
}


// --- Initialization ---
window.onload = function() {
    console.log("Stats page loaded");
    loadUserData(); // Load data first
    loadThemePreference(); // Apply theme
    updateStatsDisplay(); // Populate the page with data
};