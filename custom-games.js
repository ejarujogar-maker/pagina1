// Muestra los juegos personalizados en el panel del profesor.
function renderCustomGameModule() {
  loadTeacherGames();
}

// Crea un botón que anuncia por voz el texto indicado.
function makeGameSpeechButton(text, label, className) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = text;
  button.setAttribute('aria-label', label);
  // Anuncia la etiqueta cuando se pulsa el botón.
  button.addEventListener('click', () => window.speakText?.(label));
  return button;
}

// Carga los juegos creados y ofrece opciones para probarlos o borrarlos.
async function loadTeacherGames() {
  const container = document.getElementById('teacher-game-list');
  if (!container) return;
  container.replaceChildren();
  const heading = document.createElement('h4');
  heading.className = 'font-black font-fredoka text-lg text-purple-950 mb-2';
  heading.textContent = 'Juegos creados';
  container.append(heading);
  const studentId = document.getElementById('teacher-student-select').value;
  if (!studentId) {
    const empty = document.createElement('p');
    empty.className = 'text-sm font-bold text-slate-500';
    empty.textContent = 'Selecciona un alumno para consultar sus juegos asignados.';
    container.append(empty);
    return;
  }
  try {
    const response = await fetch(`/api/teacher/games?studentId=${encodeURIComponent(studentId)}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se pudieron cargar los juegos creados.');
    if (!result.games.length) {
      const empty = document.createElement('p');
      empty.className = 'text-sm font-bold text-slate-500';
      empty.textContent = 'Todavía no has creado juegos.';
      container.append(empty);
      return;
    }
    const list = document.createElement('div');
    list.className = 'space-y-2';
    // Construye una fila de acciones para cada juego creado.
    result.games.forEach(game => {
      const item = document.createElement('article');
      item.className = 'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-100 bg-white p-3';
      const details = document.createElement('p');
      details.className = 'min-w-48 flex-1 text-sm font-bold text-slate-700';
      const gameTypeLabel = game.type === 'bridge' ? 'Puente de los bloques mágicos' : game.type === 'pairs' ? 'Memoria de parejas' : 'Rompecabezas';
      details.textContent = `${game.title} · ${gameTypeLabel} · ${game.studentName} (@${game.studentUsername})`;
      const actions = document.createElement('div');
      actions.className = 'flex flex-wrap gap-2';
      const preview = document.createElement('button');
      preview.type = 'button';
      preview.className = 'rounded-lg bg-emerald-100 px-3 py-2 text-sm font-black text-emerald-900';
      preview.textContent = 'Probar';
      // Abre el juego como vista previa del profesor.
      preview.addEventListener('click', () => startCustomGame(game, container, {
        preview: true,
        onExit: loadTeacherGames
      }));
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'rounded-lg bg-rose-100 px-3 py-2 text-sm font-black text-rose-800';
      remove.textContent = 'Borrar';
      // Elimina el juego y vuelve a cargar la lista.
      remove.addEventListener('click', () => deleteTeacherContent('games', game.id, game.title, loadTeacherGames));
      actions.append(preview, remove);
      item.append(details, actions);
      list.append(item);
    });
    container.append(list);
  } catch (error) {
    showTeacherListError(container, error.message);
  }
}

// Valida y guarda un juego nuevo asignado a un alumno.
async function createCustomGame(event) {
  event.preventDefault();
  const studentId = document.getElementById('teacher-student-select').value;
  const message = document.getElementById('teacher-dashboard-message');
  if (!studentId) {
    message.innerText = 'Selecciona un alumno antes de crear el juego.';
    return;
  }
  const rows = [...document.querySelectorAll('#game-word-rows .teacher-word-row')];
  // Recoge las palabras, imágenes y sílabas introducidas en el formulario.
  const items = rows.map(row => ({
    word: row.querySelector('.teacher-word-input').value.trim(),
    emoji: row.querySelector('.teacher-emoji-input').value.trim(),
    syllable: row.querySelector('.teacher-syllable-input')?.value.trim()
  }));
  const type = document.getElementById('custom-game-type').value;
  if (items.length < 3) {
    message.innerText = 'Añade al menos tres parejas de palabra e imagen.';
    return;
  }
  // Comprueba que cada sílaba del puente aparezca en su palabra.
  if (type === 'bridge' && items.some(item => !item.syllable || !item.word.toLocaleLowerCase('es').includes(item.syllable.toLocaleLowerCase('es')))) {
    message.innerText = 'En cada palabra del puente, escribe una sílaba que aparezca dentro de la palabra y que no sea la palabra completa.';
    return;
  }
  // Impide que la sílaba del puente sea la palabra completa.
  if (type === 'bridge' && items.some(item => item.syllable.toLocaleLowerCase('es') === item.word.toLocaleLowerCase('es'))) {
    message.innerText = 'La sílaba que falta debe ser solo una parte de la palabra, no la palabra completa.';
    return;
  }
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"], button:not([type])');
  button.disabled = true;
  try {
    const response = await fetch('/api/teacher/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId, title: document.getElementById('custom-game-title').value.trim(),
        type,
        theme: document.getElementById('custom-game-theme').value,
        // Omite las sílabas cuando el juego no es de tipo puente.
        items: type === 'bridge' ? items : items.map(({ word, emoji }) => ({ word, emoji }))
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se pudo crear el juego.');
    form.reset();
    document.getElementById('game-word-rows').replaceChildren();
    for (let index = 0; index < 4; index++) addTeacherWordRow('game-word-rows');
    await loadTeacherGames();
    message.innerText = 'Juego personalizado creado y asignado al alumno.';
  } catch (error) {
    message.innerText = error.message;
  } finally {
    button.disabled = false;
  }
}

// Muestra los juegos asignados al alumno o disponibles en la vista previa.
async function renderCustomGames() {
  const container = document.getElementById('custom-games-container');
  if (!container) return;
  container.replaceChildren();
  container.className = 'rounded-3xl border-2 border-amber-200 bg-white/90 p-4 shadow-lg sm:p-6';
  delete container.dataset.customGameId;
  if (appState.currentUser?.role !== 'alumno') {
    container.classList.add('hidden');
    return;
  }
  try {
    let games;
    const previewMode = window.isStudentPreviewActive?.() === true;
    if (previewMode) {
      games = appState.customGames;
    } else {
      const response = await fetch('/api/games/custom');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudieron cargar los juegos asignados.');
      games = result.games;
    }
    if (!games.length) {
      container.classList.add('hidden');
      return;
    }
    container.classList.remove('hidden');
    const heading = document.createElement('h3');
    heading.className = 'mb-3 font-black font-fredoka text-xl text-purple-950';
    heading.textContent = 'Juegos de tu profesor';
    container.append(heading);
    const cards = document.createElement('div');
    cards.className = 'grid sm:grid-cols-2 lg:grid-cols-3 gap-3';
    // Genera una tarjeta para cada juego asignado.
    games.forEach(game => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `custom-game-card theme-${game.theme} rounded-2xl border-4 p-4 text-left shadow`;
      const title = document.createElement('span');
      title.className = 'block font-black font-fredoka text-lg';
        title.textContent = `${game.type === 'bridge' ? '🌉' : '🧩'} ${game.title}`;
      const details = document.createElement('span');
      details.className = 'mt-1 block text-sm font-bold';
      const typeLabel = game.type === 'bridge' ? 'Puente de los bloques mágicos' : game.type === 'pairs' ? 'Memoria de parejas' : 'Rompecabezas';
      details.textContent = `${typeLabel} · ${game.completedAt ? '¡Completado!' : 'Toca para jugar'}`;
      card.append(title, details);
      // Inicia el juego seleccionado en el contenedor actual.
      card.addEventListener('click', () => startCustomGame(game, container, { preview: previewMode }));
      cards.append(card);
    });
    container.append(cards);
  } catch (error) {
    console.error('No se pudieron cargar los juegos personalizados:', error);
    container.classList.remove('hidden');
    const message = document.createElement('p');
    message.className = 'rounded-xl bg-rose-50 p-3 font-bold text-rose-700';
    message.textContent = error.message;
    container.append(message);
  }
}

// Prepara la interfaz y el flujo de juego según el tipo de actividad.
function startCustomGame(game, container, options = {}) {
  const isPreview = options.preview === true;
  const onExit = options.onExit || renderCustomGames;
  const returnToGames = () => {
    if (returnToGamesTimer !== null) {
      clearTimeout(returnToGamesTimer);
      returnToGamesTimer = null;
    }
    onExit();
  };
  let returnToGamesTimer = null;
  let completionHandled = false;
  container.dataset.customGameId = String(game.id);
  const helpText = game.type === 'bridge'
    ? 'Completa cada palabra con la sílaba que falta. Toca o arrastra uno de los bloques con sílabas al espacio vacío.'
    : game.type === 'pairs'
      ? 'Voltea las tarjetas y encuentra cada pareja formada por una palabra y su imagen.'
      : 'Ordena las letras para escribir el nombre de cada imagen. Puedes tocar la imagen para escuchar la palabra.';
  container.replaceChildren();
  container.className = `custom-game-stage theme-${game.theme} rounded-3xl border-4 p-4 sm:p-6 shadow-xl`;
  const header = document.createElement('div');
  header.className = 'mb-4 flex flex-wrap items-center justify-between gap-2';
  const title = document.createElement('h3');
  title.className = 'font-black font-fredoka text-2xl';
  title.textContent = `${game.type === 'bridge' ? '🌉' : '🧩'} ${game.title}`;
  const exit = document.createElement('button');
  exit.type = 'button';
  exit.className = 'rounded-xl bg-white px-4 py-2 font-black text-purple-900 shadow';
  exit.textContent = isPreview ? 'Volver a mis juegos creados' : 'Volver a mis juegos';
  exit.addEventListener('click', returnToGames);
  const repeatHelp = makeGameSpeechButton('🔊 Escuchar instrucciones', helpText, 'rounded-xl bg-white px-4 py-2 font-black text-purple-900 shadow');
  const guidance = document.createElement('p');
  guidance.className = 'mb-4 rounded-xl bg-white/80 p-3 text-center font-bold';
  guidance.textContent = helpText;
  header.append(title, repeatHelp, exit);
  const area = document.createElement('div');
  area.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3';
  const feedback = document.createElement('p');
  feedback.className = 'mt-4 min-h-7 text-center text-lg font-black';
  const items = [...game.items];
  let completed = 0;
  // Guarda el resultado al completar el juego, salvo en modo de vista previa.
  const complete = async () => {
    if (completionHandled) return;
    completionHandled = true;
    const celebrateAndReturn = message => {
      feedback.textContent = message;
      area.querySelectorAll('button').forEach(button => { button.disabled = true; });
      window.triggerConfetti?.();
      returnToGamesTimer = setTimeout(() => {
        returnToGamesTimer = null;
        if (container.isConnected &&
            container.dataset.customGameId === String(game.id) &&
            container.classList.contains('custom-game-stage')) {
          onExit();
        }
      }, 2200);
    };
    if (isPreview || window.isStudentPreviewActive?.() === true) {
      celebrateAndReturn('¡Juego completado! 🎉');
      return;
    }
    try {
      const response = await fetch(`/api/games/custom/${encodeURIComponent(game.id)}/complete`, { method: 'POST' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo guardar el resultado del juego.');
      celebrateAndReturn('¡Juego completado! 🎉');
    } catch (error) {
      completionHandled = false;
      feedback.textContent = error.message;
    }
  };
  if (game.type === 'bridge') {
    let index = 0;
    area.className = 'bridge-game-area flex flex-col gap-5';
    // Baraja una copia de las opciones con Fisher-Yates.
    const shuffled = values => {
      const result = [...values];
      for (let position = result.length - 1; position > 0; position--) {
        const swapIndex = Math.floor(Math.random() * (position + 1));
        [result[position], result[swapIndex]] = [result[swapIndex], result[position]];
      }
      return result;
    };
    // Dibuja la pregunta actual y sus opciones para completar el puente.
    const renderBridgeQuestion = () => {
      if (index >= items.length) {
        complete();
        return;
      }
      const item = items[index];
      const targetSyllable = item.syllable.toLocaleLowerCase('es');
      let answered = false;
      const candidates = [...new Set(items
        // Normaliza las sílabas candidatas para compararlas.
        .map(candidate => candidate.syllable?.toLocaleLowerCase('es'))
        // Excluye valores vacíos y la respuesta correcta.
        .filter(syllable => syllable && syllable !== targetSyllable))];
      const choiceSyllables = shuffled([targetSyllable, ...shuffled(candidates).slice(0, 2)]);
      area.replaceChildren();

      const instruction = document.createElement('p');
      instruction.className = 'text-center text-lg font-black';
      instruction.textContent = `Completa la palabra con la sílaba que falta. Reto ${index + 1} de ${items.length}.`;
      const wordCard = document.createElement('button');
      wordCard.type = 'button';
      wordCard.className = 'mx-auto flex flex-col items-center gap-2 rounded-2xl bg-white px-6 py-4 text-3xl font-black shadow';
      wordCard.setAttribute('aria-label', `Imagen y palabra incompleta de ${item.word}. Toca para escuchar la palabra completa.`);
      // Permite escuchar la palabra completa desde su tarjeta.
      wordCard.addEventListener('click', () => window.speakText?.(item.word));
      const image = document.createElement('span');
      image.className = 'text-5xl';
      image.textContent = item.emoji;
      image.setAttribute('aria-hidden', 'true');
      const incompleteWord = document.createElement('span');
      incompleteWord.className = 'tracking-wide';
      const missingIndex = item.word.toLocaleLowerCase('es').indexOf(targetSyllable);
      incompleteWord.append(
        document.createTextNode(item.word.slice(0, missingIndex)),
        Object.assign(document.createElement('span'), {
          className: 'rounded-lg bg-amber-200 px-2 text-amber-900',
          textContent: '＿'.repeat(targetSyllable.length)
        }),
        document.createTextNode(item.word.slice(missingIndex + targetSyllable.length))
      );
      wordCard.append(image, incompleteWord);
      const repeat = document.createElement('button');
      repeat.type = 'button';
      repeat.className = 'mx-auto rounded-xl bg-white px-4 py-2 font-black shadow';
      repeat.textContent = `🔊 Escuchar: ${item.word}`;
      repeat.setAttribute('aria-label', `Escuchar la palabra ${item.word}`);
      // Repite en voz alta la palabra objetivo.
      repeat.addEventListener('click', () => window.speakText?.(item.word));

      const crossing = document.createElement('div');
      crossing.className = 'bridge-crossing rounded-3xl bg-sky-100 p-4 sm:p-6';
      crossing.setAttribute('aria-label', `Puente: ${index} de ${items.length} tablas completas`);
      const banks = document.createElement('div');
      banks.className = 'flex items-center justify-between gap-2';
      const startBank = document.createElement('span');
      startBank.className = 'text-3xl sm:text-5xl';
      startBank.textContent = '🏁';
      startBank.setAttribute('aria-label', 'Inicio');
      const bridge = document.createElement('div');
      bridge.className = 'flex min-w-0 flex-1 flex-wrap items-center justify-center gap-1.5 sm:gap-2';
      const runner = document.createElement('span');
      runner.className = 'bridge-runner text-3xl sm:text-5xl transition-transform';
      runner.textContent = '🏃';
      runner.setAttribute('aria-label', 'Personaje');
      // Dibuja cada tabla y marca la que corresponde al reto actual.
      items.forEach((bridgeItem, plankIndex) => {
        if (plankIndex === index) bridge.append(runner);
        const plank = document.createElement('div');
        plank.className = `bridge-plank flex min-h-12 min-w-10 flex-1 items-center justify-center rounded-lg border-2 px-2 font-black ${plankIndex < index ? 'border-emerald-500 bg-emerald-200 text-emerald-950' : plankIndex === index ? 'bridge-drop-target border-amber-500 bg-white text-amber-700' : 'border-slate-300 bg-slate-200 text-slate-500'}`;
        plank.textContent = plankIndex < index ? bridgeItem.syllable : plankIndex === index ? '↓' : '·';
        if (plankIndex === index) {
          plank.setAttribute('aria-label', 'Suelta aquí la sílaba correcta');
          // Mantiene disponible la zona de destino durante el arrastre.
          plank.addEventListener('dragover', event => event.preventDefault());
          // Coloca la sílaba soltada en el puente.
          plank.addEventListener('drop', event => {
            event.preventDefault();
            const syllable = event.dataTransfer?.getData('text/plain');
            if (syllable) answerBridge(syllable);
          });
        }
        bridge.append(plank);
      });
      if (index >= items.length) bridge.append(runner);
      const finishBank = document.createElement('span');
      finishBank.className = 'text-3xl sm:text-5xl';
      finishBank.textContent = '🏆';
      finishBank.setAttribute('aria-label', 'Meta');
      banks.append(startBank, bridge, finishBank);
      crossing.append(banks);

      const choices = document.createElement('div');
      choices.className = 'flex flex-wrap justify-center gap-3';
      choices.setAttribute('aria-label', 'Bloques con sílabas');
      // Evalúa una sílaba y avanza el personaje cuando es correcta.
      const answerBridge = syllable => {
        if (answered) return;
        if (syllable !== targetSyllable) {
          feedback.textContent = '¡Casi! Escucha otra vez e inténtalo con otro bloque. 💛';
          crossing.classList.remove('bridge-shake');
          void crossing.offsetWidth;
          crossing.classList.add('bridge-shake');
          return;
        }
        answered = true;
        // Desactiva las opciones después de acertar.
        choices.querySelectorAll('button').forEach(button => { button.disabled = true; });
        const completedPlank = crossing.querySelector('.bridge-drop-target');
        completedPlank.textContent = targetSyllable;
        completedPlank.className = 'bridge-plank flex min-h-12 min-w-10 flex-1 items-center justify-center rounded-lg border-2 border-emerald-500 bg-emerald-200 px-2 font-black text-emerald-950';
        completedPlank.parentElement.insertBefore(runner, completedPlank.nextSibling);
        feedback.textContent = `¡Correcto! ${item.word} contiene ${targetSyllable}. ¡El personaje cruza! 🎉`;
        window.speakText?.(`¡Muy bien! ${item.word}.`);
        index++;
        setTimeout(renderBridgeQuestion, 900);
      };
      // Crea los bloques de sílabas que se pueden tocar o arrastrar.
      choiceSyllables.forEach(syllable => {
        const block = document.createElement('button');
        block.type = 'button';
        block.className = 'custom-game-tile bridge-syllable-block min-w-20 rounded-2xl border-4 border-amber-400 bg-amber-200 px-5 py-3 text-2xl font-black shadow-lg';
        block.textContent = syllable;
        block.draggable = true;
        block.setAttribute('aria-label', `Bloque con sílaba ${syllable}. Toca o arrastra al puente.`);
        // Comprueba la sílaba elegida al tocar un bloque.
        block.addEventListener('click', () => answerBridge(syllable));
        // Guarda la sílaba transferida para el destino del puente.
        block.addEventListener('dragstart', event => {
          event.dataTransfer?.setData('text/plain', syllable);
          if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
        });
        choices.append(block);
      });
      area.append(instruction, wordCard, repeat, crossing, choices);
      feedback.textContent = 'Arrastra un bloque al espacio vacío o tócalo para colocarlo.';
    };
    renderBridgeQuestion();
  } else if (game.type === 'pairs') {
    // Crea una tarjeta de palabra y otra de imagen para cada pareja.
    const cards = items.flatMap((item, index) => [
      { kind: 'word', value: item.word, pair: index },
      { kind: 'emoji', value: item.emoji, pair: index }
    ]).sort(/* Baraja las tarjetas en orden aleatorio. */ () => Math.random() - 0.5);
    let firstCard = null;
    let waiting = false;
    // Prepara cada tarjeta y gestiona los intentos de emparejar.
    cards.forEach(card => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'custom-game-tile rounded-2xl border-2 border-white bg-white p-3 text-center text-2xl font-black shadow';
      button.textContent = '❔';
      // Revela la tarjeta, registra parejas y oculta los fallos.
      button.addEventListener('click', () => {
        window.speakText?.(items[card.pair].word);
        if (waiting || button.dataset.matched === 'true' || button === firstCard) return;
        button.textContent = card.value;
        if (!firstCard) {
          firstCard = button;
          button.dataset.pair = String(card.pair);
          return;
        }
        if (firstCard.dataset.pair === String(card.pair)) {
          firstCard.dataset.matched = 'true';
          button.dataset.matched = 'true';
          firstCard = null;
          completed++;
          feedback.textContent = `¡Pareja encontrada! ${completed} de ${items.length}`;
          if (completed === items.length) complete();
          return;
        }
        waiting = true;
        const previous = firstCard;
        firstCard = null;
        // Vuelve a ocultar ambas tarjetas tras un intento fallido.
        setTimeout(() => {
          previous.textContent = '❔';
          button.textContent = '❔';
          waiting = false;
        }, 700);
      });
      area.append(button);
    });
  } else {
    let index = 0;
    // Muestra la imagen y las letras revueltas del reto actual.
    const renderPuzzleQuestion = () => {
      if (index >= items.length) {
        complete();
        return;
      }
      const item = items[index];
      const answer = Array.from(item.word.toLocaleLowerCase('es'));
      let answered = false;
      const scrambled = [...answer];
      for (let position = scrambled.length - 1; position > 0; position--) {
        const swapIndex = Math.floor(Math.random() * (position + 1));
        [scrambled[position], scrambled[swapIndex]] = [scrambled[swapIndex], scrambled[position]];
      }
      if (scrambled.join('') === answer.join('') && scrambled.length > 1) {
        scrambled.push(scrambled.shift());
      }
      const selectedTiles = [];
      area.replaceChildren();
      const prompt = document.createElement('p');
      prompt.className = 'col-span-full text-center text-2xl font-black';
      prompt.textContent = 'Ordena las letras para escribir la palabra de esta imagen.';
      const image = makeGameSpeechButton(item.emoji, item.word, 'col-span-full mx-auto rounded-2xl bg-white px-6 py-3 text-5xl shadow');
      const slots = document.createElement('div');
      slots.className = 'col-span-full flex flex-wrap justify-center gap-2';
      const tiles = document.createElement('div');
      tiles.className = 'col-span-full flex flex-wrap justify-center gap-2';
      // Redibuja los espacios y las letras disponibles.
      const renderLetters = () => {
        slots.replaceChildren();
        // Crea un espacio para cada letra de la respuesta.
        answer.forEach((_, slotIndex) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'custom-game-tile min-w-12 rounded-xl border-2 border-purple-200 bg-white px-3 py-2 text-3xl font-black shadow';
          const selectedTile = selectedTiles[slotIndex];
          button.disabled = answered;
          button.textContent = selectedTile === undefined ? '＿' : scrambled[selectedTile].toLocaleUpperCase('es');
          button.setAttribute('aria-label', selectedTile === undefined ? 'Espacio vacío' : `Quitar letra ${scrambled[selectedTile]}`);
          // Retira del intento la letra de este espacio.
          button.addEventListener('click', () => {
            if (selectedTile === undefined) return;
            selectedTiles.splice(slotIndex, 1);
            feedback.textContent = '';
            renderLetters();
          });
          slots.append(button);
        });
        tiles.replaceChildren();
        // Muestra las letras revueltas y permite seleccionarlas.
        scrambled.forEach((letter, tileIndex) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'custom-game-tile min-w-12 rounded-xl border-2 border-white bg-white px-3 py-2 text-3xl font-black shadow';
          button.textContent = letter.toLocaleUpperCase('es');
          button.disabled = answered || selectedTiles.includes(tileIndex);
          // Añade la letra elegida y valida la palabra al completar.
          button.addEventListener('click', () => {
            if (answered || button.disabled) return;
            selectedTiles.push(tileIndex);
            renderLetters();
            if (selectedTiles.length === answer.length) {
              // Compara las letras seleccionadas con la respuesta.
              const attempt = selectedTiles.map(selected => scrambled[selected]).join('');
              if (attempt === answer.join('')) {
                answered = true;
                feedback.textContent = `¡Muy bien! ${item.word} ${item.emoji}`;
                // Bloquea las letras del reto ya resuelto.
                area.querySelectorAll('button').forEach(letterButton => { letterButton.disabled = true; });
                index++;
                setTimeout(renderPuzzleQuestion, 700);
              } else {
                feedback.textContent = 'Casi lo tienes. Puedes cambiar las letras e intentarlo otra vez.';
              }
            }
          });
          tiles.append(button);
        });
      };
      const clearButton = document.createElement('button');
      clearButton.type = 'button';
      clearButton.className = 'col-span-full mx-auto rounded-xl bg-purple-100 px-4 py-2 font-black text-purple-800';
      clearButton.textContent = 'Borrar letras';
      // Vacía la selección para que el alumno pueda empezar de nuevo.
      clearButton.addEventListener('click', () => {
        if (answered) return;
        selectedTiles.length = 0;
        feedback.textContent = '';
        renderLetters();
      });
      area.append(prompt, image, slots, tiles, clearButton);
      feedback.textContent = `Reto ${index + 1} de ${items.length}`;
      renderLetters();
    };
    renderPuzzleQuestion();
  }
  container.append(header, guidance, area, feedback);
  window.speakText?.(helpText);
}
