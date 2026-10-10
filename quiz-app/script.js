// --- 1. QUIZ DATA ---
// Now quiz data will come from backend
let quizData = [];

// --- 2. STATE VARIABLES ---
let currentQuestionIndex = 0;
let score = 0;
let user = { email: '', name: '' };
let scoreHistory = [];

// --- 3. DOM ELEMENT REFERENCES ---
const loginScreen = document.getElementById('login-screen');
const nameScreen = document.getElementById('name-screen');
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const endScreen = document.getElementById('end-screen');

const loginForm = document.getElementById('login-form');
const nameForm = document.getElementById('name-form');
const emailInput = document.getElementById('email-input');
const nameInput = document.getElementById('name-input');
const userNameDisplay = document.getElementById('user-name-display');

const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');

const questionText = document.getElementById('question-text');
const questionCounter = document.getElementById('question-counter');
const optionsContainer = document.getElementById('options-container');
const feedbackArea = document.getElementById('feedback-area');
const scoreDisplay = document.getElementById('score-display');
const scoreHistoryList = document.getElementById('score-history-list');
const noHistoryMsg = document.getElementById('no-history-msg');

// --- 4. EVENT LISTENERS ---
loginForm.addEventListener('submit', handleLogin);
nameForm.addEventListener('submit', handleNameSubmit);
startBtn.addEventListener('click', loadQuizFromServer);
nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', restartQuiz);

// --- 5. FUNCTIONS ---

// Handle login
function handleLogin(e) {
  e.preventDefault();
  const email = emailInput.value.trim();
  if (email) {
    user.email = email;
    loginScreen.classList.add('hidden');
    nameScreen.classList.remove('hidden');
    nameInput.focus();
  }
}

// Handle name submission
function handleNameSubmit(e) {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (name) {
    user.name = name;
    userNameDisplay.textContent = user.name;
    nameScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
  }
}

// ✅ Load quiz data from backend
async function loadQuizFromServer() {
  try {
    const res = await fetch("http://localhost:8080/quiz-app/quiz");
    if (!res.ok) throw new Error("Failed to load quiz data");
    quizData = await res.json();
    startQuiz();
  } catch (err) {
    alert("Error loading quiz: " + err.message);
  }
}

// Start quiz
function startQuiz() {
  startScreen.classList.add('hidden');
  quizScreen.classList.remove('hidden');
  currentQuestionIndex = 0;
  score = 0;
  showQuestion();
}

// Display current question
function showQuestion() {
  feedbackArea.textContent = '';
  nextBtn.classList.add('hidden');

  const currentQuestion = quizData[currentQuestionIndex];
  questionText.textContent = currentQuestion.question;
  questionCounter.textContent = `${currentQuestionIndex + 1} / ${quizData.length}`;
  optionsContainer.innerHTML = '';

  currentQuestion.options.forEach(option => {
    const button = document.createElement('button');
    button.textContent = option;
    button.classList.add(
      'option-btn', 'w-full', 'p-4', 'rounded-lg', 'border-2',
      'border-gray-300', 'bg-white', 'text-gray-700', 'font-medium',
      'hover:bg-gray-50', 'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-300'
    );
    button.addEventListener('click', () => selectAnswer(button, option, currentQuestion.answer));
    optionsContainer.appendChild(button);
  });
}

// Handle user answer
function selectAnswer(selectedButton, selectedOption, correctAnswer) {
  const allOptions = optionsContainer.querySelectorAll('.option-btn');
  allOptions.forEach(btn => btn.disabled = true);

  if (selectedOption === correctAnswer) {
    score++;
    selectedButton.classList.add('correct');
    feedbackArea.textContent = "✅ Correct!";
    feedbackArea.classList.add('text-green-600');
    feedbackArea.classList.remove('text-red-600');
  } else {
    selectedButton.classList.add('incorrect');
    feedbackArea.textContent = `❌ Wrong! Correct: ${correctAnswer}`;
    feedbackArea.classList.add('text-red-600');
    feedbackArea.classList.remove('text-green-600');

    allOptions.forEach(btn => {
      if (btn.textContent === correctAnswer) btn.classList.add('correct');
    });
  }

  nextBtn.classList.remove('hidden');
}

// Next question
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < quizData.length) {
    showQuestion();
  } else {
    showResults();
  }
}

// ✅ Show final score and send to backend
async function showResults() {
  quizScreen.classList.add('hidden');
  endScreen.classList.remove('hidden');

  const total = quizData.length;
  const finalScoreText = `${score} / ${total}`;
  scoreDisplay.textContent = finalScoreText;

  scoreHistory.push(finalScoreText);
  scoreHistoryList.innerHTML = '';
  scoreHistory.forEach((item, i) => {
    const li = document.createElement('li');
    li.textContent = `Game ${i + 1}: ${item}`;
    li.classList.add('mb-1');
    scoreHistoryList.appendChild(li);
  });

  // ✅ Send email, name, score, and total to backend (for MySQL storage)
  try {
    await fetch("http://localhost:8080/quiz-app/score", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name)}&score=${encodeURIComponent(score)}&total=${encodeURIComponent(total)}`
    });
  } catch (err) {
    console.error("Failed to send score:", err);
  }
}

// Restart quiz
function restartQuiz() {
  endScreen.classList.add('hidden');
  loginScreen.classList.remove('hidden');
  user = { email: '', name: '' };
  emailInput.value = '';
  nameInput.value = '';
}
