// Normaliza el texto para comparar sin distinguir mayúsculas ni tildes.
function normalizePracticeText(text) {
  return text.toLocaleLowerCase('es').replace(/ñ/g, '\uE000')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\uE000/g, 'ñ');
}

// Comprueba si una palabra contiene alguno de los objetivos de la lección.
function containsLessonTarget(word, targets) {
  const normalizedWord = normalizePracticeText(word);
  // Normaliza cada objetivo antes de buscarlo en la palabra.
  return targets.some(target => normalizedWord.includes(normalizePracticeText(target)));
}

// Presenta el resultado de la actividad con estrellas y experiencia.
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

// Cierra el resultado y vuelve a mostrar el mapa de actividades.
function closeResultsModal() {
  playSound('pop');
  document.getElementById('results-modal').classList.add('hidden');
  renderContinuousMap();
}
