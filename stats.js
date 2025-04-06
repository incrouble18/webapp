// Initialize Telegram Web App compatibility (can run without Telegram too)
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
const intelligenceValue = document.getElementById("intelligence-value");
const sportsValue = document.getElementById("sports-value");
const languagesValue = document.getElementById("languages-value");
const energyValue = document.getElementById("energy-value");
const creativityValue = document.getElementById("creativity-value");
const healthValue = document.getElementById("health-value");
const customizeButton = document.getElementById("customize-button");
const petButton = document.getElementById("pet-button");
const backToHomeButton = document.getElementById("back-to-home");
const customizationModal = document.getElementById("customization-modal");
const closeModal = document.querySelector(".close");
const characterContainer = document.getElementById("character-base");
const petDisplay = document.getElementById("pet-display");

// Equipment slots
const equipmentSlots = document.querySelectorAll(".equipment-slot");

// User data from localStorage
let userData;

// Character customization options
const characterOptions = {
    skin: ['light', 'medium', 'dark', 'fantasy'],
    outfit: ['casual', 'formal', 'warrior', 'mage'],
    headgear: ['none', 'hat', 'crown', 'helmet'],
    weapon: ['none', 'sword', 'staff', 'bow']
};

// Pet customization options
const petOptions = {
    type: ['cat', 'dog', 'dragon', 'bird'],
    color: ['default', 'black', 'white', 'gold', 'blue'],
    accessory: ['none', 'bow', 'hat', 'glasses']
};

// Load user data
function loadUserData() {
    const savedData = localStorage.getItem('brainTrainingUserData');
    if (savedData) {
        userData = JSON.parse(savedData);
        
        // Add missing stats if they don't exist yet
        if (!userData.stats.energy) userData.stats.energy = 8;
        if (!userData.stats.creativity) userData.stats.creativity = 7;
        if (!userData.stats.health) userData.stats.health = 10;
        
        // Add equipment if it doesn't exist
        if (!userData.equipment) {
            userData.equipment = {
                skin: 'light',
                outfit: 'casual',
                headgear: 'none',
                weapon: 'none'
            };
        }
        
        // Add pet if it doesn't exist
        if (!userData.pet) {
            userData.pet = {
                unlocked: false,
                type: 'cat',
                color: 'default',
                accessory: 'none',
                abilities: {
                    loyalty: 50,
                    intelligence: 70,
                    speed: 60,
                    strength: 40
                }
            };
        }
        
        // Add achievements if they don't exist
        if (!userData.achievements) {
            userData.achievements = {
                memoryMaster: false,
                mathWizard: false,
                dailyStreak: false
            };
        }
        
        saveUserData();
    } else {
        // Create default user data
        userData = {
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
                unlocked: false,
                type: 'cat',
                color: 'default',
                accessory: 'none',
                abilities: {
                    loyalty: 50,
                    intelligence: 70,
                    speed: 60
                    strength: 40
                }
            },
            achievements: {
                memoryMaster: false,
                mathWizard: false,
                dailyStreak: false
            },
            inventory: []
        };
        saveUserData();
    }
}

// Save user data
function saveUserData() {
    localStorage.setItem('brainTrainingUserData', JSON.stringify(userData));
}

