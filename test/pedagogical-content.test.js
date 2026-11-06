const assert = require('node:assert/strict');
const { test } = require('node:test');
const content = require('../pedagogical-content');

test('custom lessons resolve to the official letter or syllable prerequisite', () => {
  assert.equal(content.resolvePrerequisite('Vocales', 'e'), 'l2');
  assert.equal(content.resolvePrerequisite('Consonantes', 'Q'), 'l19');
  assert.equal(content.resolvePrerequisite('Sílabas', 'MA'), 'b1');
  assert.equal(content.resolvePrerequisite('Sílabas', 'CI'), 'b21');
  assert.equal(content.resolvePrerequisite('Sílabas', 'GUE'), 'b16');
  assert.equal(content.resolvePrerequisite('Palabras', 'KA'), 'b23');
  assert.equal(content.resolvePrerequisite('Vocales', 'X'), null);
});

test('supplemental activities include the requested reinforcement and cumulative blocks', () => {
  const syllables = new Set(Object.values(content.syllablePrerequisites).flat());
  const reinforcements = content.reinforcementLessons;
  const cumulative = content.cumulativeLessons;

  assert.ok(reinforcements.some(lesson => lesson.target === 'E'));
  for (const letter of ['Q', 'C', 'S', 'K']) {
    assert.ok(reinforcements.some(lesson => lesson.target === letter));
  }
  for (const syllable of ['CE', 'CI', 'CA', 'CO', 'CU', 'GA', 'GO', 'GUE', 'GUI', 'GE', 'GI']) {
    assert.ok(syllables.has(syllable));
    assert.ok(reinforcements.some(lesson => lesson.syllables.includes(syllable)));
  }
  assert.equal(cumulative.length, 8);
  assert.ok(cumulative.every(lesson => lesson.sentences.length >= 2));
  assert.equal(new Set(content.supplementalLessonIds).size, content.supplementalLessonIds.length);
});

test('learning path follows the synthetic-phonetic stages and includes every lesson once', () => {
  const order = content.learningPathOrder;
  const expectedLessonIds = [
    ...Array.from({ length: 27 }, (_, index) => `l${index + 1}`),
    ...Array.from({ length: 6 }, (_, index) => `m${index + 1}`),
    ...Array.from({ length: 47 }, (_, index) => `b${index + 1}`),
    ...content.supplementalLessonIds
  ];
  const position = id => order.indexOf(id);

  assert.equal(order.length, expectedLessonIds.length);
  assert.equal(new Set(order).size, order.length);
  assert.deepEqual([...order].sort(), [...expectedLessonIds].sort());
  assert.ok(position('l1') < position('l2') && position('l2') < position('l4'));
  assert.ok(position('l4') < position('l3') && position('l3') < position('l5'));
  assert.ok(position('l15') < position('b1') && position('b1') < position('l18'));
  assert.ok(position('l18') < position('b2') && position('b2') < position('l14'));
  assert.ok(position('l14') < position('b3') && position('b3') < position('l21'));
  assert.ok(position('l21') < position('b4') && position('b4') < position('l22'));
  assert.ok(position('l22') < position('b5') && position('b5') < position('l16'));
  assert.ok(position('l16') < position('b6') && position('b6') < position('l8'));
  assert.ok(position('l8') < position('b7') && position('b7') < position('l6'));
  assert.ok(position('b30') < position('b24'));
  assert.ok(position('b36') < position('b24'));
  assert.ok(position('b29') < position('b37'));
  assert.ok(position('r-e') < position('l15'));
  assert.ok(position('r-q') < position('l20'));
});

test('guests can access the route through the MA cumulative sentences, but no lesson after them', () => {
  const { guestAccessLimitLessonId, guestAccessibleLessonIds, isGuestLessonAccessible } = content;

  assert.equal(guestAccessLimitLessonId, 'c-ma');
  assert.equal(guestAccessibleLessonIds.at(-1), 'c-ma');
  assert.ok(guestAccessibleLessonIds.every(isGuestLessonAccessible));
  assert.equal(isGuestLessonAccessible('b1'), true);
  assert.equal(isGuestLessonAccessible('l18'), false);
  assert.equal(isGuestLessonAccessible('b5'), false);
  assert.equal(isGuestLessonAccessible('c-ta'), false);
  assert.equal(isGuestLessonAccessible('unknown'), false);
});
