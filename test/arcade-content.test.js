const assert = require('node:assert/strict');
const { test } = require('node:test');
const arcadeContent = require('../arcade-content');

test('letter and syllable activities draw distinct content from the selected level', () => {
  for (const level of [1, 2, 3]) {
    const letters = arcadeContent.randomLetters(level, 5);
    const syllables = arcadeContent.randomSyllables(level, 3);
    const word = arcadeContent.randomSyllableWord(level);

    assert.equal(new Set(letters).size, 5);
    assert.equal(new Set(syllables).size, 3);
    assert.ok(word.length >= 2);
    assert.ok(word.every(syllable => /^[A-ZÑ]+$/.test(syllable)));
  }
});

test('rain and memory content remain appropriate to each level', () => {
  for (const level of [1, 2, 3]) {
    const target = arcadeContent.randomRainTarget(level);
    const cards = arcadeContent.randomMemoryCards(level);
    const counts = new Map();

    assert.equal(cards.length, 8);
    cards.forEach(card => counts.set(card, (counts.get(card) || 0) + 1));
    assert.equal(counts.size, 4);
    assert.ok([...counts.values()].every(count => count === 2));
    assert.equal(typeof target, 'string');
    assert.ok(target.length > 0);
  }
});

test('random content helpers reject invalid levels and sample sizes', () => {
  assert.throws(() => arcadeContent.randomLetter(0), RangeError);
  assert.throws(() => arcadeContent.randomSyllableWord(4), RangeError);
  assert.throws(() => arcadeContent.randomLetters(1, 6), RangeError);
  assert.throws(() => arcadeContent.choose([]), TypeError);
});

test('sample selection changes when the random source changes', () => {
  const originalRandom = Math.random;
  let firstSelection;
  let secondSelection;
  try {
    Math.random = () => 0;
    firstSelection = arcadeContent.randomLetters(2, 3);
    Math.random = () => 0.999999;
    secondSelection = arcadeContent.randomLetters(2, 3);
  } finally {
    Math.random = originalRandom;
  }
  assert.notDeepEqual(firstSelection, secondSelection);
});

test('replaying each level can produce different letters, syllables, words, targets, and cards', () => {
  const originalRandom = Math.random;
  try {
    for (const level of [1, 2, 3]) {
      Math.random = () => 0;
      const firstRun = [
        arcadeContent.randomLetters(level, 3),
        arcadeContent.randomSyllables(level, 3),
        arcadeContent.randomSyllableWord(level),
        arcadeContent.randomRainTarget(level),
        arcadeContent.randomMemoryCards(level)
      ];

      Math.random = () => 0.999999;
      const replay = [
        arcadeContent.randomLetters(level, 3),
        arcadeContent.randomSyllables(level, 3),
        arcadeContent.randomSyllableWord(level),
        arcadeContent.randomRainTarget(level),
        arcadeContent.randomMemoryCards(level)
      ];

      firstRun.forEach((content, index) => assert.notDeepEqual(replay[index], content));
    }
  } finally {
    Math.random = originalRandom;
  }
});