// Update the character stats display
function updateStatsDisplay() {
    // Level and XP
    levelValue.textContent = userData.level;
    xpValue.textContent = userData.xp;
    const xpForNextLevel = userData.level * 100;
    xpNextLevel.textContent = xpForNextLevel;
    
    // XP progress bar
    const xpPercentage = Math.min(100, (userData.xp / xpForNextLevel) * 100);
    xpFill.style.width = `${xpPercentage}%`;
    
    // Lives
    livesContainer.innerHTML = '';
    for (let i = 0; i < userData.lives; i++) {
        const lifeIcon = document.createElement("div");
        lifeIcon.className = "life-icon";
        lifeIcon.textContent = "❤️";
        livesContainer.appendChild(lifeIcon);
    }
    
    // Attributes with animated bars
    updateAttributeBar('intelligence', userData.stats.intelligence);
    updateAttributeBar('sports', userData.stats.sports);
    updateAttributeBar('languages', userData.stats.languages);
    updateAttributeBar('energy', userData.stats.energy);
    updateAttributeBar('creativity', userData.stats.creativity);
    updateAttributeBar('health', userData.stats.health);
    
    // Set attribute values
    intelligenceValue.textContent = userData.stats.intelligence;
    sportsValue.textContent = userData.stats.sports;
    languagesValue.textContent = userData.stats.languages;
    energyValue.textContent = userData.stats.energy;
    creativityValue.textContent = userData.stats.creativity;
    healthValue.textContent = userData.stats.health;
    
    // Update achievements
    updateAchievements();
    
    // Update buffs
    updateBuffsDisplay();
}

// Update attribute bars with animation
function updateAttributeBar(attribute, value) {
    const maxValue = 100; // Maximum possible value
    const percentage = (value / maxValue) * 100;
    const bar = document.querySelector(`.${attribute}-fill`);
    
    // Set initial width to 0
    bar.style.width = '0%';
    
    // Use setTimeout to create a delay for animation effect
    setTimeout(() => {
        bar.style.width = `${percentage}%`;
    }, 100);
}

// Update achievements display
function updateAchievements() {
    const memoryAchievement = document.getElementById('achievement-memory');
    const mathAchievement = document.getElementById('achievement-math');
    const streakAchievement = document.getElementById('achievement-streak');
    
    if (userData.achievements.memoryMaster) {
        memoryAchievement.classList.remove('locked');
        memoryAchievement.classList.add('unlocked');
    }
    
    if (userData.achievements.mathWizard) {
        mathAchievement.classList.remove('locked');
        mathAchievement.classList.add('unlocked');
    }
    
    if (userData.achievements.dailyStreak) {
        streakAchievement.classList.remove('locked');
        streakAchievement.classList.add('unlocked');
    }
}

// Update buffs display
function updateBuffsDisplay() {
    const buffsContainer = document.getElementById('buffs-container');
    buffsContainer.innerHTML = '';
    
    // Check if user has room items that provide buffs
    if (userData.room && userData.room.items && userData.room.items.length > 0) {
        const roomItems = {
            bed: { buff: 'Energy +10%', buffIcon: '💤' },
            desk: { buff: 'Intelligence +5%', buffIcon: '📝' },
            bookshelf: { buff: 'Intelligence +10%', buffIcon: '📚' },
            plant: { buff: 'Health +5%', buffIcon: '🌿' },
            poster: { buff: 'Creativity +8%', buffIcon: '🎨' },
            lamp: { buff: 'Energy +5%', buffIcon: '💡' },
            rug: { buff: 'Comfort +10%', buffIcon: '🧶' },
            computer: { buff: 'Intelligence +8%, Creativity +5%', buffIcon: '💻' }
        };
        
        userData.room.items.forEach(itemName => {
            const item = roomItems[itemName];
            if (item) {
                const buffItem = document.createElement('div');
                buffItem.className = 'buff-item';
                buffItem.innerHTML = `
                    <div class="buff-icon">${item.buffIcon}</div>
                    <div class="buff-text">${item.buff}</div>
                `;
                buffsContainer.appendChild(buffItem);
            }
        });
    } else {
        // No buffs
        const noBuffs = document.createElement('div');
        noBuffs.className = 'no-buffs';
        noBuffs.textContent = 'No active buffs';
        buffsContainer.appendChild(noBuffs);
    }
}

