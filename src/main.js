// Mock data for the puzzle
const mockData = {
  Date: "20241228",
  Clues: {
    c1: "RUGDO",
    c2: "PWRIE",
    c3: "ACLBTO",
    c4: "LYRURF",
    a1: "GOURD",
    a2: "WIPER",
    a3: "COBALT",
    a4: "FLURRY"
  },
  Caption: {
    v1: "As \"The Wave\" went around the stadium, whole sections of fans were —"
  },
  Solution: {
    s1: "UPROOTED",
    k1: "UPROOTED"
  },
  Image: "https://assets.amuniversal.com/786dc2f09ec0013d8360005056a9545d"
};

// Format date helper
function formatDate(dateStr) {
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  return new Date(`${year}-${month}-${day}`).toLocaleDateString();
}

// Initialize the puzzle
function initializePuzzle() {
  // Set puzzle date
  document.getElementById('puzzle-date').textContent = `Daily Puzzle - ${formatDate(mockData.Date)}`;
  
  // Set puzzle caption
  document.getElementById('puzzle-caption').textContent = mockData.Caption.v1;
  
  // Create jumble words
  const jumbleWordsContainer = document.getElementById('jumble-words');
  
  // Clear existing content
  jumbleWordsContainer.innerHTML = '';
  
  // Add jumble words
  for (let i = 1; i <= 4; i++) {
    const wordDiv = document.createElement('div');
    wordDiv.className = 'jumble-word';
    
    const wordText = document.createElement('p');
    wordText.className = 'jumble-text';
    wordText.textContent = mockData.Clues[`c${i}`];
    
    const answerDiv = document.createElement('div');
    answerDiv.className = 'jumble-answer hidden';
    
    const arrow = document.createElement('span');
    arrow.className = 'jumble-arrow';
    arrow.innerHTML = '→';
    
    const answer = document.createElement('p');
    answer.className = 'jumble-solution';
    answer.textContent = mockData.Clues[`a${i}`];
    
    answerDiv.appendChild(arrow);
    answerDiv.appendChild(answer);
    wordDiv.appendChild(wordText);
    wordDiv.appendChild(answerDiv);
    
    jumbleWordsContainer.appendChild(wordDiv);
  }
  
  // Set puzzle solution
  document.getElementById('puzzle-solution').textContent = mockData.Solution.s1;
}

// Toggle answers visibility
function toggleAnswers() {
  const answers = document.querySelectorAll('.jumble-answer');
  const button = document.getElementById('show-answers-btn');
  const isHidden = answers[0].classList.contains('hidden');
  
  answers.forEach(answer => {
    answer.classList.toggle('hidden');
  });
  
  button.textContent = isHidden ? 'Hide Answers' : 'Show Answers';
}

// Toggle solution visibility
function toggleSolution() {
  const solutionContainer = document.getElementById('solution-container');
  const button = document.getElementById('show-solution-btn');
  const isHidden = solutionContainer.classList.contains('hidden');
  
  solutionContainer.classList.toggle('hidden');
  button.textContent = isHidden ? 'Hide Solution' : 'Show Solution';
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
  initializePuzzle();
  
  document.getElementById('show-answers-btn').addEventListener('click', toggleAnswers);
  document.getElementById('show-solution-btn').addEventListener('click', toggleSolution);
});