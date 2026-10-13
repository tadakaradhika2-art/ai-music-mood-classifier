// Comprehensive API and validation test suite
import { validateAnalyzeInput, validateSaveInput, validateUpdateInput, validateGeminiJsonResponse } from '../src/lib/validation.js';

console.log('Testing Validation Functions...');

// Test 1: validateAnalyzeInput
const validAnalyze = validateAnalyzeInput({
  title: 'Hotel California',
  artist: 'Eagles',
  genre: 'Rock',
  lyrics: 'On a dark desert highway, cool wind in my hair...',
  userMoodGuess: 'Nostalgic'
});
console.assert(validAnalyze.success === true, 'Test 1.1 Failed: Should validate valid input');
console.assert(validAnalyze.data.title === 'Hotel California', 'Test 1.2 Failed: Title mismatch');

const emptyTitle = validateAnalyzeInput({ title: '   ' });
console.assert(emptyTitle.success === false, 'Test 1.3 Failed: Empty title should fail');

// Test 2: validateGeminiJsonResponse
const mockAiResponse = {
  primaryMood: 'Melancholic',
  secondaryMoods: ['Nostalgic', 'Pensive'],
  confidence: 0.91,
  energyLevel: 5,
  valence: 4,
  summary: 'A moody classic reflecting on entrapment and transient beauty.',
  themes: ['loss of innocence', 'decay', 'illusion'],
  emotionalKeywords: ['haunting', 'wistful', 'hypnotic'],
  recommendedActivity: 'Late night highway driving or reflection.'
};

const validatedAi = validateGeminiJsonResponse(mockAiResponse);
console.assert(validatedAi.success === true, 'Test 2.1 Failed: AI response validation');
console.assert(validatedAi.data.primaryMood === 'Melancholic', 'Test 2.2 Failed: Mood mismatch');

// Test 3: validateSaveInput
const saveInput = validateSaveInput({
  title: 'Hotel California',
  artist: 'Eagles',
  genre: 'Rock',
  ...mockAiResponse,
});
console.assert(saveInput.success === true, 'Test 3.1 Failed: Save input validation');

// Test 4: validateUpdateInput
const updateInput = validateUpdateInput({
  title: 'Hotel California (Live)',
  artist: 'Eagles Band'
});
console.assert(updateInput.success === true, 'Test 4.1 Failed: Update input validation');
console.assert(updateInput.data.title === 'Hotel California (Live)', 'Test 4.2 Failed: Updated title');

console.log('All local validation tests passed successfully!');
