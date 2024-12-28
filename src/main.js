import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to always download models
env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 1024;

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

function resizeImageIfNeeded(canvas, ctx, image) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

async function removeBackground(imageElement) {
  try {
    console.log('Starting background removal process...');
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
      device: 'webgpu',
    });
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? 'was' : 'was not'} resized`);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    const result = await segmenter(imageData);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    outputCtx.drawImage(canvas, 0, 0);
    
    const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const data = outputImageData.data;
    
    for (let i = 0; i < result[0].mask.data.length; i++) {
      const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
      data[i * 4 + 3] = alpha;
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
}

// Initialize the puzzle
async function initializePuzzle() {
  document.getElementById('puzzle-date').textContent = `Daily Puzzle - ${formatDate(mockData.Date)}`;
  document.getElementById('puzzle-caption').textContent = mockData.Caption.v1;
  
  // Process puzzle image
  const puzzleImage = document.getElementById('puzzle-image');
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      try {
        const processedBlob = await removeBackground(img);
        puzzleImage.src = URL.createObjectURL(processedBlob);
      } catch (error) {
        console.error('Failed to process image:', error);
      }
    };
    img.src = mockData.Image;
  } catch (error) {
    console.error('Failed to load image:', error);
  }
  
  const jumbleWordsContainer = document.getElementById('jumble-words');
  jumbleWordsContainer.innerHTML = '';
  
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
