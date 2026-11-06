let editingCustomLessonId = null;
let editingCatalogLessonId = null;
let emojiPickerInput = null;
let emojiPickerCategory = 'Todos';
let teacherDashboardInitialized = false;
const emojiCategories = ['Todos', 'Animales', 'Frutas y alimentos', 'Naturaleza', 'Lugares y transporte', 'Caras y personas', 'Objetos y actividades'];

// Normaliza texto de emoji para buscarlo y categorizarlo sin tildes.

function normalizeEmojiText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('es');
}

// Clasifica un emoji según sus palabras clave para filtrar por categoría.

function emojiCategory(item) {
  const keywords = normalizeEmojiText(item.keywords);
  if (/perro|gato|animal|oso|panda|koala|tigre|leon|vaca|cerdo|rana|mono|pollo|pajar|ave|pato|aguila|buho|lobo|caballo|unicornio|abeja|gusano|mariposa|caracol|insecto|tortuga|serpiente|lagartija|dinosaurio|pulpo|calamar|cangrejo|pez|pescado|delfin|ballena|tiburon|cocodrilo|cebra|jirafa|elefante|canguro|llama|nutria|erizo|loro|cisne|flamenco|ganso|pavo|gallo|pollito|medusa|foca|camaron|langosta|ostra/.test(keywords)) return 'Animales';
  if (/fruta|manzana|pera|naranja|limon|banana|platano|sandia|uva|fresa|arandano|cereza|durazno|mango|pina|coco|kiwi|melon|lima|comida|verdura|tomate|aguacate|zanahoria|maiz|pimiento|pepino|brocoli|lechuga|papa|pan|queso|huevo|pastel|galleta|helado|miel|leche|jugo|palomitas|frijol|mani|castana|aceituna|jengibre|guisante|croissant|pretzel|bagel|panqueque|waffle|tocino|pollo|carne|hamburguesa|pizza|sopa|arroz|sushi|chocolate|dulce|te/.test(keywords)) return 'Frutas y alimentos';
  if (/arbol|bosque|pino|palmera|cactus|flor|trebol|hoja|hongo|arcoiris|sol|luna|estrella|nube|lluvia|nieve|frio|fuego|agua|gota|mar|ola|planeta|montana|isla|playa|campamento|parque|naturaleza|volcan|desierto|rio|puente|tornado|brote|trigo|niebla/.test(keywords)) return 'Naturaleza';
  if (/casa|hogar|escuela|colegio|hospital|castillo|carro|coche|auto|autobus|bus|bicicleta|bici|tren|avion|cohete|barco|bombero|tractor|helicoptero|taxi|camion|policia|ambulancia|lancha|canoa|teleferico|gondola|semaforo|patin|moto|ovni|parque|playa|estadio|fuente|carretera|museo|fabrica|tienda|banco|choza|torre|estatua|iglesia|templo/.test(keywords)) return 'Lugares y transporte';
  if (/bebe|nina|nino|mujer|mama|hombre|papa|abuela|abuelo|maestra|profesora|amigo|amistad|corazon|amor|feliz|sonrisa|dormir|sueno|pensar|duda|aplauso|pulgar/.test(keywords)) return 'Caras y personas';
  return 'Objetos y actividades';
}

// Abre el selector de emoji para un campo concreto del formulario.

