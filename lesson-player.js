function normalizePracticeText(text) {
  return text.toLocaleLowerCase('es').replace(/ñ/g, '\uE000')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\uE000/g, 'ñ');
}

function containsLessonTarget(word, targets) {
  const normalizedWord = normalizePracticeText(word);
  return targets.some(target => normalizedWord.includes(normalizePracticeText(target)));
}

function showResultsModal(title, stars, xp) {
  playSound('correct');
  triggerConfetti();
  owlSpeak('¡Excelente trabajo! Has completado la actividad.');
  document.getElementById('results-subtitle').innerText = title;
  document.getElementById('results-xp').innerText = `+${xp} XP`;

  const starsContainer = document.getElementById('results-stars');
  starsContainer.innerHTML = '';
  for (let index = 0; index < stars; index++) {
    starsContainer.innerHTML += '<i class="fa-solid fa-star text-amber-400 animate-pop"></i>';
  }
  for (let index = stars; index < 3; index++) {
    starsContainer.innerHTML += '<i class="fa-regular fa-star text-slate-300"></i>';
  }
  document.getElementById('results-modal').classList.remove('hidden');
}

function closeResultsModal() {
  playSound('pop');
  document.getElementById('results-modal').classList.add('hidden');
  renderContinuousMap();
}