// Load equipment slots
function loadEquipmentSlots() {
    equipmentSlots.forEach(slot => {
        const slotType = slot.getAttribute("data-slot");
        
        // Update slot icons based on equipped items
        if (slotType === "head" && userData.equipment.headgear !== 'none') {
            slot.querySelector(".slot-icon").classList.remove("empty");
            slot.querySelector(".slot-icon").classList.add("equipped");
            slot.querySelector(".slot-icon").innerHTML = userData.equipment.headgear[0].toUpperCase();
        } else if (slotType === "body" && userData.equipment.outfit !== 'none') {
            slot.querySelector(".slot-icon").classList.remove("empty");
            slot.querySelector(".slot-icon").classList.add("equipped");
            slot.querySelector(".slot-icon").innerHTML = userData.equipment.outfit[0].toUpperCase();
        } else if (slotType === "special" && userData.equipment.weapon !== 'none') {
            slot.querySelector(".slot-icon").classList.remove("empty");
            slot.querySelector(".slot-icon").classList.add("equipped");
            slot.querySelector(".slot-icon").innerHTML = userData.equipment.weapon[0].toUpperCase();
        } else if (slotType === "accessory") {
            // Accessory is not implemented yet
        }
    });
}

// Update character appearance based on equipment
function updateCharacterAppearance() {
    // Clear existing classes
    characterContainer.className = "character-container";
    
    // Apply skin class
    characterContainer.classList.add(`skin-${userData.equipment.skin}`);
    
    // Apply outfit class if not none
    if (userData.equipment.outfit !== 'none') {
        characterContainer.classList.add(`outfit-${userData.equipment.outfit}`);
    }
    
    // Apply headgear class if not none
    if (userData.equipment.headgear !== 'none') {
        characterContainer.classList.add(`headgear-${userData.equipment.headgear}`);
    }
    
    // Apply weapon class if not none
    if (userData.equipment.weapon !== 'none') {
        characterContainer.classList.add(`weapon-${userData.equipment.weapon}`);
    }
}

// Update pet appearance
function updatePetAppearance() {
    // Show/hide pet based on whether it's unlocked
    if (userData.pet && userData.pet.unlocked) {
        petDisplay.style.display = 'block';
        
        // Clear existing classes
        const petBase = document.getElementById('pet-base');
        petBase.className = 'pet-container';
        
        // Apply pet type and color
        petBase.classList.add(`pet-type-${userData.pet.type}`);
        petBase.classList.add(`pet-color-${userData.pet.color}`);
        
        // Apply pet accessory if not none
        if (userData.pet.accessory !== 'none') {
            petBase.classList.add(`pet-accessory-${userData.pet.accessory}`);
        }
    } else {
        petDisplay.style.display = 'none';
    }
}

// Create the customization modal content
function createCharacterCustomizationModal() {
    const modalContent = document.querySelector(".customization-content");
    
    // Clear existing content except the close button
    const closeButton = modalContent.querySelector(".close");
    modalContent.innerHTML = '';
    modalContent.appendChild(closeButton);
    
    // Add title
    const title = document.createElement("h2");
    title.textContent = "Character Customization";
    modalContent.appendChild(title);
    
    // Add customization categories
    for (const [category, options] of Object.entries(characterOptions)) {
        const section = document.createElement("div");
        section.className = "customization-section";
        
        const sectionTitle = document.createElement("h3");
        sectionTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        section.appendChild(sectionTitle);
        
        const optionsContainer = document.createElement("div");
        optionsContainer.className = "options-container";
        
        options.forEach(option => {
            const optionButton = document.createElement("button");
            optionButton.className = "option-button";
            if (userData.equipment[category] === option) {
                optionButton.classList.add("selected");
            }
            optionButton.textContent = option.charAt(0).toUpperCase() + option.slice(1);
            optionButton.setAttribute("data-category", category);
            optionButton.setAttribute("data-option", option);
            optionButton.addEventListener("click", function() {
                // Update selected option
                document.querySelectorAll(`.option-button[data-category="${category}"]`).forEach(btn => {
                    btn.classList.remove("selected");
                });
                this.classList.add("selected");
                
                // Update user data
                userData.equipment[category] = option;
                saveUserData();
                
                // Update character appearance
                updateCharacterAppearance();
                loadEquipmentSlots();
            });
            
            optionsContainer.appendChild(optionButton);
        });
        
        section.appendChild(optionsContainer);
        modalContent.appendChild(section);
    }
    
    // Add save button
    const saveButton = document.createElement("button");
    saveButton.className = "action-button";
    saveButton.textContent = "Save Changes";
    saveButton.addEventListener("click", function() {
        customizationModal.style.display = "none";
    });
    
    modalContent.appendChild(saveButton);
}

