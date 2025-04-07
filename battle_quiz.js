// Initialize Telegram Web App compatibility
let tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
  tg.expand();
}

// Quiz questions database
const quizQuestions = [
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2 // Paris (index 2)
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1 // Mars (index 1)
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    correctAnswer: 3 // Pacific Ocean (index 3)
  },
  {
    question: "Which element has the chemical symbol 'O'?",
    options: ["Gold", "Oxygen", "Osmium", "Oganesson"],
    correctAnswer: 1 // Oxygen (index 1)
  },
  {
    question: "Which animal is known as the 'King of the Jungle'?",
    options: ["Tiger", "Lion", "Elephant", "Giraffe"],
    correctAnswer: 1 // Lion (index 1)
  },
  {
    question: "What's the smallest prime number?",
    options: ["0", "1", "2", "3"],
    correctAnswer: 2 // 2 (index 2)
  },
  {
    question: "How many continents are there on Earth?",
    options: ["5", "6", "7", "8"],
    correctAnswer: 2 // 7 (index 2)
  },
  {
    question: "Which planet has the most moons?",
    options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
    correctAnswer: 1 // Saturn (index 1)
  },
  {
    question: "What's the hardest natural substance on Earth?",
    options: ["Gold", "Iron", "Diamond", "Platinum"],
    correctAnswer: 2 // Diamond (index 2)
  },
  {
    question: "Which of these is not a primary color?",
    options: ["Red", "Blue", "Green", "Yellow"],
    correctAnswer: 3 // Yellow (index 3)
  }
];

// Battle buffs/debuffs
const battleBuffs = {
  correct: {
    damage: 1.5, // 50% damage increase
    healing: 1.3, // 30% healing increase
    defense: 1.2  // 20% defense increase
  },
  incorrect: {
    damage: 0.8, // 20% damage decrease
    healing: 0.7, // 30% healing decrease
    defense: 0.8  // 20% defense decrease
  }
};

// Variables to store quiz state
let currentQuiz = null;
let userBuffs = {
  damage: 1,
  healing: 1,
  defense: 1
};

// DOM Elements
const quizContainer = document.getElementById('battle-quiz-container');
const questionElement = document.getElementById('battle-quiz-question');
const optionsContainer = document.getElementById('battle-quiz-options');
const startBattleButton = document.getElementById('start-battle-button');
const battleContainer = document.getElementById('battle-container');
const quizResultElement = document.getElementById('quiz-result');

// Get a random quiz question
function getRandomQuiz() {
  const randomIndex = Math.floor(Math.random() * quizQuestions.length);
  return quizQuestions[randomIndex];
}

// Show quiz before battle
function showBattleQuiz() {
  // Hide battle area, show quiz
  battleContainer.style.display = 'none';
  quizContainer.style.display = 'block';
  startBattleButton.style.display = 'none';
  
  // Get a random quiz
  currentQuiz = getRandomQuiz();
  
  // Display question
  questionElement.textContent = currentQuiz.question;
  
  // Clear previous options
  optionsContainer.innerHTML = '';
  
  // Add options
  currentQuiz.options.forEach((option, index) => {
    const optionButton = document.createElement('div');
    optionButton.className = 'battle-quiz-option';
    optionButton.textContent = option;
    optionButton.dataset.index = index;
    
    optionButton.addEventListener('click', function() {
      // Check if correct
      const selectedIndex = parseInt(this.dataset.index);
      const isCorrect = selectedIndex === currentQuiz.correctAnswer;
      
      // Apply visual feedback
      if (isCorrect) {
        this.classList.add('correct');
        quizResultElement.textContent = 'Correct! You gained battle buffs.';
        // Apply buffs
        userBuffs.damage = battleBuffs.correct.damage;
        userBuffs.healing = battleBuffs.correct.healing;
        userBuffs.defense = battleBuffs.correct.defense;
      } else {
        this.classList.add('incorrect');
        document.querySelectorAll('.battle-quiz-option')[currentQuiz.correctAnswer].classList.add('correct');
        quizResultElement.textContent = 'Incorrect! You received battle debuffs.';
        // Apply debuffs
        userBuffs.damage = battleBuffs.incorrect.damage;
        userBuffs.healing = battleBuffs.incorrect.healing;
        userBuffs.defense = battleBuffs.incorrect.defense;
      }
      
      // Disable all options
      document.querySelectorAll('.battle-quiz-option').forEach(opt => {
        opt.style.pointerEvents = 'none';
      });
      
      // Show start battle button after a delay
      setTimeout(() => {
        startBattleButton.style.display = 'block';
      }, 1500);
    });
    
    optionsContainer.appendChild(optionButton);
  });
}

// Start the actual battle
function startBattle() {
  // Save buffs to localStorage for battle.js to use
  localStorage.setItem('battleBuffs', JSON.stringify(userBuffs));
  
  // Hide quiz, show battle
  quizContainer.style.display = 'none';
  battleContainer.style.display = 'block';
  
  // Call the original startBattle function
  if (typeof window.originalStartBattle === 'function') {
    window.originalStartBattle();
  }
}

// Initialize the battle quiz system
function initBattleQuiz() {
  // Hide battle container initially
  if (battleContainer) {
    battleContainer.style.display = 'none';
  }
  
  // Show quiz first
  showBattleQuiz();
  
  // Set up start battle button
  if (startBattleButton) {
    startBattleButton.addEventListener('click', startBattle);
  }
}

// Initialize when the page loads
window.onload = function() {
  initBattleQuiz();
  
  // Load theme preference
  const savedTheme = localStorage.getItem("preferred-theme");
  if (savedTheme) {
    document.body.className = savedTheme;
  } else {
    document.body.className = "colorful-theme";
  }
  
  // Navigation handling
  document.querySelectorAll(".icon").forEach(icon => {
    icon.addEventListener("click", function() {
      const action = this.getAttribute("data-action");
      if (action === "games") {
        window.location.href = "index.html";
      } else if (action === "stats") {
        window.location.href = "stats.html";
      } else if (action === "room") {
        window.location.href = "room.html";
      } else if (action === "inventory") {
        alert("Inventory is coming soon! 🎒");
      } else if (action === "battle") {
        window.location.href = "battle.html";
      }
    });
  });
};