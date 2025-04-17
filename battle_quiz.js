// Initialize Telegram Web App compatibility
let tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
  tg.expand();
}

// Quiz questions database (Same as before)
const quizQuestions = [
  { question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correctAnswer: 2 },
  { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correctAnswer: 1 },
  { question: "What is the largest ocean on Earth?", options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"], correctAnswer: 3 },
  { question: "Which element has the chemical symbol 'O'?", options: ["Gold", "Oxygen", "Osmium", "Oganesson"], correctAnswer: 1 },
  { question: "Which animal is known as the 'King of the Jungle'?", options: ["Tiger", "Lion", "Elephant", "Giraffe"], correctAnswer: 1 },
  { question: "What's the smallest prime number?", options: ["0", "1", "2", "3"], correctAnswer: 2 },
  { question: "How many continents are there on Earth?", options: ["5", "6", "7", "8"], correctAnswer: 2 },
  { question: "Which planet has the most moons?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], correctAnswer: 1 },
  { question: "What's the hardest natural substance on Earth?", options: ["Gold", "Iron", "Diamond", "Platinum"], correctAnswer: 2 },
  { question: "Which of these is not a primary color (in additive RGB model)?", options: ["Red", "Blue", "Green", "Yellow"], correctAnswer: 3 } // Clarified question for color model
];

// Battle buffs/debuffs definitions (Same as before)
const battleBuffDefinitions = {
  correct: { damage: 1.25, healing: 1.20, defense: 1.15 }, // Adjusted buff values slightly
  incorrect: { damage: 0.85, healing: 0.80, defense: 0.90 } // Adjusted debuff values slightly
};

// Variables to store quiz state
let currentQuizQuestion = null;
let appliedBuffs = { damage: 1, healing: 1, defense: 1 }; // Start with no buffs/debuffs
let quizAnswered = false; // Flag to prevent multiple answers

// DOM Elements
const quizContainer = document.getElementById('battle-quiz-container');
const questionElement = document.getElementById('battle-quiz-question');
const optionsContainer = document.getElementById('battle-quiz-options');
const startBattleButton = document.getElementById('start-battle-button');
const quizResultElement = document.getElementById('quiz-result');
// We don't need battleContainer element reference here, battle.js handles it

// Get a random quiz question
function getRandomQuiz() {
  const randomIndex = Math.floor(Math.random() * quizQuestions.length);
  return quizQuestions[randomIndex];
}

// Function to be called by battle.js to re-enable the button after battle ends
function enableQuizStartButton(buttonText = 'Start Battle') {
     if (startBattleButton) {
        startBattleButton.disabled = false;
        startBattleButton.textContent = buttonText;
        startBattleButton.style.display = 'block'; // Make sure it's visible
        // Also, likely need to re-show the quiz container and hide battle container
        if (quizContainer) quizContainer.style.display = 'block';
        const battleContainerRef = document.getElementById('battle-container');
        if (battleContainerRef) battleContainerRef.style.display = 'none';
        // Reset the quiz for the next round
        showBattleQuiz();
    }
}
// Make it globally accessible
window.enableQuizStartButton = enableQuizStartButton;


// Show quiz before battle
function showBattleQuiz() {
  console.log("Showing battle quiz...");
  quizAnswered = false; // Reset answered flag
  appliedBuffs = { damage: 1, healing: 1, defense: 1 }; // Reset buffs
  quizResultElement.textContent = ''; // Clear previous result message

  // Ensure quiz container is visible and battle container is hidden
  if (quizContainer) quizContainer.style.display = 'block';
    const battleContainerRef = document.getElementById('battle-container');
        if (battleContainerRef) battleContainerRef.style.display = 'none';
  if (startBattleButton) startBattleButton.style.display = 'none'; // Hide start button initially

  // Get a random quiz
  currentQuizQuestion = getRandomQuiz();

  // Display question
  if (questionElement) questionElement.textContent = currentQuizQuestion.question;

  // Clear previous options and add new ones
  if (optionsContainer) {
    optionsContainer.innerHTML = ''; // Clear previous options
    currentQuizQuestion.options.forEach((option, index) => {
      const optionButton = document.createElement('div');
      optionButton.className = 'battle-quiz-option';
      optionButton.textContent = option;
      optionButton.dataset.index = index; // Store index for checking answer

      optionButton.addEventListener('click', handleQuizAnswer);
      optionsContainer.appendChild(optionButton);
    });
  }
}

// Handle user clicking an answer
function handleQuizAnswer(event) {
    if (quizAnswered) return; // Prevent answering multiple times
    quizAnswered = true;

    const selectedButton = event.target;
    const selectedIndex = parseInt(selectedButton.dataset.index);
    const isCorrect = selectedIndex === currentQuizQuestion.correctAnswer;

    // Apply visual feedback and set buffs/debuffs
    if (isCorrect) {
        selectedButton.classList.add('correct');
        quizResultElement.textContent = 'Correct! You gained battle buffs.';
        appliedBuffs = battleBuffDefinitions.correct;
    } else {
        selectedButton.classList.add('incorrect');
        // Highlight the correct answer
        const correctButton = optionsContainer.querySelector(`[data-index="${currentQuizQuestion.correctAnswer}"]`);
        if (correctButton) correctButton.classList.add('correct');
        quizResultElement.textContent = 'Incorrect! You received battle debuffs.';
        appliedBuffs = battleBuffDefinitions.incorrect;
    }

    // Disable all options after answering
    document.querySelectorAll('.battle-quiz-option').forEach(opt => {
        opt.style.pointerEvents = 'none'; // Disable further clicks
        // Remove hover effect possibility if needed via CSS class toggle
    });

    // Show start battle button after a short delay
    setTimeout(() => {
        if (startBattleButton) {
            startBattleButton.style.display = 'block';
            startBattleButton.disabled = false; // Ensure it's enabled
            startBattleButton.textContent = 'Start Battle';
        }
    }, 1200); // 1.2 second delay
}

// Function to initiate the battle process (called when "Start Battle" is clicked)
function initiateBattle() {
    console.log("Initiate battle button clicked. Applied buffs:", appliedBuffs);
    // Hide quiz, disable button immediately
    if (quizContainer) quizContainer.style.display = 'none';
    if (startBattleButton) startBattleButton.disabled = true;

    // Call the function in battle.js to start the actual combat
    if (typeof window.startActualBattle === 'function') {
        window.startActualBattle(appliedBuffs);
    } else {
        console.error("startActualBattle function not found in battle.js");
        // Maybe show an error message to the user
        if (quizResultElement) quizResultElement.textContent = "Error starting battle!";
         // Try to re-enable button if battle fails to start
         setTimeout(() => enableQuizStartButton('Error - Retry?'), 1000);
    }
}


// Initialize the battle quiz system when the script loads
function initBattleQuiz() {
  // Hide battle container initially is handled in battle.js onload
  showBattleQuiz(); // Show the quiz first

  // Set up the start battle button listener
  if (startBattleButton) {
    startBattleButton.addEventListener('click', initiateBattle);
  } else {
      console.error("Start Battle Button not found!");
  }
}

// Run initialization logic (make sure this runs after battle.js might have loaded if order matters)
// Using DOMContentLoaded is safer
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the battle page before initializing
    // A simple check could be the presence of a specific element like 'battle-quiz-container'
    if (document.getElementById('battle-quiz-container')) {
        initBattleQuiz();
    }
});

// Note: The loadThemePreference function and navigation listeners are now primarily in battle.js
// If needed specifically here, they can be added, but avoid duplication.