// Create pet customization modal content
function createPetCustomizationModal() {
    const modalContent = document.querySelector(".customization-content");
    
    // Clear existing content except the close button
    const closeButton = modalContent.querySelector(".close");
    modalContent.innerHTML = '';
    modalContent.appendChild(closeButton);
    
    // Add title
    const title = document.createElement("h2");
    title.textContent = "Pet Customization";
    modalContent.appendChild(title);
    
    // Check if pet is unlocked
    if (!userData.pet.unlocked) {
        const petLockedMessage = document.createElement("div");
        petLockedMessage.className = "pet-locked-message";
        petLockedMessage.innerHTML = `
            <div class="pet-locked-icon">🔒</div>
            <p>You don't have a pet yet! Check the inventory to unlock one.</p>
            <button id="unlock-pet-demo" class="action-button">Unlock Demo Pet</button>
        `;
        modalContent.appendChild(petLockedMessage);
        
        // Add demo unlock button functionality (for testing only)
        const unlockDemoButton = petLockedMessage.querySelector("#unlock-pet-demo");
        unlockDemoButton.addEventListener("click", function() {
            userData.pet.unlocked = true;
            saveUserData();
            updatePetAppearance();
            createPetCustomizationModal(); // Refresh the modal
        });
        
        return;
    }
    
    // Add customization categories for pet
    for (const [category, options] of Object.entries(petOptions)) {
        const section = document.createElement("div");
        section.className = "customization-section";
        
        const sectionTitle = document.createElement("h3");
        sectionTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        section.appendChild(sectionTitle);
        
        const optionsContainer = document.createElement("div");
        optionsContainer.className = "options-container";
        
        options.forEach(option => {
            const optionButton = document.createElement("button");
            optionButton.className = "option-button";
            if (userData.pet[category] === option) {
                optionButton.classList.add("selected");
            }
            optionButton.textContent = option.charAt(0).toUpperCase() + option.slice(1);
            optionButton.setAttribute("data-category", category);
            optionButton.setAttribute("data-option", option);
            optionButton.addEventListener("click", function() {
                // Update selected option
                document.querySelectorAll(`.option-button[data-category="${category}"]`).forEach(btn => {
                    btn.classList.remove("selected");
                });
                this.classList.add("selected");
                
                // Update user data
                userData.pet[category] = option;
                saveUserData();
                
                // Update pet appearance
                updatePetAppearance();
            });
            
            optionsContainer.appendChild(optionButton);
        });
        
        section.appendChild(optionsContainer);
        modalContent.appendChild(section);
    }
    
    // Add pet abilities section
    const abilitiesSection = document.createElement("div");
    abilitiesSection.className = "customization-section";
    abilitiesSection.innerHTML = `
        <h3>Pet Abilities</h3>
        <div class="pet-abilities">
            <div class="pet-ability">
                <div class="ability-name">Loyalty</div>
                <div class="ability-bar">
                    <div class="ability-fill" style="width: ${userData.pet.abilities.loyalty}%"></div>
                </div>
                <div class="ability-value">${userData.pet.abilities.loyalty}</div>
            </div>
            <div class="pet-ability">
                <div class="ability-name">Intelligence</div>
                <div class="ability-bar">
                    <div class="ability-fill" style="width: ${userData.pet.abilities.intelligence}%"></div>
                </div>
                <div class="ability-value">${userData.pet.abilities.intelligence}</div>
            </div>
            <div class="pet-ability">
                <div class="ability-name">Speed</div>
                <div class="ability-bar">
                    <div class="ability-fill" style="width: ${userData.pet.abilities.speed}%"></div>
                </div>
                <div class="ability-value">${userData.pet.abilities.speed}</div>
            </div>
            <div class="pet-ability">
                <div class="ability-name">Strength</div>
                <div class="ability-bar">
                    <div class="ability-fill" style="width: ${userData.pet.abilities.strength}%"></div>
                </div>
                <div class="ability-value">${userData.pet.abilities.strength}</div>
            </div>
        </div>
    `;
    modalContent.appendChild(abilitiesSection);
    
    // Add save button
    const saveButton = document.createElement("button");
    saveButton.className = "action-button";
    saveButton.textContent = "Save Changes";
    saveButton.addEventListener("click", function() {
        customizationModal.style.display = "none";
    });
    
    modalContent.appendChild(saveButton);
    
    // Add CSS for pet customization
    const style = document.createElement("style");
    style.textContent = `
        .pet-locked-message {
            text-align: center;
            padding: 20px;
        }
        
        .pet-locked-icon {
            font-size: 3em;
            margin-bottom: 10px;
            animation: pulse 2s infinite;
        }
        
        .pet-ability {
            display: flex;
            align-items: center;
            margin: 10px 0;
            gap: 10px;
        }
        
        .ability-name {
            flex: 1;
            color: #ddd;
        }
        
        .ability-bar {
            flex: 2;
            height: 8px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            overflow: hidden;
        }
        
        .ability-fill {
            height: 100%;
            background-color: #f39c12;
            border-radius: 4px;
        }
        
        .ability-value {
            flex: 0 0 40px;
            text-align: center;
            font-weight: bold;
            color: #fff;
            background-color: rgba(255, 255, 255, 0.1);
            padding: 4px 8px;
            border-radius: 4px;
        }
    `;
    
    document.head.appendChild(style);
}