function openEmojiPicker(input) {
  emojiPickerInput = input;
  emojiPickerCategory = 'Todos';
  const modal = document.getElementById('emoji-picker-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.getElementById('emoji-picker-search').value = '';
  renderEmojiPicker();
  document.getElementById('emoji-picker-search').focus();
}

// Cierra el modal del selector de emoji y limpia la selección.

function closeEmojiPicker() {
  const modal = document.getElementById('emoji-picker-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  emojiPickerInput = null;
}

// Dibuja los emojis filtrados por categoría y texto de búsqueda.

function renderEmojiPicker() {
  const categoryContainer = document.getElementById('emoji-picker-categories');
  const results = document.getElementById('emoji-picker-results');
  if (!categoryContainer || !results) return;
  categoryContainer.replaceChildren();
  // Dibuja cada categoria del selector con el estado activo actual.
  emojiCategories.forEach(category => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `rounded-full px-3 py-1.5 text-xs font-black ${emojiPickerCategory === category ? 'bg-purple-700 text-white' : 'bg-purple-50 text-purple-800'}`;
    button.textContent = category;
    button.setAttribute('aria-pressed', String(emojiPickerCategory === category));
    // Guarda la categoria elegida y vuelve a renderizar la vista.
    button.addEventListener('click', () => {
      emojiPickerCategory = category;
      renderEmojiPicker();
    });
    categoryContainer.append(button);
  });
  const searchTerms = normalizeEmojiText(document.getElementById('emoji-picker-search').value)
    .split(/\s+/)
    .filter(Boolean);
  // Filtra el catalogo para mostrar solo emojis relevantes a la busqueda.
  const matches = LESSON_EMOJIS.filter(item =>
    (emojiPickerCategory === 'Todos' || emojiCategory(item) === emojiPickerCategory) &&
    searchTerms.every(term => normalizeEmojiText(`${item.keywords} ${item.emoji}`).includes(term))
  );
  results.replaceChildren();
  matches.forEach(({ emoji, keywords }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'emoji-picker-option rounded-2xl border-2 border-purple-100 bg-white p-2 text-center hover:bg-purple-50';
    button.textContent = emoji;
    button.title = keywords;
    button.setAttribute('role', 'option');
    button.setAttribute('aria-label', `${keywords}: ${emoji}`);
    // Inserta el emoji elegido en el campo que abrio el selector.
    button.addEventListener('click', () => {
      const selectedInput = emojiPickerInput;
      if (selectedInput) {
        selectedInput.value = emoji;
        selectedInput.dispatchEvent(new Event('input', { bubbles: true }));
        selectedInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      closeEmojiPicker();
    });
    results.append(button);
  });
  if (!matches.length) {
    const empty = document.createElement('p');
    empty.className = 'col-span-full py-6 text-center text-sm font-bold text-slate-500';
    empty.textContent = 'No encontramos emojis con esa búsqueda.';
    results.append(empty);
  }
}

// Cambia el panel activo de la vista del profesor.

function switchTeacherModule(moduleName) {
  // Oculta todos los paneles salvo el modulo activo del profesor.
  document.querySelectorAll('.teacher-module-panel').forEach(panel => {
    panel.classList.toggle('hidden', panel.id !== `teacher-module-${moduleName}`);
  });
  // Marca la pestana visible segun el modulo actual.
  document.querySelectorAll('.teacher-module-tab').forEach(button => {
    button.classList.toggle('active', button.getAttribute('onclick')?.includes(`'${moduleName}'`));
  });
  if (moduleName === 'lesson') loadTeacherLessons();
  if (moduleName === 'game') loadTeacherGames();
}

// Abre el panel del profesor y carga la lista de alumnos.

async function openTeacherDashboard() {
  if (!hasFullAccess()) return;
  const modal = document.getElementById('teacher-dashboard-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  const select = document.getElementById('teacher-student-select');
  const message = document.getElementById('teacher-dashboard-message');
  const selectedBefore = select.value;
  message.innerText = 'Cargando alumnos...';
  try {
    const response = await fetch('/api/teacher/students');
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se pudieron cargar los alumnos.');
    select.replaceChildren(new Option('Selecciona un alumno', ''));
    // Carga cada alumno en el selector del panel docente.
    result.students.forEach(student => select.add(new Option(`${student.name} (@${student.username})`, student.id)));
    if (result.students.some(student => student.id === selectedBefore)) select.value = selectedBefore;
    await onTeacherStudentChange();
    message.innerText = result.students.length ? '' : 'Aún no hay cuentas de alumno registradas.';
  } catch (error) {
    message.innerText = error.message;
  }
}

// Cierra el panel del profesor y oculta sus datos.

function closeTeacherDashboard() {
  const modal = document.getElementById('teacher-dashboard-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function setTeacherCreationAvailability(studentId) {
  const enabled = Boolean(studentId);
  const notice = document.getElementById('teacher-student-required');
  if (notice) notice.classList.toggle('hidden', enabled);
  ['custom-lesson-form', 'custom-game-form'].forEach(formId => {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll('input, select, textarea, button').forEach(control => {
      control.disabled = !enabled;
    });
  });
}

// Recarga los reportes cuando cambia el alumno seleccionado.

async function onTeacherStudentChange() {
  const studentId = document.getElementById('teacher-student-select').value;
  setTeacherCreationAvailability(studentId);
  const reportTitle = document.getElementById('student-report-title');
  document.getElementById('student-report-sections').replaceChildren();
  document.getElementById('student-report-lessons').replaceChildren();
  document.getElementById('student-assigned-lessons').replaceChildren();
  if (!studentId) {
    reportTitle.innerText = 'Selecciona un alumno para ver su progreso';
    document.getElementById('progress-reset-lesson').replaceChildren();
    if (editingCustomLessonId || editingCatalogLessonId) {
      editingCustomLessonId = null;
      editingCatalogLessonId = null;
      document.getElementById('custom-lesson-form').reset();
      document.getElementById('custom-lesson-submit').textContent = 'Asignar lección';
      document.getElementById('custom-lesson-cancel-edit').classList.add('hidden');
    }
    await Promise.all([loadTeacherLessons(), loadTeacherGames(), refreshMapPositionOptions()]);
    return;
  }
  await Promise.all([
    loadStudentReport(), loadTeacherResetLessons(), loadTeacherLessons(), loadTeacherGames(),
    refreshMapPositionOptions()
  ]);
}

// Ordena las lecciones para mostrarlas según su posición en el mapa.

function orderLessonsForMap(customLessons = []) {
  const items = [...ALL_LESSONS];
  [...customLessons]
    .sort((left, right) => (left.mapPosition ?? Number.MAX_SAFE_INTEGER) - (right.mapPosition ?? Number.MAX_SAFE_INTEGER) ||
      (left.createdAt || 0) - (right.createdAt || 0))
    .forEach(lesson => {
      const position = Number.isInteger(lesson.mapPosition) ? lesson.mapPosition : items.length;
      items.splice(Math.min(Math.max(position, 0), items.length), 0, lesson);
    });
  return items;
}

async function refreshMapPositionOptions(selectedPosition = null) {
  const select = document.getElementById('custom-lesson-map-position');
  if (!select) return;
  const studentId = document.getElementById('teacher-student-select').value;
  select.replaceChildren();
  if (!studentId) {
    select.add(new Option('Selecciona un alumno para elegir la posición', '0'));
    select.disabled = true;
    return;
  }
  select.disabled = false;
  let customLessons = [];
  const response = await fetch(`/api/teacher/students/${encodeURIComponent(studentId)}/experience`);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'No se pudo cargar el orden del mapa.');
  customLessons = result.lessons.filter(lesson => lesson.id !== editingCustomLessonId);
  const existingItems = orderLessonsForMap(customLessons);
  for (let position = 0; position <= existingItems.length; position++) {
    const itemAtPosition = existingItems[position];
    const label = position === 0
      ? 'Al inicio del mapa'
      : itemAtPosition
        ? `Antes de ${itemAtPosition.name || itemAtPosition.title}`
        : 'Al final del mapa';
    select.add(new Option(`${label} · posición ${position + 1}`, String(position)));
  }
  select.value = String(selectedPosition ?? existingItems.length);
  if (select.selectedIndex < 0) select.value = String(existingItems.length);
}

async function loadStudentReport() {
  const studentId = document.getElementById('teacher-student-select').value;
  if (!studentId) return;
  const message = document.getElementById('teacher-dashboard-message');
  try {
    const response = await fetch(`/api/teacher/students/${encodeURIComponent(studentId)}/progress`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se pudo cargar el progreso del alumno.');
    document.getElementById('student-report-title').innerText = `Reporte de ${result.student.name}`;
    const sections = document.getElementById('student-report-sections');
    result.sections.forEach(section => {
      const card = document.createElement('article');
      card.className = 'rounded-2xl border-2 border-purple-100 bg-white p-4 shadow-sm';
      const title = document.createElement('h4');
      title.className = 'font-black font-fredoka text-lg text-purple-900';
      title.textContent = section.category;
      const score = document.createElement('p');
      score.className = 'mt-1 text-2xl font-black text-emerald-600';
      score.textContent = `${section.weightedScore}% · ${section.points} puntos`;
      const details = document.createElement('p');
      details.className = 'mt-1 text-sm font-bold text-slate-600';
      details.textContent = `${section.attempts} intentos · ${section.repetitions} repeticiones · ${section.mistakes} errores · ${section.firstStars} ⭐ primera vez · ${section.retryStars} ⭐ en reintentos`;
      card.append(title, score, details);
      sections.append(card);
    });

    const lessonNames = new Map(ALL_LESSONS.map(lesson => [lesson.id, lesson.name]));
    result.customLessons.forEach(lesson => lessonNames.set(lesson.id, lesson.title));
    const lessonContainer = document.getElementById('student-report-lessons');
    const heading = document.createElement('h4');
    heading.className = 'font-black font-fredoka text-lg text-purple-950 mb-2';
    heading.textContent = 'Lecciones con más repeticiones';
    lessonContainer.append(heading);
    const lessonList = document.createElement('div');
    lessonList.className = 'space-y-2';
    // Ordena las lecciones por repeticion y nombre para el informe del alumno.
    const sortedLessons = [...result.lessons].sort((left, right) =>
      right.attempts - left.attempts || String(lessonNames.get(left.lessonId) || left.lessonId)
        .localeCompare(String(lessonNames.get(right.lessonId) || right.lessonId), 'es'));
    if (!sortedLessons.length) {
      const empty = document.createElement('p');
      empty.className = 'text-sm font-bold text-slate-500';
      empty.textContent = 'Todavía no hay resultados por lección.';
      lessonList.append(empty);
    }
    sortedLessons.forEach(lesson => {
      const item = document.createElement('article');
      item.className = 'flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sky-50 px-3 py-2 text-sm';
      const name = document.createElement('span');
      name.className = 'font-black text-slate-800';
      name.textContent = `${lessonNames.get(lesson.lessonId) || lesson.lessonId} · ${lesson.category}`;
      const score = document.createElement('span');
      score.className = 'font-bold text-slate-700';
      score.innerHTML = `${'★'.repeat(lesson.latestStars)}${'☆'.repeat(3 - lesson.latestStars)} · ${Math.max(0, lesson.attempts - 1)} repeticiones · primera vez ${lesson.firstStars} ⭐ · reintentos ${lesson.retryStars} ⭐ · mejor ${'★'.repeat(lesson.bestStars)}${'☆'.repeat(3 - lesson.bestStars)}`;
      item.append(name, score);
      lessonList.append(item);
    });
    lessonContainer.append(lessonList);

    const customContainer = document.getElementById('student-assigned-lessons');
    const customHeading = document.createElement('h4');
    customHeading.className = 'font-black font-fredoka text-lg text-purple-950 mb-2';
    customHeading.textContent = 'Lecciones personalizadas asignadas';
    customContainer.append(customHeading);
    if (!result.customLessons.length) {
      const empty = document.createElement('p');
      empty.className = 'text-sm font-bold text-slate-500';
      empty.textContent = 'Todavía no hay lecciones personalizadas.';
      customContainer.append(empty);
    } else {
      // Muestra cada leccion personalizada asignada con su avance actual.
      result.customLessons.forEach(lesson => {
        const progress = result.lessons.find(item => item.lessonId === lesson.id);
        const item = document.createElement('p');
        item.className = 'mb-2 rounded-xl bg-sky-50 px-3 py-2 text-sm font-bold text-slate-700';
        item.textContent = `${lesson.title} · ${lesson.category} · ${progress ? `${progress.latestStars} ⭐ · ${progress.attempts} intentos` : 'Pendiente'}`;
        customContainer.append(item);
      });
    }
    const gameContainer = document.getElementById('student-assigned-games');
    gameContainer.replaceChildren();
    const gameHeading = document.createElement('h4');
    gameHeading.className = 'font-black font-fredoka text-lg text-purple-950 mb-2';
    gameHeading.textContent = 'Juegos asignados';
    gameContainer.append(gameHeading);
    if (!result.customGames.length) {
      const empty = document.createElement('p');
      empty.className = 'text-sm font-bold text-slate-500';
      empty.textContent = 'Todavía no hay juegos personalizados.';
      gameContainer.append(empty);
    } else {
      // Resume cada juego asignado con su estado actual de intentos o finalizacion.
      result.customGames.forEach(game => {
        const item = document.createElement('p');
        item.className = 'mb-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-slate-700';
        const typeLabel = game.type === 'bridge' ? 'Puente de los bloques mágicos' : game.type === 'pairs' ? 'Memoria de parejas' : 'Rompecabezas';
        item.textContent = `${game.title} · ${typeLabel} · ${game.completedAt ? 'Completado' : `${game.attempts} intentos`}`;
        gameContainer.append(item);
      });
    }
    message.innerText = '';
  } catch (error) {
    message.innerText = error.message;
  }
}

// Añade una fila con palabra, emoji y, si hace falta, sílaba.

function addTeacherWordRow(containerId) {
  const container = document.getElementById(containerId);
  if (container.children.length >= (containerId === 'game-word-rows' ? 12 : 8)) return;
  const row = document.createElement('div');
  row.className = `teacher-word-row grid gap-2 items-start ${containerId === 'game-word-rows' ? 'teacher-game-word-row' : ''}`;
  const word = document.createElement('input');
  word.className = 'teacher-word-input min-w-0 rounded-xl border-2 border-purple-200 bg-white p-3 text-sm';
  word.placeholder = 'Palabra';
  word.maxLength = 40;
  word.required = true;
  word.autocomplete = 'off';
  word.setAttribute('aria-label', 'Palabra de la actividad');
  const emojiWrap = document.createElement('div');
  const emoji = document.createElement('input');
  emoji.type = 'hidden';
  emoji.className = 'teacher-emoji-input';
  emoji.maxLength = 16;
  emoji.required = true;
  emoji.setAttribute('aria-label', 'Imagen emoji');
  emoji.value = '✨';
  const chooseEmoji = document.createElement('button');
  chooseEmoji.type = 'button';
  chooseEmoji.className = 'emoji-picker-trigger rounded-xl border-2 border-purple-200 bg-white px-3 py-2 text-2xl';
  chooseEmoji.textContent = emoji.value;
  chooseEmoji.title = 'Seleccionar emoji';
  chooseEmoji.setAttribute('aria-label', 'Seleccionar emoji para la imagen');
  // Abre el selector de emojis desde el boton del formulario.
  chooseEmoji.addEventListener('click', () => openEmojiPicker(emoji));
  emoji.addEventListener('change', () => { chooseEmoji.textContent = emoji.value || '✨'; });
  emojiWrap.append(emoji, chooseEmoji);
  const syllable = document.createElement('input');
  syllable.className = 'teacher-syllable-input min-w-0 rounded-xl border-2 border-purple-200 bg-white p-3 text-sm hidden';
  syllable.placeholder = 'Sílaba que falta';
  syllable.maxLength = 12;
  syllable.setAttribute('aria-label', 'Sílaba que falta en la palabra');
  syllable.required = containerId === 'game-word-rows' && document.getElementById('custom-game-type')?.value === 'bridge';
  if (containerId === 'game-word-rows' && document.getElementById('custom-game-type')?.value === 'bridge') {
    syllable.classList.remove('hidden');
  }
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'rounded-xl border-2 border-rose-100 px-3 py-2.5 font-black text-rose-600';
  remove.textContent = '×';
  remove.setAttribute('aria-label', 'Quitar palabra');
  // Elimina la fila al quitar una palabra del formulario.
  remove.addEventListener('click', () => row.remove());
  row.append(word);
  if (containerId === 'game-word-rows') row.append(syllable);
  row.append(emojiWrap, remove);
  container.append(row);
  updateGameWordRows();
  word.focus();
}

// Activa o oculta campos según el tipo de juego personalizado.

function updateGameWordRows() {
  const bridge = document.getElementById('custom-game-type')?.value === 'bridge';
  const container = document.getElementById('game-word-rows');
  if (container) {
    // Ajusta la fila segun el tipo de juego y oculta la silaba si no aplica.
    container.querySelectorAll('.teacher-game-word-row').forEach(row => {
      const syllable = row.querySelector('.teacher-syllable-input');
      syllable.classList.toggle('hidden', !bridge);
      syllable.required = bridge;
      row.classList.toggle('bridge-word-row', bridge);
    });
  }
  const heading = document.getElementById('custom-game-items-heading');
  const help = document.getElementById('custom-game-items-help');
  const addButton = document.querySelector('#custom-game-form button[onclick*="game-word-rows"]');
  if (heading) heading.textContent = bridge ? 'Palabras y sílabas del puente' : 'Pares de palabra e imagen';
  if (help) help.textContent = bridge
    ? 'Escribe cada palabra, elige la sílaba que quitarás y asigna su imagen. El alumno verá el espacio vacío y completará la palabra con las sílabas que configures.'
    : '';
  if (addButton) addButton.textContent = bridge ? '+ Añadir palabra al puente' : '+ Añadir pareja';
}

async function loadTeacherLessons() {
  const container = document.getElementById('teacher-lesson-list');
  if (!container) return;
  container.replaceChildren();
  const heading = document.createElement('h4');
  heading.className = 'font-black font-fredoka text-lg text-purple-950 mb-2';
  heading.textContent = 'Lecciones creadas';
  container.append(heading);
  const studentId = document.getElementById('teacher-student-select').value;
  if (!studentId) {
    const empty = document.createElement('p');
    empty.className = 'text-sm font-bold text-slate-500';
    empty.textContent = 'Selecciona un alumno para consultar sus lecciones asignadas.';
    container.append(empty);
    await loadTeacherCatalogLessons();
    return;
  }
  try {
    const response = await fetch(`/api/teacher/lessons?studentId=${encodeURIComponent(studentId)}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se pudieron cargar las lecciones creadas.');
    if (!result.lessons.length) {
      const empty = document.createElement('p');
      empty.className = 'text-sm font-bold text-slate-500';
      empty.textContent = 'Todavía no has creado lecciones.';
      container.append(empty);
      await loadTeacherCatalogLessons();
      return;
    }
    const list = document.createElement('div');
    list.className = 'space-y-2';
    result.lessons.forEach(lesson => {
      const item = document.createElement('article');
      item.className = 'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-100 bg-white p-3';
      const details = document.createElement('p');
      details.className = 'min-w-48 flex-1 text-sm font-bold text-slate-700';
      details.textContent = `${lesson.title} · ${lesson.category} / ${lesson.subcategory} · ${lesson.studentName} (@${lesson.studentUsername})`;
      const actions = document.createElement('div');
      actions.className = 'flex flex-wrap gap-2';
      const preview = document.createElement('button');
      preview.type = 'button';
      preview.className = 'rounded-lg bg-emerald-100 px-3 py-2 text-sm font-black text-emerald-900';
      preview.textContent = 'Probar';
      preview.addEventListener('click', () => openCustomLessonPreview(lesson));
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'rounded-lg bg-sky-100 px-3 py-2 text-sm font-black text-sky-900';
      edit.textContent = 'Editar';
      edit.addEventListener('click', () => editCustomLesson(lesson));
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'rounded-lg bg-rose-100 px-3 py-2 text-sm font-black text-rose-800';
      remove.textContent = 'Borrar';
      remove.addEventListener('click', () => deleteTeacherContent('lessons', lesson.id, lesson.title, async () => {
        await onTeacherStudentChange();
      }));
      actions.append(preview, edit, remove);
      item.append(details, actions);
      list.append(item);
    });
    container.append(list);
    await loadTeacherCatalogLessons();
  } catch (error) {
    showTeacherListError(container, error.message);
  }
}

async function loadTeacherCatalogLessons() {
  const container = document.getElementById('teacher-catalog-lesson-list');
  container.replaceChildren();
  if (!document.getElementById('teacher-student-select').value) {
    const notice = document.createElement('p');
    notice.className = 'text-sm font-bold text-slate-500';
    notice.textContent = 'Selecciona un alumno para consultar o modificar el catálogo de lecciones.';
    container.append(notice);
    return;
  }
  const heading = document.createElement('h4');
  heading.className = 'mb-2 font-black font-fredoka text-lg text-purple-950';
  heading.textContent = 'Lecciones del catálogo';
  container.append(heading);
  const list = document.createElement('div');
  list.className = 'space-y-2';
  ALL_LESSONS.filter(lesson => !lesson.isMilestone).forEach(lesson => {
    const item = document.createElement('article');
    item.className = 'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-purple-100 bg-white p-3';
    const details = document.createElement('p');
    details.className = 'flex-1 text-sm font-bold text-slate-700';
    details.textContent = `${lesson.name} · ${lessonReportCategory(lesson)}${lesson.subcategory ? ` / ${lesson.subcategory}` : ''}`;
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'rounded-lg bg-sky-100 px-3 py-2 text-sm font-black text-sky-900';
    edit.textContent = 'Editar lección';
    edit.addEventListener('click', () => editCatalogLesson(lesson));
    item.append(details, edit);
    list.append(item);
  });
  container.append(list);
}

// Rellena el formulario de lección con los datos de una actividad.

function setLessonFormValues(lesson, words, emojis) {
  const form = document.getElementById('custom-lesson-form');
  document.getElementById('custom-lesson-map-position').parentElement.classList.toggle('hidden', Boolean(editingCatalogLessonId));
  document.getElementById('custom-lesson-title').value = lesson.name || lesson.title || '';
  document.getElementById('custom-lesson-category').value = lessonReportCategory(lesson);
  updateLessonSubcategories();
  document.getElementById('custom-lesson-subcategory').value = lesson.subcategory || '';
  document.getElementById('custom-lesson-target').value = lesson.target || '';
  document.getElementById('custom-lesson-description').value = lesson.description || lesson.mouth || '';
  document.getElementById('custom-lesson-theme').value = lesson.theme || 'violet';
  document.getElementById('custom-lesson-map-position').value = String(lesson.mapPosition ?? 0);
  const rows = document.getElementById('lesson-word-rows');
  rows.replaceChildren();
  const items = words || (lesson.examples || []).map(example => example.w);
  const images = emojis || (lesson.examples || []).map(example => example.emoji);
  items.forEach((word, index) => {
    addTeacherWordRow('lesson-word-rows');
    const row = rows.lastElementChild;
    row.querySelector('.teacher-word-input').value = word;
    row.querySelector('.teacher-emoji-input').value = images[index] || '📖';
    row.querySelector('.teacher-emoji-input').dispatchEvent(new Event('change', { bubbles: true }));
  });
  while (rows.children.length < 2) addTeacherWordRow('lesson-word-rows');
  const filters = lesson.wordFilters || {};
  document.getElementById('lesson-filter-level').value = filters.level || 'basic';
  document.getElementById('lesson-filter-syllables').value = filters.syllables || 'any';
  document.getElementById('lesson-filter-position').value = filters.targetPosition || 'any';
  document.getElementById('lesson-filter-structure').value = filters.structure || 'any';
  document.getElementById('word-lesson-filters').classList.toggle('hidden', lessonReportCategory(lesson) !== 'Palabras');
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function editCustomLesson(lesson) {
  editingCustomLessonId = lesson.id;
  editingCatalogLessonId = null;
  const select = document.getElementById('teacher-student-select');
  select.value = lesson.studentId;
  await onTeacherStudentChange();
  setLessonFormValues(lesson, lesson.words, lesson.emojis);
  document.getElementById('custom-lesson-submit').textContent = 'Guardar cambios';
  document.getElementById('custom-lesson-cancel-edit').classList.remove('hidden');
  switchTeacherModule('lesson');
}

// Carga una lección del catálogo para editarla en el panel del profesor.

function editCatalogLesson(lesson) {
  editingCustomLessonId = null;
  editingCatalogLessonId = lesson.id;
  setLessonFormValues(lesson);
  document.getElementById('custom-lesson-submit').textContent = 'Guardar cambios del catálogo';
  document.getElementById('custom-lesson-cancel-edit').classList.remove('hidden');
}

// Cancela la edición de una lección y vuelve al formulario base.

function cancelLessonEdit() {
  editingCustomLessonId = null;
  editingCatalogLessonId = null;
  document.getElementById('custom-lesson-form').reset();
  document.getElementById('lesson-word-rows').replaceChildren();
  for (let index = 0; index < 3; index++) addTeacherWordRow('lesson-word-rows');
  document.getElementById('custom-lesson-submit').textContent = 'Asignar lección';
  document.getElementById('custom-lesson-cancel-edit').classList.add('hidden');
  document.getElementById('custom-lesson-map-position').parentElement.classList.remove('hidden');
  updateLessonSubcategories();
  refreshMapPositionOptions().catch(error => {
    document.getElementById('teacher-dashboard-message').innerText = error.message;
  });
}

// Muestra un mensaje de error dentro de una lista del dashboard.

function showTeacherListError(container, message) {
  const error = document.createElement('p');
  error.className = 'rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700';
  error.textContent = message;
  container.append(error);
}

// Borra contenido del profesor tras confirmar la acción.

async function deleteTeacherContent(type, id, title, refresh) {
  if (!confirm(`¿Quieres borrar "${title}"? Esta acción no se puede deshacer.`)) return;
  const message = document.getElementById('teacher-dashboard-message');
  try {
    const response = await fetch(`/api/teacher/${type}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se pudo borrar el contenido.');
    await refresh();
    message.innerText = 'Se borró correctamente.';
  } catch (error) {
    message.innerText = error.message;
  }
}

// Crea o actualiza una lección personalizada y la asigna al alumno.

async function createCustomLesson(event) {
  event.preventDefault();
  const studentId = document.getElementById('teacher-student-select').value;
  if (!studentId) {
    document.getElementById('teacher-dashboard-message').innerText = 'Selecciona un alumno antes de asignar la lección.';
    return;
  }
  const rows = [...document.querySelectorAll('#lesson-word-rows .teacher-word-row')];
  const words = rows.map(row => row.querySelector('.teacher-word-input').value.trim());
  const emojis = rows.map(row => row.querySelector('.teacher-emoji-input').value.trim());
  if (words.length < 2 || words.length > (editingCatalogLessonId ? 20 : 8)) {
    document.getElementById('teacher-dashboard-message').innerText = 'Añade al menos dos palabras con su imagen.';
    return;
  }
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"], button:not([type])');
  button.disabled = true;
  try {
    const wasEdit = Boolean(editingCatalogLessonId || editingCustomLessonId);
    const category = document.getElementById('custom-lesson-category').value;
    const lesson = editingCatalogLessonId
      ? ALL_LESSONS.find(item => item.id === editingCatalogLessonId)
      : null;
    const payload = {
      studentId,
      title: document.getElementById('custom-lesson-title').value.trim(),
      description: document.getElementById('custom-lesson-description').value.trim(),
      category,
      subcategory: document.getElementById('custom-lesson-subcategory').value,
      target: document.getElementById('custom-lesson-target').value.trim(),
      theme: document.getElementById('custom-lesson-theme').value,
      mapPosition: Number(document.getElementById('custom-lesson-map-position').value),
      words,
      emojis,
      wordFilters: {
        level: document.getElementById('lesson-filter-level').value,
        syllables: document.getElementById('lesson-filter-syllables').value,
        targetPosition: document.getElementById('lesson-filter-position').value,
        structure: document.getElementById('lesson-filter-structure').value
      }
    };
    const isCatalogEdit = Boolean(editingCatalogLessonId);
    if (isCatalogEdit) {
      payload.syllables = lesson?.syllables || [];
      payload.readingText = lesson?.readingText || '';
      payload.options = lesson?.options || [...new Set([payload.target, 'A', 'O'])];
    }
    const route = isCatalogEdit
      ? `/api/teacher/lessons/catalog/${encodeURIComponent(editingCatalogLessonId)}`
      : editingCustomLessonId
        ? `/api/teacher/lessons/${encodeURIComponent(editingCustomLessonId)}`
        : '/api/teacher/lessons';
    const response = await fetch(route, {
      method: isCatalogEdit || editingCustomLessonId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se pudo asignar la lección.');
    if (isCatalogEdit) {
      Object.assign(lesson, result.override, {
        name: result.override.title,
        reportCategory: result.override.category,
        description: result.override.description || result.override.mouth
      });
      renderContinuousMap();
    }
    editingCustomLessonId = null;
    editingCatalogLessonId = null;
    form.reset();
    document.getElementById('lesson-word-rows').replaceChildren();
    for (let index = 0; index < 3; index++) addTeacherWordRow('lesson-word-rows');
    document.getElementById('custom-lesson-submit').textContent = 'Asignar lección';
    document.getElementById('custom-lesson-cancel-edit').classList.add('hidden');
    document.getElementById('custom-lesson-map-position').parentElement.classList.remove('hidden');
    updateLessonSubcategories();
    await loadTeacherLessons();
    await onTeacherStudentChange();
    switchTeacherModule('report');
    document.getElementById('teacher-dashboard-message').innerText = wasEdit
      ? 'Lección actualizada correctamente.'
      : 'Lección asignada correctamente.';
  } catch (error) {
    document.getElementById('teacher-dashboard-message').innerText = error.message;
  } finally {
    button.disabled = false;
  }
}

// Carga las lecciones disponibles para resetear progreso de un alumno.

async function loadTeacherResetLessons() {
  const studentId = document.getElementById('teacher-student-select').value;
  const select = document.getElementById('progress-reset-lesson');
  select.replaceChildren();
  if (!studentId) return;
  const response = await fetch(`/api/teacher/students/${encodeURIComponent(studentId)}/progress`);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'No se pudieron cargar las lecciones.');
  const lessons = [
    ...ALL_LESSONS.filter(lesson => !lesson.isMilestone).map(lesson => ({ id: lesson.id, name: lesson.name })),
    ...result.customLessons.map(lesson => ({ id: lesson.id, name: lesson.title }))
  ];
  lessons.forEach(lesson => select.add(new Option(lesson.name, lesson.id)));
}

// Reinicia el progreso del alumno según el ámbito solicitado.

async function resetStudentProgress() {
  const studentId = document.getElementById('teacher-student-select').value;
  if (!studentId) {
    document.getElementById('teacher-dashboard-message').innerText = 'Selecciona un alumno antes de reiniciar el progreso.';
    return;
  }
  const scope = document.getElementById('progress-reset-scope').value;
  const details = { studentId, scope };
  if (scope === 'lesson') details.lessonId = document.getElementById('progress-reset-lesson').value;
  if (scope === 'section') details.category = document.getElementById('progress-reset-section').value;
  const descriptions = {
    all: 'todo el progreso, incluidos los puntos y juegos',
    lesson: `la lección ${document.getElementById('progress-reset-lesson').selectedOptions[0]?.textContent || ''}`,
    section: `la sección ${details.category}`
  };
  if (!confirm(`¿Quieres reiniciar ${descriptions[scope]} de este alumno?`)) return;
  const message = document.getElementById('teacher-dashboard-message');
  try {
    const response = await fetch('/api/progress/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se pudo reiniciar el progreso.');
    await onTeacherStudentChange();
    message.innerText = 'El progreso seleccionado se reinició correctamente.';
  } catch (error) {
    message.innerText = error.message;
  }
}

// Actualiza las subcategorías disponibles según la categoría elegida.

function updateLessonSubcategories() {
  const category = document.getElementById('custom-lesson-category')?.value;
  const select = document.getElementById('custom-lesson-subcategory');
  if (!select) return;
  const subcategories = {
    Vocales: ['Vocales'],
    Consonantes: ['Consonantes iniciales', 'Sílabas trabadas', 'Dígrafos y sonidos especiales'],
    'Sílabas': ['Sílabas directas', 'Sílabas inversas', 'Sílabas trabadas y mixtas'],
    Palabras: ['1 sílaba', '2 sílabas', '3 o más sílabas', 'Frases y lectura']
  };
  const selected = select.value;
  select.replaceChildren(...(subcategories[category] || []).map(value => new Option(value, value)));
  if ((subcategories[category] || []).includes(selected)) select.value = selected;
  document.getElementById('word-lesson-filters').classList.toggle('hidden', category !== 'Palabras');
}

// Inicializa los formularios y listeners del dashboard del profesor.

function initializeTeacherDashboard() {
  if (teacherDashboardInitialized) return;
  teacherDashboardInitialized = true;
  for (let index = 0; index < 3; index++) addTeacherWordRow('lesson-word-rows');
  for (let index = 0; index < 4; index++) addTeacherWordRow('game-word-rows');
  updateLessonSubcategories();
  document.getElementById('custom-game-type').addEventListener('change', updateGameWordRows);
  // Refresca la lista de emojis al escribir filtros de busqueda.
  document.getElementById('emoji-picker-search').addEventListener('input', renderEmojiPicker);
  // Cierra el modal si se hace clic fuera del selector.
  document.getElementById('emoji-picker-modal').addEventListener('click', event => {
    if (event.target.id === 'emoji-picker-modal') closeEmojiPicker();
  });
  // Cierra el selector con Escape cuando esta abierto.
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !document.getElementById('emoji-picker-modal').classList.contains('hidden')) {
      closeEmojiPicker();
    }
  });
  updateGameWordRows();
  refreshMapPositionOptions().catch(error => {
    document.getElementById('teacher-dashboard-message').innerText = error.message;
  });
  // Muestra el selector adecuado segun el alcance del reinicio de progreso.
  document.getElementById('progress-reset-scope').addEventListener('change', event => {
    document.getElementById('progress-reset-lesson-wrap').classList.toggle('hidden', event.target.value !== 'lesson');
    document.getElementById('progress-reset-section-wrap').classList.toggle('hidden', event.target.value !== 'section');
  });
}