// Handle customization button click
customizeButton.addEventListener("click", function() {
    createCharacterCustomizationModal();
    customizationModal.style.display = "block";
});

// Handle pet button click
petButton.addEventListener("click", function() {
    createPetCustomizationModal();
    customizationModal.style.display = "block";
});

// Close modal when clicking on X
closeModal.addEventListener("click", function() {
    customizationModal.style.display = "none";
});

// Close modal when clicking outside of it
window.addEventListener("click", function(event) {
    if (event.target === customizationModal) {
        customizationModal.style.display = "none";
    }
});

// Handle equipment slot clicks
equipmentSlots.forEach(slot => {
    slot.addEventListener("click", function() {
        createCharacterCustomizationModal();
        customizationModal.style.display = "block";
    });
});

// Handle icon clicks for navigation
document.querySelectorAll(".icon").forEach(icon => {
    icon.addEventListener("click", function() {
        const action = this.getAttribute("data-action");
        if (action === "games") {
            window.location.href = "index.html";
        } else if (action === "stats") {
            // Already on stats page
        } else if (action === "room") {
            window.location.href = "room.html";
        } else if (action === "inventory") {
            alert("Inventory is coming soon! 🎒");
        } else if (action === "battle") {
            window.location.href = "battle.html";
        }
    });
});

// Back button
backToHomeButton.addEventListener("click", function() {
    window.location.href = "index.html";
});

// Load theme preference
function loadThemePreference() {
    const savedTheme = localStorage.getItem("preferred-theme");
    if (savedTheme) {
        document.body.className = savedTheme + "-theme";
    } else {
        document.body.className = "colorful-theme";
    }
}

// Initialize the page
window.onload = function() {
    loadUserData();
    updateStatsDisplay();
    loadEquipmentSlots();
    updateCharacterAppearance();
    updatePetAppearance();
    loadThemePreference();
};