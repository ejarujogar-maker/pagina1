/* ==========================================================================
  1. PLAN DE ESTUDIOS DE LETRAS, SÍLABAS Y LECTURAS
   ========================================================================== */
const arcadeContent = window.LecturaClubArcadeContent;
if (!arcadeContent) throw new Error('No se pudo cargar el contenido del Arcade.');

const ALL_LESSONS = [
  // Bloque 1: Vocales y primeras letras
  { id: 'l1', name: 'Vocal A', target: 'A', category: 'Vocales', mouth: 'Abre grande la boca diciendo: ¡AAA!', examples: [{w:'Avión', emoji:'✈️'}, {w:'Abeja', emoji:'🐝'}, {w:'Árbol', emoji:'🌳'}] },
  { id: 'l2', name: 'Vocal E', target: 'E', category: 'Vocales', mouth: 'Sonríe mostrando los dientes diciendo: ¡EEE!', examples: [{w:'Elefante', emoji:'🐘'}, {w:'Estrella', emoji:'⭐'}, {w:'Erizo', emoji:'🦔'}] },
  { id: 'l3', name: 'Vocal I', target: 'I', category: 'Vocales', mouth: 'Sonrisa finita diciendo: ¡III!', examples: [{w:'Iguana', emoji:'🦎'}, {w:'Isla', emoji:'🏝️'}, {w:'Iglú', emoji:'🛖'}] },
  { id: 'l4', name: 'Vocal O', target: 'O', category: 'Vocales', mouth: 'Labios redonditos diciendo: ¡OOO!', examples: [{w:'Oso', emoji:'🐻'}, {w:'Ojo', emoji:'👁️'}, {w:'Oveja', emoji:'🐑'}] },
  { id: 'l5', name: 'Vocal U', target: 'U', category: 'Vocales', mouth: 'Redondea los labios diciendo: ¡UUU!', examples: [{w:'Uva', emoji:'🍇'}, {w:'unicornio', emoji:'🦄'}, {w:'Uno', emoji:'1️⃣'}] },
  { id: 'm1', isMilestone: true, title: 'Primer desafío', gameType: 'bubbles', target: 'A' },

  // Bloque 2: Consonantes B, C, D, F, G
  { id: 'l6', name: 'Letra B', target: 'B', category: 'Abecedario', mouth: 'Junta tus labios suavemente: ¡BBB!', examples: [{w:'Barco', emoji:'⛵'}, {w:'Bota', emoji:'🥾'}, {w:'Búho', emoji:'🦉'}] },
  { id: 'l7', name: 'Letra C', target: 'C', category: 'Abecedario', mouth: 'Sonido firme: ¡CCC!', examples: [{w:'Casa', emoji:'🏠'}, {w:'Conejo', emoji:'🐰'}, {w:'Cama', emoji:'🛏️'}] },
  { id: 'l8', name: 'Letra D', target: 'D', category: 'Abecedario', mouth: 'Lengua en los dientes: ¡DDD!', examples: [{w:'Dado', emoji:'🎲'}, {w:'Dedo', emoji:'🖐️'}, {w:'Dinosaurio', emoji:'🦕'}] },
  { id: 'l9', name: 'Letra F', target: 'F', category: 'Abecedario', mouth: 'Dientes en el labio inferior soplando: ¡FFF!', examples: [{w:'Foca', emoji:'🦭'}, {w:'Fuego', emoji:'🔥'}, {w:'Flor', emoji:'🌸'}] },
  { id: 'l10', name: 'Letra G', target: 'G', category: 'Abecedario', mouth: 'Garganta suave: ¡GGG!', examples: [{w:'Gato', emoji:'🐱'}, {w:'Gota', emoji:'💧'}, {w:'Girasol', emoji:'🌻'}] },
  { id: 'm2', isMilestone: true, title: 'Segundo desafío', gameType: 'snake', target: 'B' },

  // Bloque 3: Consonantes H, J, K, L, M
  { id: 'l11', name: 'Letra H', target: 'H', category: 'Abecedario', mouth: 'La H no tiene sonido propio; acompaña a la vocal en palabras como hola y helado.', examples: [{w:'Helado', emoji:'🍦'}, {w:'Hojas', emoji:'🍁'}, {w:'Hueso', emoji:'🦴'}] },
  { id: 'l12', name: 'Letra J', target: 'J', category: 'Abecedario', mouth: 'Sonido fuerte desde la garganta: ¡JJJ!', examples: [{w:'Jirafa', emoji:'🦒'}, {w:'Juguete', emoji:'🧸'}, {w:'Jarra', emoji:'🏺'}] },
  { id: 'l13', name: 'Letra K', target: 'K', category: 'Abecedario', mouth: 'Sonido seco y firme: ¡KKK!', examples: [{w:'Koala', emoji:'🐨'}, {w:'Kilo', emoji:'⚖️'}, {w:'Kiwis', emoji:'🥝'}] },
  { id: 'l14', name: 'Letra L', target: 'L', category: 'Abecedario', mouth: 'Lengua tocando el paladar: ¡LLL!', examples: [{w:'Luna', emoji:'🌙'}, {w:'León', emoji:'🦁'}, {w:'Lápiz', emoji:'✏️'}] },
  { id: 'l15', name: 'Letra M', target: 'M', category: 'Abecedario', mouth: 'Labios juntos vibrando: ¡MMM!', examples: [{w:'Mamá', emoji:'👩'}, {w:'Mesa', emoji:'🪑'}, {w:'Mano', emoji:'✋'}] },
  { id: 'm3', isMilestone: true, title: 'Tercer desafío', gameType: 'ninja', target: 'M' },

  // Bloque 4: Consonantes N, Ñ, P, Q, R
  { id: 'l16', name: 'Letra N', target: 'N', category: 'Abecedario', mouth: 'Sonido nasal con lengua arriba: ¡NNN!', examples: [{w:'Nube', emoji:'☁️'}, {w:'Nido', emoji:'🪹'}, {w:'Naranja', emoji:'🍊'}] },
  { id: 'l17', name: 'Letra Ñ', target: 'Ñ', category: 'Abecedario', mouth: 'Sonido nasal especial arrugando la nariz: ¡ÑÑÑ!', examples: [{w:'Ñandú', emoji:'🦩'}, {w:'Ñame', emoji:'🍠'}, {w:'Moño', emoji:'🎀'}] },
  { id: 'l18', name: 'Letra P', target: 'P', category: 'Abecedario', mouth: 'Explosión suave con los labios: ¡PPP!', examples: [{w:'Papá', emoji:'👨'}, {w:'Perro', emoji:'🐕'}, {w:'Pelota', emoji:'⚽'}] },
  { id: 'l19', name: 'Letra Q', target: 'Q', category: 'Abecedario', mouth: 'Sonido fuerte acompañado de u: ¡QQQ!', examples: [{w:'Queso', emoji:'🧀'}, {w:'Quince', emoji:'🔢'}, {w:'Kiosco', emoji:'🏬'}] },
  { id: 'l20', name: 'Letra R', target: 'R', category: 'Abecedario', mouth: 'Vibración suave de la lengua: ¡RRR!', examples: [{w:'Rana', emoji:'🐸'}, {w:'Rosa', emoji:'🌹'}, {w:'Radio', emoji:'📻'}] },
  { id: 'm4', isMilestone: true, title: 'Cuarto desafío', gameType: 'rain', target: 'P' },

  // Bloque 5: Consonantes S, T, V, W, X
  { id: 'l21', name: 'Letra S', target: 'S', category: 'Abecedario', mouth: 'Sopla suave como serpiente: ¡SSS!', examples: [{w:'Sol', emoji:'☀️'}, {w:'Sopa', emoji:'🥣'}, {w:'Silla', emoji:'🪑'}] },
  { id: 'l22', name: 'Letra T', target: 'T', category: 'Abecedario', mouth: 'Lengua golpeando los dientes: ¡TTT!', examples: [{w:'Tomate', emoji:'🍅'}, {w:'Tigre', emoji:'🐯'}, {w:'Taza', emoji:'☕'}] },
  { id: 'l23', name: 'Letra V', target: 'V', category: 'Abecedario', mouth: 'Dientes en labio inferior: ¡VVV!', examples: [{w:'Vaca', emoji:'🐮'}, {w:'Vela', emoji:'🕯️'}, {w:'Vaso', emoji:'🥛'}] },
  { id: 'l24', name: 'Letra W', target: 'W', category: 'Abecedario', mouth: 'La W aparece sobre todo en palabras de otros idiomas; su pronunciación puede variar.', examples: [{w:'Web', emoji:'🌐'}, {w:'Wifi', emoji:'📶'}, {w:'Kiwi', emoji:'🥝'}] },
  { id: 'l25', name: 'Letra X', target: 'X', category: 'Abecedario', mouth: 'Sonido cruzado: ¡XXX!', examples: [{w:'Xilófono', emoji:'🎼'}, {w:'Rayo', emoji:'⚡'}, {w:'Taxi', emoji:'🚕'}] },
  { id: 'm5', isMilestone: true, title: 'Quinto desafío', gameType: 'stacker', target: 'S' },

  // Bloque 6: Letras Y y Z
  { id: 'l26', name: 'Letra Y', target: 'Y', category: 'Abecedario', mouth: 'Sonido consonántico palatal: ¡YYY!', examples: [{w:'Yoyo', emoji:'🪀'}, {w:'Yate', emoji:'⛵'}, {w:'Yegua', emoji:'🐴'}] },
  { id: 'l27', name: 'Letra Z', target: 'Z', category: 'Abecedario', mouth: 'Soplar suavemente entre los dientes: ¡ZZZ!', examples: [{w:'Zorro', emoji:'🦊'}, {w:'Zapato', emoji:'👞'}, {w:'Zanahoria', emoji:'🥕'}] },
  { id: 'm6', isMilestone: true, title: 'Sexto desafío', gameType: 'train', target: 'SOL' }
];

const WORD_IMAGES = {
  mamá: '👩', mimo: '🤗', momia: '🧟', miau: '🐱', papá: '👨', pipa: '🪈', mapa: '🗺️', puma: '🐆',
  loma: '⛰️', pala: '🪏', lima: '🍋', lupa: '🔎', suma: '➕', sopa: '🥣', sapo: '🐸', mesa: '🪑',
  tomate: '🍅', tapa: '🥘', pato: '🦆', moto: '🏍️', nena: '👧', luna: '🌙', mano: '✋', pino: '🌲',
  dado: '🎲', dedo: '☝️', duda: '🤔', nido: '🪺', casa: '🏠', cama: '🛏️', coco: '🥥', cuna: '🛌',
  queso: '🧀', quiosco: '🏬', paquete: '📦', bola: '⚽', bebé: '👶', bota: '🥾', nube: '☁️', vaca: '🐮',
  vela: '🕯️', uva: '🍇', pavo: '🦃', carro: '🚗', perro: '🐕', torre: '🗼', burro: '🫏', radio: '📻',
  reloj: '⏰', rosa: '🌹', rana: '🐸', faro: '🗼', foca: '🦭', familia: '👨‍👩‍👧', foto: '📷', jarra: '🏺',
  jirafa: '🦒', jugo: '🧃', girasol: '🌻', gato: '🐈', goma: '🧽', guerra: '🛡️', gusano: '🪱', niña: '👧',
  muñeca: '🪆', piña: '🍍', moño: '🎀', chino: '👦', coche: '🚙', leche: '🥛', chivo: '🐐', llave: '🔑', calle: '🛣️',
  lluvia: '🌧️', anillo: '💍', yate: '⛵', yegua: '🐴', yoyo: '🪀', yuca: '🍠', tiza: '🖍️', taza: '☕',
  cine: '🎬', zapato: '👞', hacha: '🪓', helado: '🍦', hilo: '🧵', humo: '💨', kilo: '⚖️', kiwi: '🥝',
  blusa: '👚', tabla: '🪵', plaza: '🏛️', pluma: '🪶', flecha: '🏹', flor: '🌸', clase: '🏫', clavo: '🔩', kiosco: '🏬',
  globo: '🎈', regla: '📏', primo: '🧑', premio: '🏆', brazo: '💪', brisa: '🍃', crema: '🧴', libro: '📘',
  fresa: '🍓', fruta: '🍎', trigo: '🌾', trucha: '🐟', madre: '👩', ladrillo: '🧱', grillo: '🦗', tigre: '🐅',
  alto: '📏', olfato: '👃', último: '🏁', altar: '🕯️', anda: '🚶', entrada: '🚪', infantil: '🧒', ángel: '👼',
  asma: '🫁', isla: '🏝️', ostra: '🦪', espuma: '🫧', examen: '📝', éxito: '🌟', taxi: '🚕', xilófono: '🎼',
  árbol: '🌳', arco: '🏹', orden: '📚', imprenta: '🖨️', hielo: '🧊', cuota: '🧾', hay: '🌱', buey: '🐂',
  estoy: '🙂', yaracuy: '🏞️', hogar: '🏡', patio: '🪴', cocina: '🍳', pueblo: '🏘️', parque: '🌳',
  oveja: '🐑', caballo: '🐎', flores: '💐', agua: '💧', escuela: '🏫', maestra: '👩‍🏫', amigos: '🧑‍🤝‍🧑',
  abeja: '🐝', mariposa: '🦋', zancudo: '🦟', alimentos: '🍽️', frutas: '🍎', juegos: '🎲', pelota: '⚽',
  viento: '💨', hojas: '🍂', vacaciones: '🏖️', montaña: '⛰️', playa: '🏖️'
};

function getWordImage(word, fallback = '📖') {
  return WORD_IMAGES[word.toLocaleLowerCase('es')] || fallback;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function emojiImageUrl(emoji) {
  const codepoints = Array.from(emoji)
    .map(character => character.codePointAt(0).toString(16))
    .filter(codepoint => codepoint !== 'fe0f')
    .join('-');
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codepoints}.svg`;
}

function makeSyllableLesson(id, name, syllables, words, emoji = '📖') {
  const normalizedSyllables = syllables.map(syllable => syllable.toLocaleUpperCase('es'));
  return {
    id,
    name,
    target: normalizedSyllables[0],
    category: 'Sílabas',
    mouth: 'Lee cada sílaba en voz alta y después practica las palabras.',
    syllables: normalizedSyllables,
    options: [normalizedSyllables[0], normalizedSyllables[Math.floor(normalizedSyllables.length / 2)], normalizedSyllables.at(-1)],
    examples: words.map(word => ({ w: word, emoji: getWordImage(word, emoji) }))
  };
}

function makeReadingLesson(id, name, words, readingText, emoji = '📚') {
  const target = words[0].toLocaleUpperCase('es');
  return {
    id,
    name,
    target,
    category: 'Lecturas',
    mouth: 'Escucha la lectura y luego léela con calma.',
    readingText,
    options: [target, words[1].toLocaleUpperCase('es'), words[2].toLocaleUpperCase('es')],
    examples: words.map(word => ({ w: word, emoji: getWordImage(word, emoji) }))
  };
}

const BOOK_LESSONS = [
  makeSyllableLesson('b1', 'Sílabas con M', ['ma', 'me', 'mi', 'mo', 'mu'], ['mamá', 'mimo', 'momia', 'miau'], '👩'),
  makeSyllableLesson('b2', 'Sílabas con P', ['pa', 'pe', 'pi', 'po', 'pu'], ['papá', 'pipa', 'mapa', 'puma'], '🫧'),
  makeSyllableLesson('b3', 'Sílabas con L', ['la', 'le', 'li', 'lo', 'lu'], ['loma', 'pala', 'lima', 'lupa'], '🌙'),
  makeSyllableLesson('b4', 'Sílabas con S', ['sa', 'se', 'si', 'so', 'su'], ['suma', 'sopa', 'sapo', 'mesa'], '🐍'),
  makeSyllableLesson('b5', 'Sílabas con T', ['ta', 'te', 'ti', 'to', 'tu'], ['tomate', 'tapa', 'pato', 'moto'], '🍅'),
  makeSyllableLesson('b6', 'Sílabas con N', ['na', 'ne', 'ni', 'no', 'nu'], ['nena', 'luna', 'mano', 'pino'], '🌙'),
  makeSyllableLesson('b7', 'Sílabas con D', ['da', 'de', 'di', 'do', 'du'], ['dado', 'dedo', 'duda', 'nido'], '🎲'),
  makeSyllableLesson('b8', 'Sílabas con C', ['ca', 'co', 'cu'], ['casa', 'cama', 'coco', 'cuna'], '🏠'),
  makeSyllableLesson('b9', 'Sílabas con C y Q', ['ca', 'que', 'qui', 'co', 'cu'], ['casa', 'queso', 'quiosco', 'paquete'], '🧀'),
  makeSyllableLesson('b10', 'Sílabas con B', ['ba', 'be', 'bi', 'bo', 'bu'], ['bola', 'bebé', 'bota', 'nube'], '⚽'),
  makeSyllableLesson('b11', 'Sílabas con V', ['va', 've', 'vi', 'vo', 'vu'], ['vaca', 'vela', 'uva', 'pavo'], '🐄'),
  makeSyllableLesson('b12', 'Sonido fuerte de la R', ['rra', 'rre', 'rri', 'rro', 'rru'], ['carro', 'perro', 'torre', 'burro'], '🐕'),
  makeSyllableLesson('b13', 'Sonido suave de la R', ['ra', 're', 'ri', 'ro', 'ru'], ['radio', 'reloj', 'rosa', 'rana'], '🌹'),
  makeSyllableLesson('b14', 'Sílabas con F', ['fa', 'fe', 'fi', 'fo', 'fu'], ['faro', 'foca', 'familia', 'foto'], '🦭'),
  makeSyllableLesson('b15', 'Sílabas con J y G suave', ['ja', 'je', 'ji', 'jo', 'ju', 'ge', 'gi'], ['jarra', 'jirafa', 'jugo', 'girasol'], '🦒'),
  makeSyllableLesson('b16', 'Sílabas con G', ['ga', 'gue', 'gui', 'go', 'gu'], ['gato', 'goma', 'guerra', 'gusano'], '🐱'),
  makeSyllableLesson('b17', 'Sílabas con Ñ', ['ña', 'ñe', 'ñi', 'ño', 'ñu'], ['niña', 'muñeca', 'piña', 'moño'], '🍍'),
  makeSyllableLesson('b18', 'Sílabas con CH', ['cha', 'che', 'chi', 'cho', 'chu'], ['chino', 'coche', 'leche', 'chivo'], '🚗'),
  makeSyllableLesson('b19', 'Sílabas con LL', ['lla', 'lle', 'lli', 'llo', 'llu'], ['llave', 'calle', 'lluvia', 'anillo'], '🔑'),
  makeSyllableLesson('b20', 'Sílabas con Y', ['ya', 'ye', 'yi', 'yo', 'yu'], ['yate', 'yegua', 'yoyo', 'yuca'], '🪀'),
  makeSyllableLesson('b21', 'Sílabas con Z y C', ['za', 'ce', 'ci', 'zo', 'zu'], ['tiza', 'taza', 'cine', 'zapato'], '👞'),
  makeSyllableLesson('b22', 'Palabras con H', ['ha', 'he', 'hi', 'ho', 'hu'], ['hacha', 'helado', 'hilo', 'humo'], '🍦'),
  makeSyllableLesson('b23', 'Sílabas con K', ['ka', 'ke', 'ki', 'ko', 'ku'], ['kilo', 'kiwi', 'kiosco'], '🥝'),
  makeSyllableLesson('b24', 'Grupos BL y PL', ['bla', 'ble', 'bli', 'blo', 'blu', 'pla', 'ple', 'pli', 'plo', 'plu'], ['blusa', 'tabla', 'plaza', 'pluma'], '🪶'),
  makeSyllableLesson('b25', 'Grupos FL y CL', ['fla', 'fle', 'fli', 'flo', 'flu', 'cla', 'cle', 'cli', 'clo', 'clu'], ['flecha', 'flor', 'clase', 'clavo'], '🌸'),
  makeSyllableLesson('b26', 'Grupos GL y PR', ['gla', 'gle', 'gli', 'glo', 'glu', 'pra', 'pre', 'pri', 'pro', 'pru'], ['globo', 'regla', 'primo', 'premio'], '🎈'),
  makeSyllableLesson('b27', 'Grupos BR y CR', ['bra', 'bre', 'bri', 'bro', 'bru', 'cra', 'cre', 'cri', 'cro', 'cru'], ['brazo', 'brisa', 'crema', 'libro'], '📘'),
  makeSyllableLesson('b28', 'Grupos FR y TR', ['fra', 'fre', 'fri', 'fro', 'fru', 'tra', 'tre', 'tri', 'tro', 'tru'], ['fresa', 'fruta', 'trigo', 'trucha'], '🍓'),
  makeSyllableLesson('b29', 'Grupos DR y GR', ['dra', 'dre', 'dri', 'dro', 'dru', 'gra', 'gre', 'gri', 'gro', 'gru'], ['madre', 'ladrillo', 'grillo', 'tigre'], '🦗'),
  makeSyllableLesson('b30', 'Sílabas inversas con L', ['al', 'el', 'il', 'ol', 'ul'], ['alto', 'olfato', 'último', 'altar'], '⛰️'),
  makeSyllableLesson('b31', 'Sílabas inversas con N', ['an', 'en', 'in', 'on', 'un'], ['anda', 'entrada', 'infantil', 'ángel'], '🚪'),
  makeSyllableLesson('b32', 'Sílabas inversas con S', ['as', 'es', 'is', 'os', 'us'], ['asma', 'isla', 'ostra', 'espuma'], '🏝️'),
  makeSyllableLesson('b33', 'Sílabas con X', ['xa', 'xe', 'xi', 'xo', 'xu'], ['examen', 'éxito', 'taxi', 'xilófono'], '🎼'),
  makeSyllableLesson('b34', 'Sílabas inversas con R y M', ['ar', 'er', 'ir', 'or', 'ur', 'am', 'em', 'im', 'om', 'um'], ['árbol', 'arco', 'orden', 'imprenta'], '🌳'),
  makeSyllableLesson('b35', 'Diptongos', ['ia', 'ie', 'io', 'iu', 'ua', 'ue', 'ui', 'uo'], ['familia', 'hielo', 'lluvia', 'cuota'], '💧'),
  makeSyllableLesson('b36', 'Sílabas con Y al final', ['ay', 'ey', 'oy', 'uy'], ['hay', 'buey', 'estoy', 'Yaracuy'], '🐂'),
  makeReadingLesson('b37', 'Lectura: Mi familia', ['familia', 'mamá', 'hogar'], 'En mi familia nos ayudamos. En casa compartimos, aprendemos y cuidamos unos de otros.', '🏡'),
  makeReadingLesson('b38', 'Lectura: La casa', ['casa', 'patio', 'cocina'], 'Una casa tiene espacios para descansar y jugar. Cada día podemos ayudar a mantenerla ordenada.', '🏠'),
  makeReadingLesson('b39', 'Lectura: Mi pueblo', ['pueblo', 'plaza', 'parque'], 'En mi pueblo hay una plaza, una escuela y muchas calles. Me gusta recorrerlo con mi familia.', '🏘️'),
  makeReadingLesson('b40', 'Lectura: Los animales', ['vaca', 'oveja', 'caballo'], 'La vaca come hierba y la oveja nos da lana. El caballo corre por el campo.', '🐄'),
  makeReadingLesson('b41', 'Lectura: La naturaleza', ['árbol', 'flores', 'agua'], 'Un árbol crece con agua y sol. En el jardín, las flores atraen mariposas.', '🌱'),
  makeReadingLesson('b42', 'Lectura: La escuela', ['escuela', 'maestra', 'amigos'], 'En la escuela aprendemos a leer y escribir. También compartimos juegos con nuestros compañeros.', '🏫'),
  makeReadingLesson('b43', 'Lectura: Los insectos', ['abeja', 'mariposa', 'zancudo'], 'La abeja visita las flores. Las mariposas vuelan entre las plantas del jardín.', '🦋'),
  makeReadingLesson('b44', 'Lectura: Los alimentos', ['alimentos', 'frutas', 'leche'], 'Las frutas, el pan y la leche nos ayudan a crecer. Antes de comer, nos lavamos las manos.', '🍎'),
  makeReadingLesson('b45', 'Lectura: Los juegos', ['juegos', 'pelota', 'amigos'], 'Jugar al aire libre es divertido. Respetamos los turnos y cuidamos a nuestros amigos.', '⚽'),
  makeReadingLesson('b46', 'Lectura: Adivinanzas', ['viento', 'hojas', 'libro'], 'Tengo hojas y no soy árbol. Tengo páginas y muchas historias. ¿Qué soy?', '❓'),
  makeReadingLesson('b47', 'Lectura: Las vacaciones', ['vacaciones', 'montaña', 'playa'], 'En vacaciones descanso, visito lugares nuevos y practico mis juegos favoritos.', '🏖️')
];

ALL_LESSONS.push(...BOOK_LESSONS);

/* ==========================================================================
   2. ESTADO GLOBAL Y AUTENTICACIÓN
   ========================================================================== */
const STORAGE_KEY = 'lecturaclub_state_v6';

function readStoredValue(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

const persistedState = readStoredValue(STORAGE_KEY, {});
const savedState = persistedState && typeof persistedState === 'object' && !Array.isArray(persistedState) ? persistedState : {};
const savedXp = Number.isFinite(savedState.xp) ? savedState.xp : readStoredValue('lc_xp', 0);
const savedLessons = Array.isArray(savedState.completedLessons)
  ? savedState.completedLessons
  : readStoredValue('lc_lessons', []);

let appState = {
  xp: Number.isFinite(savedXp) && savedXp >= 0 ? savedXp : 0,
  completedLessons: Array.isArray(savedLessons) ? savedLessons.filter(id => typeof id === 'string') : [],
  completedArcadeLevels: Array.isArray(savedState.completedArcadeLevels)
    ? savedState.completedArcadeLevels.filter(id => typeof id === 'string')
    : [],
  lessonResults: Array.isArray(savedState.lessonResults) ? savedState.lessonResults : [],
  customLessons: [],
  customGames: [],
  voiceEnabled: typeof savedState.voiceEnabled === 'boolean' ? savedState.voiceEnabled : true,
  currentUser: null,
  currentModalLesson: null,
  currentMistakes: 0,
  modalStep: 1,
  modalStepComplete: [false, false, false],
  modalStepItems: new Set()
};

let activeGameLoop = null;
let arcadeTransitionTimer = null;
let activeGameIntervals = [];
let studentPreviewActive = false;
let studentPreviewReturnState = null;
window.isStudentPreviewActive = () => studentPreviewActive;

function clearActiveGameIntervals() {
  activeGameIntervals.forEach(interval => clearInterval(interval));
  activeGameIntervals = [];
}

function loadState() {
  updateAuthUI();
  updateStatsUI();
}

function saveState() {
  if (studentPreviewActive) {
    updateStatsUI();
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    localStorage.setItem('lc_xp', appState.xp.toString());
    localStorage.setItem('lc_lessons', JSON.stringify(appState.completedLessons));
  } catch (error) {
    console.error('No se pudo guardar el progreso local:', error);
  }
  if (appState.currentUser) syncProgress();
  updateStatsUI();
}

function applyServerProgress(progress) {
  appState.xp = progress.xp;
  appState.completedLessons = progress.completedLessons;
  appState.completedArcadeLevels = progress.completedArcadeLevels;
  appState.lessonResults = progress.lessonResults || [];
  saveState();
  renderContinuousMap();
}

function lessonReportCategory(lesson) {
  if (lesson.reportCategory) return lesson.reportCategory;
  if (/^m\d+$/.test(lesson.id)) return lesson.id === 'm1' ? 'Vocales' : 'Consonantes';
  if (/^l[1-5]$/.test(lesson.id)) return 'Vocales';
  if (/^l\d+$/.test(lesson.id)) return 'Consonantes';
  if (/^b(?:[1-9]|[12]\d|3[0-6])$/.test(lesson.id)) return 'Sílabas';
  if (/^b(?:3[7-9]|4[0-7])$/.test(lesson.id)) return 'Palabras';
  if (lesson.category === 'Vocales' || lesson.category === 'Consonantes' ||
      lesson.category === 'Sílabas' || lesson.category === 'Palabras') return lesson.category;
  return null;
}

async function recordCompletion(type, details) {
  if (!appState.currentUser || studentPreviewActive) {
    if (type === 'lesson' && !appState.completedLessons.includes(details.id)) {
      appState.completedLessons.push(details.id);
      appState.xp += details.id.startsWith('m') ? 150 : 100;
    }
    if (type === 'lesson') {
      const lesson = appState.currentModalLesson;
      const category = lesson && lessonReportCategory(lesson);
      if (['Vocales', 'Consonantes', 'Sílabas', 'Palabras'].includes(category)) {
        const previous = appState.lessonResults.find(result => result.lessonId === details.id);
        const stars = Math.max(0, 3 - Math.min(3, details.mistakes || 0));
        if (previous) {
          previous.attempts++;
          previous.mistakes += details.mistakes || 0;
          previous.bestStars = Math.max(previous.bestStars, stars);
          previous.latestStars = stars;
          previous.retryStars = (previous.retryStars || 0) + stars;
          previous.points += stars * 10;
        } else {
          appState.lessonResults.push({
            lessonId: details.id, category, attempts: 1, mistakes: details.mistakes || 0,
            bestStars: stars, latestStars: stars, firstStars: stars, retryStars: 0, points: stars * 10
          });
        }
      }
    } else if (type === 'arcade' && !appState.completedArcadeLevels.includes(`${details.gameId}-${details.level}`)) {
      appState.completedArcadeLevels.push(`${details.gameId}-${details.level}`);
      appState.xp += 25;
    }
    saveState();
    return;
  }
  const response = await fetch('/api/progress/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, ...details })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'No se pudo guardar el progreso.');
  applyServerProgress(result.progress);
}

function completeArcadeLevel(stage, gameId, level, message) {
  const completionId = `${gameId}-${level}`;
  if (stage.dataset.levelComplete === completionId) return;
  stage.dataset.levelComplete = completionId;

  recordCompletion('arcade', { gameId, level }).then(() => {
    playSound('success');
    const nextMessage = level < 3 ? 'Siguiente nivel...' : '¡Arcade completado!';
    stage.insertAdjacentHTML('beforeend', `<p class="arcade-completion-message text-center text-emerald-300 font-black mt-4">${message} ${nextMessage}</p>`);
    arcadeTransitionTimer = setTimeout(() => {
      arcadeTransitionTimer = null;
      if (!stage.isConnected || stage.classList.contains('hidden') || document.getElementById('view-minigames').classList.contains('hidden')) return;
      if (level < 3) launchLevel(gameId, level + 1);
      else renderArcadeHub();
    }, 1800);
  }).catch(error => {
    stage.dataset.levelComplete = '';
    console.error('No se pudo guardar la finalización del minijuego:', error);
    owlSpeak(error.message);
  });
}

function updateStatsUI() {
  document.getElementById('header-xp').innerText = `${appState.xp} XP`;
  document.getElementById('mobile-xp').innerText = `${appState.xp} XP`;

  const regularLessons = ALL_LESSONS.filter(l => !l.isMilestone);
  const total = regularLessons.length;
  const lessonIds = new Set(regularLessons.map(lesson => lesson.id));
  const done = new Set(appState.completedLessons.filter(id => lessonIds.has(id))).size;
  const pct = Math.min(100, Math.round((done / total) * 100));

  document.getElementById('header-progress-bar').style.width = pct + '%';
  document.getElementById('header-progress-text').innerText = hasFullAccess() ? `${pct}%` : 'Tu ruta';
  document.getElementById('mobile-progress-text').innerText = hasFullAccess() ? `${pct}%` : '🦉';
  document.getElementById('header-progress-text').classList.toggle('hidden', !hasFullAccess());
}

function updateAuthUI() {
  const userDisplay = document.getElementById('user-name-display');
  const logoutBtn = document.getElementById('logout-btn');
  const iconState = document.getElementById('user-icon-state');
  const accountButton = document.getElementById('user-auth-btn');
  document.getElementById('admin-users-btn').classList.toggle('hidden', appState.currentUser?.role !== 'superadmin');
  document.getElementById('teacher-dashboard-btn').classList.toggle('hidden', !hasFullAccess());
  document.getElementById('student-preview-banner').classList.toggle('hidden', !studentPreviewActive);
  accountButton.disabled = Boolean(appState.currentUser) || !authenticationInitialized || studentPreviewActive;
  accountButton.setAttribute('aria-label', appState.currentUser ? 'Sesión iniciada' : 'Abrir cuenta');

  if (appState.currentUser) {
    userDisplay.innerText = appState.currentUser.name;
    document.querySelector('#user-auth-btn .text-left span:last-child').innerText = roleLabel(appState.currentUser.role);
    document.getElementById('progress-sync-status').innerText = 'Progreso guardado en la cuenta';
    logoutBtn.classList.toggle('hidden', studentPreviewActive);
    iconState.className = "fa-solid fa-user-check text-emerald-950";
  } else {
    userDisplay.innerText = "Iniciar Sesión";
    document.querySelector('#user-auth-btn .text-left span:last-child').innerText = 'Cuenta protegida';
    document.getElementById('progress-sync-status').innerText = 'Inicia sesión para guardar el progreso';
    logoutBtn.classList.add('hidden');
    iconState.className = "fa-solid fa-user";
  }
}

function roleLabel(role) {
  return ({ superadmin: 'Super administrador', profesor: 'Profesor', alumno: 'Alumno' })[role] || 'Usuario';
}

let progressSyncTimer = null;
function syncProgress() {
  if (studentPreviewActive) return;
  clearTimeout(progressSyncTimer);
  progressSyncTimer = setTimeout(async () => {
    const status = document.getElementById('progress-sync-status');
    try {
      const response = await fetch('/api/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp: appState.xp })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      status.innerText = 'Progreso guardado en la cuenta';
      status.classList.remove('text-rose-600');
      status.classList.add('text-purple-600');
    } catch (error) {
      console.error('No se pudo sincronizar el progreso:', error);
      status.innerText = 'No se pudo guardar en el servidor';
      status.classList.add('text-rose-600');
    }
  }, 250);
}

/* ==========================================================================
   3. MODAL DE AUTENTICACIÓN / LOGIN
   ========================================================================== */
let authenticationInitialized = false;

function openAuthModal() {
  if (!authenticationInitialized || appState.currentUser) return;
  playSound('pop');
  setAuthMode('login');
  document.getElementById('auth-modal').classList.remove('hidden');
}

function closeAuthModal() {
  playSound('pop');
  document.getElementById('auth-modal').classList.add('hidden');
}

let authMode = 'login';
function setAuthMode(mode) {
  authMode = mode;
  document.getElementById('auth-modal').scrollTop = 0;
  document.querySelector('#auth-modal > div').scrollTop = 0;
  const register = mode === 'register';
  const forgot = mode === 'forgot';
  const resend = mode === 'resend-verification';
  const verify = mode === 'verify-email';
  document.getElementById('auth-modal-title').innerText = register ? 'Crear cuenta' : forgot ? 'Recuperar contraseña' : resend || verify ? 'Confirmar correo' : 'Iniciar sesión';
  document.getElementById('auth-submit').innerText = register ? 'Crear cuenta' : forgot ? 'Enviar enlace de recuperación' : resend ? 'Reenviar código' : verify ? 'Verificar código' : 'Iniciar sesión';
  document.getElementById('auth-name-field').classList.toggle('hidden', !register);
  document.getElementById('auth-username-field').classList.toggle('hidden', !register);
  document.getElementById('auth-role-field').classList.toggle('hidden', !register);
  document.getElementById('auth-confirm-field').classList.toggle('hidden', !register);
  document.getElementById('auth-code-field').classList.toggle('hidden', !verify);
  document.getElementById('auth-password-field').classList.toggle('hidden', forgot || resend || verify);
  document.getElementById('auth-support-links').classList.toggle('hidden', register || forgot || resend || verify);
  document.getElementById('auth-back-link').classList.toggle('hidden', !register && !forgot && !resend && !verify);
  document.getElementById('auth-identifier-label').innerText = register || forgot || resend || verify ? 'Correo electrónico' : 'Correo o nombre de usuario';
  document.getElementById('auth-identifier').autocomplete = register || forgot || resend || verify ? 'email' : 'username';
  document.getElementById('auth-identifier').readOnly = verify;
  document.getElementById('auth-name').required = register;
  document.getElementById('auth-name').setCustomValidity('');
  document.getElementById('auth-username').required = register;
  document.getElementById('auth-confirm-password').required = register;
  document.getElementById('auth-password').required = !forgot && !resend && !verify;
  document.getElementById('auth-password').setCustomValidity('');
  document.getElementById('auth-password').autocomplete = register ? 'new-password' : 'current-password';
  document.getElementById('auth-password').type = 'password';
  document.querySelector('#password-eye i').className = 'fa-solid fa-eye';
  document.getElementById('auth-confirm-password').type = 'password';
  document.querySelector('#confirm-password-eye i').className = 'fa-solid fa-eye';
  document.getElementById('auth-identifier').type = register || forgot || resend || verify ? 'email' : 'text';
  document.getElementById('auth-identifier').placeholder = register || forgot || resend || verify ? 'nombre@ejemplo.com' : 'Correo electrónico o usuario';
  document.getElementById('auth-message').innerText = '';
  document.getElementById('auth-password').value = '';
  document.getElementById('auth-confirm-password').value = '';
  document.getElementById('auth-code').value = '';
  document.getElementById('auth-code').required = verify;
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const mode = authMode;
  const form = event.currentTarget;
  const message = document.getElementById('auth-message');
  const submit = document.getElementById('auth-submit');
  validateAuthFields();
  if (!form.reportValidity()) return;
  const identifier = document.getElementById('auth-identifier').value.trim();
  const password = document.getElementById('auth-password').value;
  const payload = { identifier, password };
  let endpoint = '/api/auth/login';
  if (mode === 'verify-email') {
    endpoint = '/api/auth/verify-email';
    payload.email = identifier;
    payload.code = document.getElementById('auth-code').value.trim();
    delete payload.identifier;
    delete payload.password;
  } else if (mode === 'register') {
    endpoint = '/api/auth/register';
    if (password !== document.getElementById('auth-confirm-password').value) {
      message.innerText = 'Las contraseñas no coinciden.';
      return;
    }
    Object.assign(payload, {
      name: document.getElementById('auth-name').value.trim(),
      email: identifier,
      username: document.getElementById('auth-username').value.trim(),
      role: document.getElementById('auth-role').value
    });
  } else if (mode === 'forgot') {
    endpoint = '/api/auth/forgot-password';
    delete payload.password;
  } else if (mode === 'resend-verification') {
    endpoint = '/api/auth/resend-verification';
    payload.email = identifier;
    delete payload.identifier;
    delete payload.password;
  }
  submit.disabled = true;
  message.innerText = 'Procesando...';
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (response.status === 403 && result.requiresEmailVerification) {
      setAuthMode('verify-email');
      document.getElementById('auth-identifier').value = result.email;
      message.innerText = result.error;
      return;
    }
    if (!response.ok) throw new Error(result.error || 'No se pudo completar la solicitud.');
    if (mode === 'forgot' || mode === 'resend-verification') {
      message.innerText = result.message;
      return;
    }
    if (mode === 'register') {
      setAuthMode('verify-email');
      document.getElementById('auth-identifier').value = identifier;
      message.innerText = result.message;
      return;
    }
    if (mode === 'verify-email') {
      setAuthMode('login');
      document.getElementById('auth-identifier').value = identifier;
      message.innerText = result.message;
      return;
    }
    appState.currentUser = result.user;
    appState.xp = result.progress.xp;
    appState.completedLessons = result.progress.completedLessons;
    appState.completedArcadeLevels = result.progress.completedArcadeLevels;
    appState.lessonResults = result.progress.lessonResults || [];
    initializeSessionProtection();
    await loadAssignedLessons();
    await loadAssignedGames();
    await loadLessonOverrides();
    saveState();
    updateAuthUI();
    updateStatsUI();
    renderContinuousMap();
    closeAuthModal();
    playSound('success');
    owlSpeak(`¡Hola, ${result.user.name}!`);
  } catch (error) {
    message.innerText = error.message;
  } finally {
    submit.disabled = false;
  }
}

async function handleLogout(reason = null) {
  try {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    if (!response.ok) throw new Error('No se pudo cerrar la sesión.');
    stopSessionProtection();
    appState.currentUser = null;
    appState.xp = 0;
    appState.completedLessons = [];
    appState.completedArcadeLevels = [];
    appState.lessonResults = [];
    appState.customLessons = [];
    appState.customGames = [];
    saveState();
    updateAuthUI();
    setAuthMode('login');
    document.getElementById('auth-modal').classList.add('hidden');
    switchTab('map');
    renderArcadeHub();
    if (reason === 'idle') {
      openAuthModal();
      document.getElementById('auth-message').innerText = 'Cerramos tu sesión después de 3 minutos sin actividad. Inicia sesión para continuar.';
    }
  } catch (error) {
    console.error(error);
    if (reason === 'idle') {
      document.getElementById('progress-sync-status').innerText = 'No se pudo cerrar la sesión; volveremos a intentarlo.';
      document.getElementById('progress-sync-status').classList.add('text-rose-600');
      return false;
    }
    alert(error.message);
    return false;
  }
  playSound('pop');
  return true;
}

async function initializeAuthentication() {
  try {
    const response = await fetch('/api/auth/me');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (result.user) {
      appState.currentUser = result.user;
      appState.xp = result.progress.xp;
      appState.completedLessons = result.progress.completedLessons;
      appState.completedArcadeLevels = result.progress.completedArcadeLevels;
      appState.lessonResults = result.progress.lessonResults || [];
      await loadAssignedLessons();
      await loadAssignedGames();
      await loadLessonOverrides();
    }
  } catch (error) {
    console.error('No se pudo comprobar la sesión:', error);
    document.getElementById('auth-message').innerText = 'No se pudo conectar con el servidor. Comprueba que esté iniciado e inténtalo de nuevo.';
  }
  initializeSessionProtection();
  authenticationInitialized = true;
  loadState();
  renderContinuousMap();
  renderArcadeHub();
  initializeTeacherDashboard();
  document.getElementById('auth-modal').classList.add('hidden');
}

async function loadAssignedLessons() {
  if (!appState.currentUser || appState.currentUser.role !== 'alumno') {
    appState.customLessons = [];
    return;
  }
  const response = await fetch('/api/lessons/custom');
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'No se pudieron cargar las lecciones asignadas.');
  appState.customLessons = result.lessons.map(lesson => ({
    ...lesson,
    name: lesson.title,
    description: lesson.description || '',
    examples: lesson.words.map((word, index) => ({ w: word, emoji: lesson.emojis?.[index] || WORD_IMAGES[word.toLocaleLowerCase('es')] || '📖' })),
    options: [...new Set([lesson.target, 'A', 'O'])].slice(0, 3),
    reportCategory: lesson.category
  }));
}

async function loadLessonOverrides() {
  if (!appState.currentUser) return;
  const response = await fetch('/api/lessons/overrides');
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'No se pudieron cargar las lecciones editadas.');
  result.overrides.forEach(override => {
    const lesson = ALL_LESSONS.find(item => item.id === override.id);
    if (!lesson) return;
    Object.assign(lesson, override, {
      name: override.title,
      category: override.category,
      reportCategory: override.category,
      description: override.description || override.mouth
    });
  });
}

async function loadAssignedGames() {
  if (!appState.currentUser || appState.currentUser.role !== 'alumno') {
    appState.customGames = [];
    return;
  }
  const response = await fetch('/api/games/custom');
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'No se pudieron cargar los juegos asignados.');
  appState.customGames = result.games;
}

async function handlePasswordResetSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  validatePasswordInput(document.getElementById('reset-password'));
  if (!form.reportValidity()) return;
  const params = new URLSearchParams(window.location.search);
  const message = document.getElementById('auth-message');
  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: params.get('token'),
        password: document.getElementById('reset-password').value
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se pudo restablecer la contraseña.');
    window.history.replaceState({}, '', window.location.pathname);
    document.getElementById('reset-password-modal').classList.add('hidden');
    setAuthMode('login');
    document.getElementById('auth-modal').classList.remove('hidden');
    document.getElementById('auth-message').innerText = result.message;
  } catch (error) {
    message.innerText = error.message;
  }
}

function togglePasswordVisibility(buttonId, inputId) {
  const input = document.getElementById(inputId);
  const visible = input.type === 'password';
  input.type = visible ? 'text' : 'password';
  document.querySelector(`#${buttonId} i`).className = visible ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
}

function passwordPolicyError(password) {
  if (password.length < 10 || password.length > 128 ||
      !/\p{Ll}/u.test(password) || !/\p{Lu}/u.test(password) ||
      !/\d/.test(password) || !/[^\p{L}\p{N}\s]/u.test(password)) {
    return 'Usa de 10 a 128 caracteres e combina una mayúscula, una minúscula, un número y un carácter especial.';
  }
  return '';
}

function validateRegistrationFields() {
  const name = document.getElementById('auth-name');
  const username = document.getElementById('auth-username');
  const password = document.getElementById('auth-password');
  const trimmedName = name.value.trim();
  const nameIsValid = /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u.test(name.value.trim());
  name.setCustomValidity(trimmedName.length < 8
    ? 'El nombre completo debe tener al menos 8 caracteres.'
    : !nameIsValid
      ? 'Escribe solo letras, espacios, apóstrofes o guiones en el nombre.'
      : '');
  username.setCustomValidity(username.value.trim().length < 4
    ? 'El nombre de usuario debe tener al menos 4 caracteres.'
    : '');
  password.setCustomValidity(passwordPolicyError(password.value));
}

function validatePasswordInput(input) {
  input.setCustomValidity(passwordPolicyError(input.value));
}

function validateAuthFields() {
  const identifier = document.getElementById('auth-identifier');
  const message = document.getElementById('auth-message');
  if (authMode === 'register') validateRegistrationFields();
  if (!identifier.value.trim()) {
    message.innerText = 'Este campo es obligatorio.';
    return false;
  }
  if ((authMode === 'register' || authMode === 'forgot' || authMode === 'resend-verification') && !identifier.validity.valid) {
    message.innerText = 'Escribe un correo electrónico válido.';
    return false;
  }
  message.innerText = '';
  return true;
}

async function openAdminPanel() {
  if (appState.currentUser?.role !== 'superadmin') return;
  const modal = document.getElementById('admin-users-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  await loadAdminUsers();
}

function closeAdminPanel() {
  const modal = document.getElementById('admin-users-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

async function loadAdminUsers() {
  const list = document.getElementById('admin-users-list');
  const message = document.getElementById('admin-users-message');
  list.replaceChildren();
  message.innerText = 'Cargando usuarios...';
  try {
    const response = await fetch('/api/admin/users');
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se pudieron cargar los usuarios.');
    for (const user of result.users) {
      const row = document.createElement('tr');
      row.className = 'border-b border-purple-50';
      const details = document.createElement('td');
      details.className = 'p-2 font-bold';
      details.textContent = `${user.name} (@${user.username})`;
      const email = document.createElement('td');
      email.className = 'p-2';
      email.textContent = `${user.email}${user.emailVerifiedAt ? '' : ' · pendiente de verificar'}`;
      const role = document.createElement('td');
      role.className = 'p-2';
      role.textContent = `${roleLabel(user.role)}${user.deletedAt ? ' · Eliminada' : user.accessBlockedAt ? ' · Bloqueada' : ''}`;
      if (user.role === 'superadmin') {
      }
      const progress = document.createElement('td');
      progress.className = 'p-2';
      progress.textContent = `${user.xp} XP`;
      const sessions = document.createElement('td');
      sessions.className = 'p-2';
      sessions.textContent = String(user.activeSessions);
      const action = document.createElement('td');
      action.className = 'flex flex-wrap gap-2 p-2';
      if (user.deletedAt) {
        const restore = document.createElement('button');
        restore.className = 'text-emerald-700 underline font-bold';
        restore.textContent = 'Restaurar';
        restore.addEventListener('click', () => administerUser(user, 'restore', 'POST'));
        action.append(restore);
      } else if (user.id !== result.currentUserId) {
        if (user.role !== 'superadmin') {
          const roleSelect = document.createElement('select');
          roleSelect.className = 'rounded-lg border border-purple-200 p-1 text-xs font-bold text-slate-800';
          for (const [value, label] of [['alumno', 'Alumno'], ['profesor', 'Profesor']]) {
            roleSelect.add(new Option(label, value));
          }
          roleSelect.value = user.role;
          const saveRoleButton = document.createElement('button');
          saveRoleButton.className = 'text-purple-700 underline font-bold';
          saveRoleButton.textContent = 'Rol';
          saveRoleButton.disabled = true;
          roleSelect.addEventListener('change', () => {
            saveRoleButton.disabled = roleSelect.value === user.role;
          });
          saveRoleButton.addEventListener('click', () => updateManagedUserRole(user, roleSelect, saveRoleButton));
          action.append(roleSelect, saveRoleButton);
        }
        const access = document.createElement('button');
        access.className = 'text-amber-700 underline font-bold';
        access.textContent = user.accessBlockedAt ? 'Desbloquear acceso' : 'Bloquear acceso';
        access.addEventListener('click', () => administerUser(user, 'access', 'PATCH', {
          blocked: !user.accessBlockedAt
        }));
        action.append(access);
        if (user.activeSessions) {
          const closeSessions = document.createElement('button');
          closeSessions.className = 'text-sky-700 underline font-bold';
          closeSessions.textContent = 'Cerrar sesiones';
          closeSessions.addEventListener('click', () => administerUser(user, 'sessions', 'DELETE'));
          action.append(closeSessions);
        }
        const button = document.createElement('button');
        button.className = 'text-rose-600 underline font-bold';
        button.textContent = 'Eliminar';
        button.addEventListener('click', () => deleteManagedUser(user));
        action.append(button);
      } else {
        action.textContent = 'Tu sesión';
      }
      row.append(details, email, role, progress, sessions, action);
      list.append(row);
    }
    message.innerText = `${result.users.length} cuenta(s).`;
    message.classList.remove('text-rose-600');
    message.classList.add('text-purple-700');
  } catch (error) {
    message.innerText = error.message;
    message.classList.add('text-rose-600');
  }
}

async function updateManagedUserRole(user, roleSelect, button) {
  button.disabled = true;
  try {
    const response = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: roleSelect.value })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se pudo cambiar el rol.');
    await loadAdminUsers();
  } catch (error) {
    document.getElementById('admin-users-message').innerText = error.message;
    document.getElementById('admin-users-message').classList.add('text-rose-600');
    button.disabled = false;
  }
}

async function deleteManagedUser(user) {
  if (!confirm(`¿Eliminar la cuenta de ${user.name} (${user.email})? Podrás restaurarla desde este panel.`)) return;
  try {
    const response = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}`, { method: 'DELETE' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se pudo eliminar al usuario.');
    await loadAdminUsers();
  } catch (error) {
    document.getElementById('admin-users-message').innerText = error.message;
  }
}

async function administerUser(user, action, method, body = undefined) {
  const prompt = action === 'restore' ? `¿Restaurar la cuenta de ${user.name}?`
    : action === 'sessions' ? `¿Cerrar todas las sesiones activas de ${user.name}?`
      : body?.blocked ? `¿Bloquear el acceso de ${user.name} y cerrar sus sesiones?`
        : `¿Permitir de nuevo el acceso a ${user.name}?`;
  if (!confirm(prompt)) return;
  try {
    const response = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}/${action}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se pudo actualizar la cuenta.');
    await loadAdminUsers();
  } catch (error) {
    document.getElementById('admin-users-message').innerText = error.message;
  }
}

async function createAdminUser(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const message = document.getElementById('admin-users-message');
  const password = document.getElementById('admin-create-password').value;
  const passwordError = passwordPolicyError(password);
  if (passwordError) {
    message.textContent = passwordError;
    return;
  }
  try {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('admin-create-name').value.trim(),
        email: document.getElementById('admin-create-email').value.trim(),
        username: document.getElementById('admin-create-username').value.trim(),
        role: document.getElementById('admin-create-role').value,
        password
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se pudo crear la cuenta.');
    form.reset();
    message.textContent = 'Cuenta creada y activada correctamente.';
    await loadAdminUsers();
  } catch (error) {
    message.textContent = error.message;
    message.classList.add('text-rose-600');
  }
}

/* ==========================================================================
   4. SÍNTESIS DE VOZ Y EFECTOS DE SONIDO
   ========================================================================== */
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playSound(type) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'correct' || type === 'success') {
      [523.25, 659.25, 783.99, 1046.50].forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.08);
        gain.gain.setValueAtTime(0.15, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + idx * 0.08); osc.stop(now + idx * 0.08 + 0.25);
      });
    } else if (type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(850, now + 0.08);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.08);
    } else if (type === 'error' || type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.setValueAtTime(110, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.25);
    }
  } catch (e) {}
}

let currentInstructionText = "¡Hola amiguito! Elige una lección para comenzar.";

function owlSpeak(text, callback = null) {
  currentInstructionText = text;
  const owlText = document.getElementById('owl-speech-text');
  if (owlText) owlText.innerText = text;

  const bubble = document.getElementById('mascot-speaking-bubble');
  if (bubble) bubble.innerText = text;

  if (!appState.voiceEnabled) { if (callback) callback(); return; }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.toLowerCase());
    utterance.lang = 'es-ES';
    utterance.rate = 0.85;
    utterance.pitch = 1.1;

    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es'));
    if (esVoice) utterance.voice = esVoice;

    if (callback) utterance.onend = callback;
    window.speechSynthesis.speak(utterance);
  } else {
    if (callback) callback();
  }
}

function speakText(text) { owlSpeak(text); }

function speakCurrentInstruction(force = false) {
  if (force || appState.voiceEnabled) owlSpeak(currentInstructionText);
}

function toggleVoiceSpeech() {
  appState.voiceEnabled = !appState.voiceEnabled;
  const btnText = document.getElementById('voice-btn-text');
  const icon = document.getElementById('voice-icon');
  if (appState.voiceEnabled) {
    btnText.innerText = "Voz: ON";
    icon.className = "fa-solid fa-volume-high text-purple-600";
    owlSpeak("¡Voz activada!");
  } else {
    btnText.innerText = "Voz: OFF";
    icon.className = "fa-solid fa-volume-xmark text-slate-400";
    window.speechSynthesis?.cancel();
  }
  saveState();
}

function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#3b82f6'];
  let particles = [];

  for (let i = 0; i < 70; i++) {
    particles.push({
      x: canvas.width / 2, y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 14, vy: (Math.random() - 0.7) * 14,
      size: Math.random() * 8 + 6, color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360, rSpeed: (Math.random() - 0.5) * 8, life: 1
    });
  }

  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.rotation += p.rSpeed; p.life -= 0.018;
      if (p.life > 0) {
        alive = true;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color; ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });
    if (alive) requestAnimationFrame(update);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  update();
}

/* ==========================================================================
   5. NAVEGACIÓN Y RENDERIZADO DEL MAPA CONTINUO
   ========================================================================== */
function hasFullAccess() {
  return appState.currentUser?.role === 'profesor' || appState.currentUser?.role === 'superadmin';
}

function canAccessGames() {
  return appState.currentUser?.role === 'alumno' || hasFullAccess();
}

async function enterStudentPreview() {
  if (!hasFullAccess() || studentPreviewActive) return;
  const studentId = document.getElementById('teacher-student-select').value;
  if (!studentId) {
    document.getElementById('teacher-dashboard-message').innerText = 'Selecciona un alumno para abrir su vista.';
    return;
  }
  const message = document.getElementById('teacher-dashboard-message');
  try {
    const response = await fetch(`/api/teacher/students/${encodeURIComponent(studentId)}/experience`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se pudo abrir la vista del alumno.');
    studentPreviewReturnState = {
      currentUser: appState.currentUser,
      xp: appState.xp,
      completedLessons: appState.completedLessons,
      completedArcadeLevels: appState.completedArcadeLevels,
      lessonResults: appState.lessonResults,
      customLessons: appState.customLessons,
      customGames: appState.customGames
    };
    appState.currentUser = { ...result.student, email: '', role: 'alumno' };
    appState.xp = result.progress.xp;
    appState.completedLessons = result.progress.completedLessons;
    appState.completedArcadeLevels = result.progress.completedArcadeLevels;
    appState.lessonResults = result.progress.lessonResults || [];
    appState.customLessons = result.lessons.map(lesson => ({
      ...lesson,
      name: lesson.title,
      examples: lesson.words.map((word, index) => ({
        w: word,
        emoji: lesson.emojis?.[index] || WORD_IMAGES[word.toLocaleLowerCase('es')] || '📖'
      })),
      options: [...new Set([lesson.target, 'A', 'O'])].slice(0, 3),
      reportCategory: lesson.category
    }));
    appState.customGames = result.games;
    studentPreviewActive = true;
    document.getElementById('student-preview-name').textContent = result.student.name;
    closeTeacherDashboard();
    updateAuthUI();
    switchTab('map');
    renderArcadeHub();
    owlSpeak(`Vista de alumno activada para ${result.student.name}. El progreso de prueba no se guardará.`);
  } catch (error) {
    message.innerText = error.message;
  }
}

function exitStudentPreview() {
  if (!studentPreviewActive || !studentPreviewReturnState) return;
  Object.assign(appState, studentPreviewReturnState);
  studentPreviewReturnState = null;
  studentPreviewActive = false;
  document.getElementById('student-preview-banner').classList.add('hidden');
  updateAuthUI();
  renderContinuousMap();
  renderArcadeHub();
  owlSpeak('Saliste de la vista del alumno. Volviste a tu cuenta.');
}

function nextLessonId() {
  return ALL_LESSONS.find(lesson => !appState.completedLessons.includes(lesson.id))?.id;
}

function canAccessLesson(lessonId) {
  if (appState.customLessons.some(lesson => lesson.id === lessonId)) return true;
  if (hasFullAccess() || appState.completedLessons.includes(lessonId)) return true;
  return nextLessonId() === lessonId;
}

function lessonHasBeenCompleted(lesson) {
  if (lesson.isCustom) return appState.lessonResults.some(result => result.lessonId === lesson.id && result.attempts > 0);
  return appState.completedLessons.includes(lesson.id);
}

function canAccessArcadeLevel(gameId, level) {
  if (hasFullAccess() || level === 1) return true;
  return appState.completedArcadeLevels.includes(`${gameId}-${level - 1}`);
}

function switchTab(tab) {
  playSound('pop');
  if (tab === 'minigames' && !canAccessGames()) {
    if (!appState.currentUser) {
      setAuthMode('login');
      document.getElementById('auth-modal').classList.remove('hidden');
      document.getElementById('auth-message').innerText = 'Inicia sesión o crea una cuenta para jugar a los minijuegos.';
    } else {
      owlSpeak('Inicia sesión con una cuenta para acceder a los minijuegos.');
    }
    return;
  }
  if (activeGameLoop) { cancelAnimationFrame(activeGameLoop); activeGameLoop = null; }

  document.getElementById('view-map').classList.add('hidden');
  document.getElementById('view-minigames').classList.add('hidden');

  const btnMap = document.getElementById('tab-btn-map');
  const btnMg = document.getElementById('tab-btn-minigames');

  if (tab === 'map') {
    document.getElementById('view-map').classList.remove('hidden');
    btnMap.className = "px-4 py-2 rounded-2xl font-black text-xs font-fredoka transition bg-purple-600 text-white shadow-md";
    btnMg.className = "px-4 py-2 rounded-2xl font-black text-xs font-fredoka transition text-slate-600 hover:bg-purple-100";
    renderContinuousMap();
  } else {
    document.getElementById('view-minigames').classList.remove('hidden');
    btnMg.className = "px-4 py-2 rounded-2xl font-black text-xs font-fredoka transition bg-purple-600 text-white shadow-md";
    btnMap.className = "px-4 py-2 rounded-2xl font-black text-xs font-fredoka transition text-slate-600 hover:bg-purple-100";
    renderArcadeHub();
  }
}

function renderContinuousMap() {
  saveState();
  const container = document.getElementById('learning-path-nodes');
  container.innerHTML = '';
  const items = orderLessonsForMap(appState.customLessons);
  const currentIndex = items.findIndex(item => !lessonHasBeenCompleted(item));

  items.forEach((item, idx) => {
    const isDone = lessonHasBeenCompleted(item);
    const isLocked = !canAccessLesson(item.id);
    const isCurrent = idx === currentIndex;
    const alignOffsets = ['justify-start pl-4 sm:pl-12', 'justify-center', 'justify-end pr-4 sm:pr-12', 'justify-center'];
    const alignmentClass = alignOffsets[idx % 4];

    const wrapper = document.createElement('div');
    wrapper.className = `flex ${alignmentClass} items-center my-4 relative`;

    if (item.isMilestone) {
      wrapper.innerHTML = `
        <div id="node-${item.id}" onclick="openMilestoneGame('${item.id}')" class="map-node ${isDone ? 'map-node-completed' : 'map-node-pending'} bouncy ${isLocked ? 'opacity-60 grayscale' : 'cursor-pointer'} rounded-3xl p-4 sm:p-5 shadow-xl border-b-8 flex items-center gap-4 max-w-xs sm:max-w-md w-full relative z-10">
          ${isCurrent ? '<span class="current-owl-marker" aria-label="Desafío actual">🦉</span>' : ''}
          <div class="w-14 h-14 bg-white/30 rounded-2xl flex items-center justify-center text-3xl text-amber-950 shadow-inner flex-shrink-0">
            <i class="fa-solid fa-trophy"></i>
          </div>
          <div class="flex-grow">
            <div class="text-[10px] font-black uppercase text-amber-900 tracking-wider">Desafío de Repaso (Cada 5 Lecciones)</div>
            <div class="text-base sm:text-lg font-black font-fredoka leading-tight">${item.title}</div>
          </div>
          <span class="bg-purple-900 text-yellow-300 font-black text-xs px-3 py-2 rounded-xl shadow font-fredoka">${isLocked ? '<i class="fa-solid fa-lock"></i> Bloqueado' : '¡Jugar!'}</span>
        </div>
      `;
    } else {
      wrapper.innerHTML = `
        <div id="node-${item.id}" data-theme="${item.theme || 'violet'}" onclick="openLessonModal('${item.id}')" class="learning-node map-node ${isDone ? 'map-node-completed' : 'map-node-pending'} bouncy ${isLocked ? 'opacity-60 grayscale' : 'cursor-pointer'} rounded-3xl p-3 sm:p-4 border-4 ${isCurrent && !isDone ? 'ring-4 ring-amber-200' : ''} shadow-lg hover:shadow-2xl flex items-center gap-3 sm:gap-4 w-56 sm:w-64 relative z-10 group">
          ${isDone ? '<div class="absolute -top-2 -right-2 bg-green-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm shadow"><i class="fa-solid fa-check"></i></div>' : ''}
          ${isLocked ? '<div class="absolute -top-2 -right-2 bg-slate-700 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm shadow"><i class="fa-solid fa-lock"></i></div>' : ''}
          ${isCurrent ? '<span class="current-owl-marker" aria-label="Lección actual">🦉</span>' : ''}
          <div class="node-letter w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white font-black text-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0 font-fredoka">
            ${item.target.length > 4 ? '💬' : item.target}
          </div>
          <div class="flex-grow text-left">
            <div class="node-category text-xs font-bold text-purple-500 uppercase tracking-wider">${item.category}${item.isCustom ? ' · PERSONALIZADA' : ''}</div>
            <div class="node-name text-sm font-black text-slate-800 font-fredoka leading-tight">${item.name}</div>
          </div>
        </div>
      `;
    }
    container.appendChild(wrapper);
  });

  setTimeout(drawTrailPath, 100);
}

function drawTrailPath() {
  const container = document.getElementById('map-trail-container');
  const svgPath = document.getElementById('trail-curve');
  const progressPath = document.getElementById('trail-progress');
  const nodes = container.querySelectorAll('#learning-path-nodes > div > div[id^="node-"]');
  if (nodes.length < 2) return;

  const containerRect = container.getBoundingClientRect();
  const points = Array.from(nodes, node => {
    const rect = node.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top + rect.height / 2 - containerRect.top
    };
  });

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const previous = points[i - 1];
    const point = points[i];
    const controlY = previous.y + (point.y - previous.y) / 2;
    pathD += ` C ${previous.x} ${controlY}, ${point.x} ${controlY}, ${point.x} ${point.y}`;
  }
  svgPath.setAttribute('d', pathD);
  progressPath.setAttribute('d', pathD);
  const pathLength = progressPath.getTotalLength();
  const mapLessons = [...ALL_LESSONS, ...appState.customLessons];
  const firstIncomplete = mapLessons.findIndex(lesson => !lessonHasBeenCompleted(lesson));
  const completedPrefix = firstIncomplete < 0 ? mapLessons.length : firstIncomplete;
  const progressLength = pathLength * Math.max(0, Math.min(1, completedPrefix / Math.max(1, nodes.length - 1)));
  progressPath.setAttribute('stroke-dasharray', `${pathLength}`);
  progressPath.setAttribute('stroke-dashoffset', `${pathLength - progressLength}`);
}

function scrollToNextLesson() {
  const firstUnfinished = [...ALL_LESSONS, ...appState.customLessons].find(l => !lessonHasBeenCompleted(l));
  if (firstUnfinished) {
    if (firstUnfinished.isMilestone) {
      openMilestoneGame(firstUnfinished.id);
      return;
    }
    const el = document.getElementById(`node-${firstUnfinished.id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/* ==========================================================================
   6. REPRODUCTOR DE LECCIONES Y MINIJUEGOS INTERMEDIOS
   ========================================================================== */
function openLessonModal(lessonId) {
  const lesson = ALL_LESSONS.find(l => l.id === lessonId) || appState.customLessons.find(l => l.id === lessonId);
  if (!lesson) return;
  if (!canAccessLesson(lessonId)) {
    owlSpeak('Completa la lección anterior para desbloquear esta.');
    return;
  }
  lessonPreviewMode = false;
  appState.currentModalLesson = lesson;
  appState.currentMistakes = 0;
  appState.modalStep = 1;
  resetLessonStepProgress();
  document.getElementById('lesson-modal').classList.remove('hidden');
  renderModalStep();
}

let lessonPreviewMode = false;
function shuffleValues(values) {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function resetLessonStepProgress() {
  appState.modalStepComplete = [false, false, false];
  appState.modalStepItems = new Set();
}

function updateLessonStepCompletion(step, complete) {
  appState.modalStepComplete[step - 1] = complete;
  const nextButton = document.getElementById('modal-next-btn');
  if (nextButton) nextButton.disabled = !complete;
  if (nextButton) nextButton.classList.toggle('opacity-50', !complete);
  if (nextButton) nextButton.classList.toggle('cursor-not-allowed', !complete);
}

function markLessonStepItem(step, index, total) {
  appState.modalStepItems.add(`${step}:${index}`);
  if (Array.from({ length: total }, (_, itemIndex) => appState.modalStepItems.has(`${step}:${itemIndex}`)).every(Boolean)) {
    updateLessonStepCompletion(step, true);
  }
}

function openCustomLessonPreview(lesson) {
  if (!hasFullAccess() || !lesson || !Array.isArray(lesson.words) || !Array.isArray(lesson.emojis)) return;
  const previewLesson = {
    ...lesson,
    isCustom: true,
    name: lesson.title,
    examples: lesson.words.map((word, index) => ({ w: word, emoji: lesson.emojis[index] || '📖' })),
    options: [...new Set([lesson.target, 'A', 'O'])].slice(0, 3),
    reportCategory: lesson.category
  };
  lessonPreviewMode = true;
  appState.currentModalLesson = previewLesson;
  appState.currentMistakes = 0;
  appState.modalStep = 1;
  resetLessonStepProgress();
  document.getElementById('lesson-modal').classList.remove('hidden');
  renderModalStep();
}

function closeLessonModal() {
  document.getElementById('lesson-modal').classList.add('hidden');
  lessonPreviewMode = false;
}

function renderModalStep() {
  const lesson = appState.currentModalLesson;
  if (!lesson) return;
  const body = document.getElementById('modal-game-area');
  body.dataset.step = String(appState.modalStep);
  document.getElementById('modal-lesson-title').innerText = `${lesson.name}`;
  const isRepeat = lessonHasBeenCompleted(lesson);
  document.getElementById('modal-lesson-subtitle').innerText = `${lesson.category}${isRepeat ? ' · REPASO' : ''}`;

  for (let i = 1; i <= 3; i++) {
    document.getElementById(`modal-dot-${i}`).className = i <= appState.modalStep ? 'w-3.5 h-3.5 rounded-full bg-purple-600' : 'w-3.5 h-3.5 rounded-full bg-slate-200';
  }

  document.getElementById('modal-step-indicator').innerText = `Paso ${appState.modalStep} de 3`;
  document.getElementById('modal-prev-btn').classList.toggle('hidden', appState.modalStep === 1);
  document.getElementById('modal-next-btn').innerText = appState.modalStep === 3 ? 'Terminar' : 'Siguiente';
  document.getElementById('modal-next-btn').disabled = !appState.modalStepComplete[appState.modalStep - 1];
  document.getElementById('modal-next-btn').classList.toggle('opacity-50', !appState.modalStepComplete[appState.modalStep - 1]);
  document.getElementById('modal-next-btn').classList.toggle('cursor-not-allowed', !appState.modalStepComplete[appState.modalStep - 1]);

  if (appState.modalStep === 1) {
    const description = lesson.description || lesson.mouth || 'Escucha con atención el sonido de esta lección.';
    owlSpeak(`Paso 1: descubrimos el sonido. ${description} ${lesson.syllables ? 'Escucha todas las sílabas y tócalas para oírlas.' : `Toca la letra ${lesson.target} para escucharla.`}`);
    const practiceTarget = lesson.syllables
      ? `<div class="flex flex-wrap justify-center gap-2">${lesson.syllables.map((syllable, index) => `<button type="button" data-sound-index="${index}" class="lesson-practice-choice bouncy bg-gradient-to-tr from-purple-600 to-pink-500 text-white rounded-2xl px-3 py-3 font-black font-fredoka">${escapeHtml(syllable)}</button>`).join('')}</div>`
      : `<button type="button" data-sound-index="0" class="lesson-practice-choice bouncy inline-flex flex-col items-center justify-center min-w-32 min-h-32 px-4 bg-gradient-to-tr from-purple-600 to-pink-500 text-white rounded-3xl shadow-xl mx-auto border-4 border-yellow-300"><span class="text-3xl font-black font-fredoka">${escapeHtml(lesson.target)}</span><span class="text-[10px] font-black text-yellow-200 mt-1 uppercase"><i class="fa-solid fa-volume-high"></i> Toca para oír</span></button>`;
    body.innerHTML = `
      <div class="text-center space-y-4 my-auto w-full max-w-[70rem]">
        <span class="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-black uppercase">Paso 1: Descubrimos el Sonido</span>
        <h4 class="text-2xl font-black text-purple-950 font-fredoka">${lesson.syllables ? 'Escucha las sílabas' : '¿Cómo suena?'}</h4>
        ${practiceTarget}
        <div class="bg-purple-50 rounded-2xl p-4 border-2 border-purple-200 text-center">
          <p class="text-purple-950 font-bold text-sm">${escapeHtml(description)}</p>
        </div>
      </div>
    `;
    body.querySelectorAll('[data-sound-index]').forEach(button => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.soundIndex);
        const sound = lesson.syllables?.[index] || lesson.target;
        owlSpeak(sound);
        button.classList.add('ring-4', 'ring-emerald-300');
        markLessonStepItem(1, index, lesson.syllables?.length || 1);
      });
    });
  } else if (appState.modalStep === 2) {
    const examples = lesson.examples || [{w: lesson.target, emoji: '✨'}];
    const targets = lesson.syllables || [lesson.target];
    const existingWords = new Set(examples.map(example => normalizePracticeText(example.w)));
    const distractors = shuffleValues(Object.keys(WORD_IMAGES)
      .filter(word => !existingWords.has(normalizePracticeText(word)))
      .filter(word => !containsLessonTarget(word, targets)))
      .slice(0, 2)
      .map(word => ({ w: word, emoji: getWordImage(word), isDistractor: true }));
    const practiceWords = shuffleValues([...examples, ...distractors]
      .filter((item, index, all) => all.findIndex(other => normalizePracticeText(other.w) === normalizePracticeText(item.w)) === index));
    owlSpeak(lesson.readingText
      ? `Paso 2: lectura. Escucha y sigue la lectura. ${lesson.readingText}`
      : `Paso 2: palabras. Escucha cada palabra tocando su imagen. Indica cuáles tienen el sonido ${targets.join(' o ')} y cuáles no lo tienen.`);
    body.innerHTML = `
      <div class="text-center space-y-4 my-auto w-full max-w-[70rem]">
        <span class="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-black uppercase">${lesson.readingText ? 'Paso 2: Lectura' : 'Paso 2: Ejemplos'}</span>
        <h4 class="text-2xl font-black text-purple-950 font-fredoka">${lesson.readingText ? lesson.name : 'Lectura de palabras'}</h4>
        ${lesson.readingText ? '<button id="repeat-reading-btn" type="button" aria-label="Volver a escuchar la lectura" class="bouncy inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 font-black text-slate-900"><i class="fa-solid fa-volume-high"></i><span>Escuchar lectura</span></button>' : ''}
        ${lesson.readingText ? `<p class="rounded-2xl bg-white p-4 text-left text-sm font-semibold leading-relaxed text-slate-700">${lesson.readingText}</p>` : ''}
        <p class="text-base sm:text-lg font-bold text-slate-700">${lesson.readingText ? 'Escucha la lectura completa antes de continuar.' : `Escucha cada palabra tocando su imagen. Indica cuáles tienen el sonido ${escapeHtml(targets.join(' o '))} y cuáles no lo tienen.`}</p>
        ${lesson.readingText ? '' : `<div class="flex flex-wrap justify-center gap-3 text-sm font-black text-slate-700">
          <span class="rounded-xl bg-emerald-50 px-3 py-2"><span class="mr-1 text-2xl text-emerald-700" aria-hidden="true">☑</span>Tiene el sonido</span>
          <span class="rounded-xl bg-rose-50 px-3 py-2"><span class="mr-1 text-2xl text-rose-700" aria-hidden="true">☒</span>No tiene el sonido</span>
        </div>`}
        <div class="lesson-word-grid grid gap-3 my-2">
          ${practiceWords.map((item, index) => `
            <article data-practice-card="${index}" class="bouncy ${item.isDistractor ? 'bg-sky-50 border-sky-300' : 'bg-amber-50 border-amber-200'} rounded-2xl p-4 border-2 text-center shadow-md flex flex-col items-center justify-center">
              <button type="button" data-play-word="${index}" aria-label="Escuchar la palabra ${escapeHtml(item.w)}" class="lesson-word-audio flex w-full flex-col items-center rounded-xl p-1">
              <div class="relative w-16 h-16 mb-1">
                <span class="hidden absolute inset-0 items-center justify-center text-4xl" aria-hidden="true">${escapeHtml(item.emoji)}</span>
                <img src="${emojiImageUrl(item.emoji)}" alt="${item.w}" loading="lazy" decoding="async" class="absolute inset-0 w-full h-full object-contain" onerror="this.classList.add('hidden'); this.previousElementSibling.classList.remove('hidden'); this.previousElementSibling.classList.add('flex')">
              </div>
              <div class="text-base font-black text-slate-800 font-fredoka">${escapeHtml(item.w)}</div>
              </button>
              ${lesson.readingText ? '' : `<div class="mt-2 flex gap-2">
                <button type="button" data-word-answer="${index}:yes" aria-label="Sí tiene el sonido ${escapeHtml(targets.join(' o '))}" class="rounded-lg bg-white px-3 py-1 text-3xl font-black text-emerald-700" title="Sí tiene el sonido">☑</button>
                <button type="button" data-word-answer="${index}:no" aria-label="No tiene el sonido ${escapeHtml(targets.join(' o '))}" class="rounded-lg bg-white px-3 py-1 text-3xl font-black text-rose-700" title="No tiene el sonido">☒</button>
              </div>`}
            </article>
          `).join('')}
        </div>
      </div>
    `;
    body.querySelectorAll('[data-play-word]').forEach(button => {
      button.addEventListener('click', () => {
        owlSpeak(practiceWords[Number(button.dataset.playWord)].w);
      });
    });
    body.querySelectorAll('[data-word-answer]').forEach(button => {
      button.addEventListener('click', () => {
        const [rawIndex, answer] = button.dataset.wordAnswer.split(':');
        const index = Number(rawIndex);
        const selected = practiceWords[index];
        const present = containsLessonTarget(selected.w, targets);
        const correct = (answer === 'yes') === present;
        playSound(correct ? 'pop' : 'wrong');
        if (correct) {
          owlSpeak(`${selected.w}. ${present ? 'Sí tiene' : 'No tiene'} el sonido ${targets.join(' o ')}.`);
          body.querySelectorAll(`[data-word-answer^="${index}:"]`).forEach(choice => {
            choice.disabled = true;
            const selected = choice.dataset.wordAnswer.endsWith(`:${answer}`);
            choice.classList.toggle('bg-emerald-200', selected && answer === 'yes');
            choice.classList.toggle('bg-rose-200', selected && answer === 'no');
            choice.setAttribute('aria-pressed', String(selected));
          });
          markLessonStepItem(2, index, practiceWords.length);
        } else {
          appState.currentMistakes++;
          owlSpeak(`Escucha otra vez: ¿${selected.w} tiene el sonido ${targets.join(' o ')}?`);
        }
      });
    });
    const repeatReadingButton = document.getElementById('repeat-reading-btn');
    if (repeatReadingButton) repeatReadingButton.addEventListener('click', () => {
      owlSpeak(lesson.readingText);
      updateLessonStepCompletion(2, true);
    });
  } else if (appState.modalStep === 3) {
    const options = lesson.options || [lesson.target, 'X', 'O'];
    const shuffled = shuffleValues([...new Set(options)]);
    owlSpeak(`Paso 3: práctica guiada. Busca la letra ${lesson.target} y toca la opción correcta.`);
    body.innerHTML = `
      <div class="text-center space-y-4 my-auto w-full max-w-[70rem]">
        <span class="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-black uppercase">Paso 3: Práctica Guiada</span>
        <h4 class="text-2xl font-black text-purple-950 font-fredoka">Busca "${lesson.target}"</h4>
        <div class="lesson-answer-grid grid gap-3 pt-2">
          ${shuffled.map((opt, i) => `
            <button id="modal-opt-${i}" onclick="checkModalAnswer('${opt}', '${lesson.target}', 'modal-opt-${i}')" class="bouncy bg-white border-4 border-purple-300 text-purple-950 font-black text-xl py-4 rounded-2xl shadow-md font-fredoka">
              ${opt}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }
  body.scrollTop = 0;
}

function nextLessonStep() {
  if (!appState.modalStepComplete[appState.modalStep - 1]) {
    const message = 'Primero completa correctamente la actividad de este paso para poder avanzar.';
    owlSpeak(message);
    if (!appState.voiceEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'es-ES';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
    return;
  }
  if (appState.modalStep < 3) {
    appState.modalStep++;
    renderModalStep();
  }
}
function prevLessonStep() {
  if (appState.modalStep > 1) { appState.modalStep--; renderModalStep(); }
}

function checkModalAnswer(selected, correct, btnId) {
  if (selected === correct) {
    playSound('correct');
    owlSpeak(`¡Muy bien! Has acertado.`);
    document.getElementById(btnId).className = "bouncy bg-green-500 text-white border-4 border-green-700 font-black text-xl py-4 rounded-2xl shadow-md font-fredoka";
    document.querySelectorAll('#modal-game-area button').forEach(button => { button.disabled = true; });
    updateLessonStepCompletion(3, true);
    const lessonId = appState.currentModalLesson.id;
    const mistakes = appState.currentMistakes;
    const stars = Math.max(0, 3 - Math.min(3, mistakes));
    const wasRepeat = lessonHasBeenCompleted(appState.currentModalLesson);
    if (lessonPreviewMode) {
      setTimeout(() => {
        closeLessonModal();
        showResultsModal('Vista previa completada. No se guardó progreso.', stars, 0);
      }, 700);
      return;
    }
    recordCompletion('lesson', { id: lessonId, mistakes }).then(() => {
      setTimeout(() => {
        closeLessonModal();
        showResultsModal(wasRepeat ? '¡Repaso completado!' : '¡Lección completada!', stars, wasRepeat ? 0 : 100);
      }, 700);
    }).catch(error => {
      document.querySelectorAll('#modal-game-area button').forEach(button => { button.disabled = false; });
      console.error('No se pudo guardar la finalización de la lección:', error);
      owlSpeak(error.message);
    });
  } else {
    appState.currentMistakes++;
    playSound('wrong');
    owlSpeak(`Inténtalo de nuevo amiguito.`);
  }
}

function openMilestoneGame(mId) {
  const m = ALL_LESSONS.find(l => l.id === mId);
  if (!m) return;
  if (!canAccessLesson(mId)) {
    owlSpeak('Completa las lecciones anteriores para desbloquear este desafío.');
    return;
  }
  const milestoneIndex = ALL_LESSONS.findIndex(lesson => lesson.id === mId);
  const priorBlock = ALL_LESSONS.slice(0, milestoneIndex).filter(lesson => !lesson.isMilestone).slice(-5);
  if (!hasFullAccess() && priorBlock.some(lesson => !appState.completedLessons.includes(lesson.id))) {
    owlSpeak('Completa las cinco lecciones anteriores para desbloquear este desafío.');
    return;
  }
  appState.currentModalLesson = m;
  appState.currentMistakes = 0;
  document.getElementById('milestone-title').innerText = m.title;
  document.getElementById('milestone-modal').classList.remove('hidden');
  const area = document.getElementById('milestone-stage-area');
  
  area.innerHTML = `
    <div class="text-center space-y-4">
      <h4 class="text-xl font-bold text-amber-300 font-fredoka">¿Cuál es la respuesta correcta?</h4>
      <p class="text-xs text-slate-300">Elige la letra o palabra que escuchas: <strong>${m.target}</strong></p>
      <div class="flex justify-center gap-3">${[m.target, 'E', 'O'].filter((value, index, options) => options.indexOf(value) === index).map((value, index) => `<button onclick="checkMilestoneAnswer('${mId}', '${value}')" class="bouncy bg-amber-500 text-slate-950 font-black px-5 py-3 rounded-2xl font-fredoka text-lg">${value}</button>`).join('')}</div>
    </div>
  `;
  owlSpeak(`Desafío de repaso: ${m.title}. Escucha bien: ${m.target}. ¿Cuál es la respuesta correcta? Toca la opción que dice ${m.target}.`);
}

function closeMilestoneModal() {
  document.getElementById('milestone-modal').classList.add('hidden');
}

async function completeMilestone(mId) {
  const wasRepeat = appState.completedLessons.includes(mId);
  const stars = Math.max(0, 3 - Math.min(3, appState.currentMistakes));
  try {
    await recordCompletion('lesson', { id: mId, mistakes: appState.currentMistakes });
    playSound('correct');
    closeMilestoneModal();
    renderContinuousMap();
    showResultsModal(wasRepeat ? '¡Desafío repetido!' : '¡Desafío completado!', stars, wasRepeat ? 0 : 150);
  } catch (error) {
    console.error('No se pudo guardar la finalización del desafío:', error);
    owlSpeak(error.message);
  }
}

function checkMilestoneAnswer(mId, selected) {
  const milestone = ALL_LESSONS.find(lesson => lesson.id === mId && lesson.isMilestone);
  if (!milestone) return;
  if (!canAccessLesson(mId)) {
    owlSpeak('Completa las lecciones anteriores para desbloquear este desafío.');
    return;
  }
  if (selected === milestone.target) completeMilestone(mId);
  else {
    appState.currentMistakes++;
    playSound('wrong');
    owlSpeak('Esa no es. Escucha otra vez e inténtalo de nuevo.');
  }
}

/* ==========================================================================
   7. ARCADE: HUB Y 10 MINIJUEGOS CON 3 NIVELES CADA UNO
   ========================================================================== */
function renderArcadeHub() {
  if (arcadeTransitionTimer !== null) {
    clearTimeout(arcadeTransitionTimer);
    arcadeTransitionTimer = null;
  }
  if (activeGameLoop) { cancelAnimationFrame(activeGameLoop); activeGameLoop = null; }
  clearActiveGameIntervals();
  document.getElementById('arcade-hub-grid').classList.remove('hidden');
  const stage = document.getElementById('arcade-play-stage');
  stage.classList.add('hidden');
  stage.dataset.game = '';
  stage.dataset.levelComplete = '';

  const grid = document.getElementById('arcade-hub-grid');
  grid.innerHTML = '';
  if (!canAccessGames()) {
    grid.innerHTML = '<p class="col-span-full rounded-3xl bg-white p-8 text-center font-black text-purple-900">Inicia sesión con una cuenta de alumno o profesor para acceder a los minijuegos.</p>';
    return;
  }

  const arcadeGames = [
    { id: "snake", title: "Serpiente Lectora", desc: "Maneja la serpiente en 2D para comer las letras correctas.", icon: "fa-solid fa-worm", bg: "from-emerald-500 to-teal-700" },
    { id: "ninja", title: "Ninja de Globos", desc: "Revienta globos que flotan antes de que se escapen.", icon: "fa-solid fa-meteor", bg: "from-pink-500 to-rose-700" },
    { id: "bubbles", title: "Burbujas Parlantes", desc: "Atrapa las burbujas que cantan su fonema al tocarlas.", icon: "fa-solid fa-soap", bg: "from-blue-500 to-cyan-700" },
    { id: "train", title: "Tren de Sílabas", desc: "Arrastra y conecta los vagones de sílabas para formar palabras.", icon: "fa-solid fa-train", bg: "from-amber-500 to-orange-700" },
    { id: "rain", title: "Lluvia de Letras", desc: "Mueve la canasta de izquierda a derecha para atrapar letras.", icon: "fa-solid fa-cloud-rain", bg: "from-indigo-600 to-purple-800" },
    { id: "stacker", title: "Torre de Bloques", desc: "Encaja bloques de sílabas para construir torres gigantes.", icon: "fa-solid fa-cubes", bg: "from-purple-600 to-indigo-800" },
    { id: "paint", title: "El Pincel Mágico", desc: "Dibuja trazos libres en canvas mientras escuchas fonemas.", icon: "fa-solid fa-wand-magic-sparkles", bg: "from-pink-600 to-purple-700" },
    { id: "memory", title: "Memoria Sonora", desc: "Encuentra las parejas de cartas escuchando su pronunciación.", icon: "fa-solid fa-brain", bg: "from-amber-500 to-yellow-600" },
    { id: "runner", title: "Carrera de Sílabas", desc: "Esquiva barriles y salta para recoger sílabas flotantes.", icon: "fa-solid fa-person-running", bg: "from-emerald-600 to-teal-800" },
    { id: "fishing", title: "Pesca de Vocales", desc: "Pesca los peces que llevan la vocal solicitada por el búho.", icon: "fa-solid fa-fish", bg: "from-sky-500 to-blue-700" }
  ];

  arcadeGames.forEach(game => {
    const card = document.createElement('div');
    card.className = `arcade-game-card bouncy bg-gradient-to-br ${game.bg} rounded-3xl p-5 text-white shadow-lg border-b-4 border-slate-900 flex flex-col justify-between`;
    card.innerHTML = `
      <div class="flex items-center gap-4 mb-3">
        <div class="arcade-game-icon w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
          <i class="arcade-game-icon-glyph ${game.icon}"></i>
        </div>
        <div>
          <h3 class="text-base font-black font-fredoka leading-tight">${game.title}</h3>
          <p class="text-[11px] text-white/80 font-semibold mt-0.5">${game.desc}</p>
        </div>
      </div>
      <div class="arcade-level-grid grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/20">
        ${[1, 2, 3].map(level => {
          const unlocked = canAccessArcadeLevel(game.id, level);
          const completed = appState.completedArcadeLevels.includes(`${game.id}-${level}`);
          return `<button onclick="launchLevel('${game.id}', ${level})" ${unlocked ? '' : 'disabled'} class="arcade-level-button ${unlocked ? 'bg-black/30 hover:bg-black/50' : 'bg-black/10 opacity-60 cursor-not-allowed'} text-white font-black text-xs py-1.5 rounded-xl font-fredoka">${unlocked ? `Nivel ${level}${completed ? ' ✓' : ''}` : '<i class="fa-solid fa-lock"></i> Bloqueado'}</button>`;
        }).join('')}
      </div>
    `;
    grid.appendChild(card);
  });
  renderCustomGames();
}

function launchLevel(gameId, level) {
  if (!canAccessGames()) {
    switchTab('minigames');
    return;
  }
  if (!canAccessArcadeLevel(gameId, level)) {
    owlSpeak('Completa el nivel anterior para desbloquear este.');
    return;
  }
  if (arcadeTransitionTimer !== null) {
    clearTimeout(arcadeTransitionTimer);
    arcadeTransitionTimer = null;
  }
  if (activeGameLoop) {
    cancelAnimationFrame(activeGameLoop);
    activeGameLoop = null;
  }
  clearActiveGameIntervals();
  document.getElementById('arcade-hub-grid').classList.add('hidden');
  const stage = document.getElementById('arcade-play-stage');
  stage.classList.remove('hidden');
  stage.dataset.game = gameId;
  stage.dataset.levelComplete = '';

  if (gameId === 'snake') runSnakeGame(stage, level);
  else if (gameId === 'ninja') runNinjaGame(stage, level);
  else if (gameId === 'bubbles') runBubblesGame(stage, level);
  else if (gameId === 'train') runTrainGame(stage, level);
  else if (gameId === 'rain') runRainGame(stage, level);
  else if (gameId === 'stacker') runStackerGame(stage, level);
  else if (gameId === 'paint') runPaintGame(stage, level);
  else if (gameId === 'memory') runMemoryGame(stage, level);
  else if (gameId === 'runner') runRunnerGame(stage, level);
  else if (gameId === 'fishing') runFishingGame(stage, level);
  stage.scrollIntoView({behavior: 'smooth', block: 'start'});
}

/* --------------------------------------------------------------------------
   MOTOR DE LOS 10 MINIJUEGOS CON 3 NIVELES CADA UNO
   -------------------------------------------------------------------------- */

// 1. Serpiente Lectora
function runSnakeGame(stage, level) {
  const target = arcadeContent.randomLetter(level);
  const distractors = arcadeContent.randomLetters(level, 5).filter(letter => letter !== target);
  const obstacleCount = level === 1 ? 3 : level === 2 ? 4 : 5;
  stage.innerHTML = `
    <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
      <button onclick="renderArcadeHub()" class="bouncy bg-slate-800 text-purple-300 font-bold px-3 py-1 rounded-xl text-xs"><i class="fa-solid fa-arrow-left"></i> Volver</button>
      <h4 class="text-emerald-400 font-black font-fredoka">Serpiente Lectora (Nivel ${level})</h4>
      <span id="snake-score" class="text-xs font-bold text-amber-300 font-fredoka">Aciertos: 0/5</span>
    </div>
    <p class="text-center text-amber-200 font-black font-fredoka mb-2">Busca y come la letra: <span class="text-3xl text-white">${target}</span>. ¡Evita los bloques!</p>
    <div class="relative flex-grow flex items-center justify-center">
      <canvas id="snake-canvas" width="320" height="240" class="bg-slate-950 rounded-2xl border-2 border-emerald-500/50 shadow-inner"></canvas>
    </div>
    <div class="text-center min-h-8 mt-2"><p id="snake-message" class="text-xs font-bold text-amber-200"></p><button id="snake-retry" onclick="launchLevel('snake', ${level})" class="hidden bouncy bg-emerald-600 text-white font-black px-4 py-2 rounded-xl text-xs">Intentar otra vez</button></div>
    <div class="grid grid-cols-3 gap-2 max-w-xs mx-auto mt-3">
      <div></div>
      <button onclick="snakeDir({x:0,y:-1})" class="bouncy bg-emerald-600 text-white font-black py-2 rounded-xl"><i class="fa-solid fa-arrow-up"></i></button>
      <div></div>
      <button onclick="snakeDir({x:-1,y:0})" class="bouncy bg-emerald-600 text-white font-black py-2 rounded-xl"><i class="fa-solid fa-arrow-left"></i></button>
      <button onclick="snakeDir({x:0,y:1})" class="bouncy bg-emerald-600 text-white font-black py-2 rounded-xl"><i class="fa-solid fa-arrow-down"></i></button>
      <button onclick="snakeDir({x:1,y:0})" class="bouncy bg-emerald-600 text-white font-black py-2 rounded-xl"><i class="fa-solid fa-arrow-right"></i></button>
    </div>
  `;
  const canvas = document.getElementById('snake-canvas');
  const ctx = canvas.getContext('2d');
  const speed = level === 1 ? 180 : level === 2 ? 130 : 90;
  let snake = [{x: 5, y: 5}];
  let dir = {x: 1, y: 0};
  const obstacles = [];
  const foods = [];
  let foodEaten = 0, gameOver = false;

  function randomCell() {
    let cell;
    do {
      cell = {x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 15)};
    } while ([...snake, ...obstacles, ...foods].some(part => part.x === cell.x && part.y === cell.y));
    return cell;
  }

  while (obstacles.length < obstacleCount) obstacles.push(randomCell());
  foods.push({...randomCell(), letter: target});
  foods.push({...randomCell(), letter: distractors[Math.floor(Math.random() * distractors.length)]});

  owlSpeak(`Nivel ${level}. Busca la letra ${target} y evita los bloques.`);
  window.snakeDir = (nextDir) => {
    if (nextDir.x === -dir.x && nextDir.y === -dir.y) return;
    dir = nextDir;
  };

  function stopSnake(message) {
    gameOver = true;
    document.getElementById('snake-message').innerText = message;
    document.getElementById('snake-retry').classList.remove('hidden');
    owlSpeak(message);
  }

  function update() {
    if (!document.getElementById('snake-canvas') || gameOver) return;
    const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
    if (head.x < 0) head.x = 19; if (head.x >= 20) head.x = 0;
    if (head.y < 0) head.y = 14; if (head.y >= 15) head.y = 0;
    const foodIndex = foods.findIndex(food => head.x === food.x && head.y === food.y);
    const eatenFood = foodIndex >= 0 ? foods[foodIndex] : null;
    const ateFood = eatenFood !== null;
    if (obstacles.some(block => block.x === head.x && block.y === head.y)) {
      stopSnake('¡Chocaste con un bloque!');
      return;
    }
    const bodyToCheck = ateFood ? snake : snake.slice(0, -1);
    if (bodyToCheck.some(segment => segment.x === head.x && segment.y === head.y)) {
      stopSnake('¡La serpiente se chocó! Inténtalo otra vez.');
      return;
    }
    snake.unshift(head);

    if (ateFood && eatenFood.letter === target) {
      playSound('correct');
      foodEaten++;
      document.getElementById('snake-score').innerText = `Aciertos: ${foodEaten}/5`;
      document.getElementById('snake-message').innerText = `¡Encontraste ${target}!`;
      owlSpeak(`¡Muy bien! Encontraste la letra ${target}.`);
      if (foodEaten >= 5) {
        completeArcadeLevel(stage, 'snake', level, '¡Meta alcanzada!');
        return;
      }
      foods[foodIndex] = {...randomCell(), letter: target};
    } else if (ateFood) {
      playSound('wrong');
      snake.pop();
      document.getElementById('snake-message').innerText = `Esa es ${eatenFood.letter}. Busca ${target}.`;
      owlSpeak(`Esa es ${eatenFood.letter}. Busca la letra ${target}.`);
      foods[foodIndex] = {...randomCell(), letter: distractors[Math.floor(Math.random() * distractors.length)]};
    } else {
      snake.pop();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    obstacles.forEach(block => {
      ctx.fillStyle = '#64748b';
      ctx.fillRect(block.x * 16, block.y * 16, 15, 15);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(block.x * 16 + 5, block.y * 16 + 5, 5, 5);
    });
    foods.forEach(food => {
      ctx.fillStyle = food.letter === target ? '#f59e0b' : '#f472b6';
      ctx.fillRect(food.x * 16, food.y * 16, 15, 15);
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 12px Nunito';
      ctx.fillText(food.letter, food.x * 16 + 1, food.y * 16 + 12);
    });

    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#10b981' : '#34d399';
      ctx.fillRect(seg.x * 16, seg.y * 16, 15, 15);
    });
    activeGameLoop = requestAnimationFrame(() => setTimeout(update, speed));
  }
  update();
}

// 2. Ninja de Globos
function runNinjaGame(stage, level) {
  const choices = arcadeContent.randomLetters(level, 4);
  const target = arcadeContent.choose(choices);
  const distractors = choices.filter(letter => letter !== target);
  stage.innerHTML = `
    <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
      <button onclick="renderArcadeHub()" class="bouncy bg-slate-800 text-purple-300 font-bold px-3 py-1 rounded-xl text-xs"><i class="fa-solid fa-arrow-left"></i> Volver</button>
      <h4 class="text-rose-400 font-black font-fredoka">Ninja de Globos (Nivel ${level})</h4>
      <span id="ninja-score" class="text-xs font-bold text-amber-300 font-fredoka">Aciertos: 0/5</span>
    </div>
    <p class="text-center text-amber-200 font-black font-fredoka mb-2">Revienta solo los globos con la letra <span class="text-3xl text-white">${target}</span></p>
    <div id="ninja-area" class="relative flex-grow bg-slate-950 rounded-2xl overflow-hidden min-h-[320px]"></div>
  `;
  const area = document.getElementById('ninja-area');
  let popped = 0, balloonsSpawned = 0;
  owlSpeak(`Nivel ${level}. Revienta solo los globos con la letra ${target}.`);

  const interval = setInterval(() => {
    if (!document.getElementById('ninja-area')) return clearInterval(interval);
    const b = document.createElement('button');
    const txt = balloonsSpawned++ % 2 === 0
      ? target
      : arcadeContent.choose(distractors);
    b.className = "absolute bouncy px-4 py-3 rounded-2xl bg-gradient-to-t from-rose-500 to-pink-400 border-2 border-white text-white font-black text-sm shadow-lg font-fredoka";
    b.style.left = `${Math.random() * 70 + 10}%`;
    b.style.bottom = '-50px';
    b.innerText = txt;

    let pos = -50;
    const spd = level === 1 ? 1 : level === 2 ? 1.8 : 2.5;

    function move() {
      pos += spd;
      b.style.bottom = `${pos}px`;
      if (pos > 340) b.remove();
      else if (b.parentNode) requestAnimationFrame(move);
    }
    b.onclick = () => {
      if (txt === target) {
        playSound('pop');
        popped++;
        document.getElementById('ninja-score').innerText = `Aciertos: ${popped}/5`;
        owlSpeak(`¡Correcto! ${popped} de 5.`);
      } else {
        playSound('wrong');
        owlSpeak(`Ese globo tiene ${txt}. Busca ${target}.`);
      }
      b.remove();
      if (popped >= 5) {
        clearInterval(interval);
        completeArcadeLevel(stage, 'ninja', level, '¡Reto de globos completado!');
      }
    };
    area.appendChild(b);
    requestAnimationFrame(move);
  }, level === 1 ? 1500 : level === 2 ? 1100 : 800);
  activeGameIntervals.push(interval);
}

// 3. Burbujas Parlantes
function runBubblesGame(stage, level) {
  const list = arcadeContent.randomLetters(level, 5);
  const target = arcadeContent.choose(list);
  stage.innerHTML = `
    <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
      <button onclick="renderArcadeHub()" class="bouncy bg-slate-800 text-purple-300 font-bold px-3 py-1 rounded-xl text-xs"><i class="fa-solid fa-arrow-left"></i> Volver</button>
      <h4 class="text-sky-300 font-black font-fredoka">Burbujas Parlantes (Nivel ${level})</h4>
    </div>
    <p class="text-center text-amber-200 font-black font-fredoka mb-2">Toca la burbuja con la letra <span class="text-3xl text-white">${target}</span></p>
    <div id="bubbles-area" class="relative flex-grow bg-slate-950 rounded-2xl p-4 flex flex-wrap items-center justify-around gap-4 min-h-[320px]"></div>
  `;
  const area = document.getElementById('bubbles-area');
  owlSpeak(`Nivel ${level}. Encuentra y toca la letra ${target}.`);

  list.forEach(v => {
    const btn = document.createElement('button');
    btn.className = "bouncy px-5 py-4 bg-gradient-to-tr from-cyan-500 to-blue-400 rounded-2xl border-4 border-white/80 text-white font-black text-lg font-fredoka shadow-lg animate-pulse";
    btn.innerText = v;
    btn.onclick = () => {
      if (v === target) {
        area.querySelectorAll('button').forEach(bubble => { bubble.disabled = true; });
        completeArcadeLevel(stage, 'bubbles', level, `¡Encontraste la letra ${target}!`);
        return;
      }
      btn.disabled = true;
      playSound('wrong');
      owlSpeak(`Esa es ${v}. Busca la letra ${target}.`);
    };
    area.appendChild(btn);
  });
}

// 4. Tren de Sílabas
function runTrainGame(stage, level) {
  const syllables = arcadeContent.randomSyllableWord(level);
  const targetWord = syllables.join('');
  stage.innerHTML = `
    <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
      <button onclick="renderArcadeHub()" class="bouncy bg-slate-800 text-purple-300 font-bold px-3 py-1 rounded-xl text-xs"><i class="fa-solid fa-arrow-left"></i> Volver</button>
      <h4 class="text-amber-300 font-black font-fredoka">Tren de Sílabas (Nivel ${level})</h4>
    </div>
    <div class="text-center my-2 text-amber-200 text-sm font-bold font-fredoka">Forma la palabra: ${targetWord}</div>
    <div class="bg-amber-950/60 p-4 rounded-2xl flex flex-wrap items-center justify-center gap-3 border-2 border-amber-600/50 min-h-[100px]">
      <div class="text-4xl">🚂</div>
      ${syllables.map((_, index) => `<div id="w-${index}" class="w-14 h-14 bg-slate-800 border-2 border-dashed border-amber-400 rounded-xl flex items-center justify-center text-white font-black text-lg font-fredoka">?</div>`).join('')}
    </div>
    <p id="train-message" class="text-center text-sm text-amber-200 font-bold mt-3">Forma ${targetWord} en el orden correcto.</p>
    <div class="flex flex-wrap justify-center gap-3 mt-4" id="train-options"></div>
  `;
  let formed = [];
  owlSpeak(`Nivel ${level}: Arma la palabra ${targetWord}`);

  const optContainer = document.getElementById('train-options');
  arcadeContent.sample(syllables).forEach(syl => {
    const b = document.createElement('button');
    b.className = "bouncy bg-amber-500 text-purple-950 font-black text-xl px-5 py-3 rounded-2xl font-fredoka shadow-lg";
    b.innerText = syl;
    b.onclick = () => {
      if (formed.length >= syllables.length) return;
      if (syl !== syllables[formed.length]) {
        playSound('wrong');
        document.getElementById('train-message').innerText = `Esa sílaba es ${syl}. Busca ${syllables[formed.length]}.`;
        owlSpeak(`Busca la sílaba ${syllables[formed.length]}.`);
        return;
      }

      playSound('pop');
      owlSpeak(syl);
      formed.push(syl);
      b.disabled = true;
      const slot = document.getElementById(`w-${formed.length - 1}`);
      slot.innerText = syl;
      slot.className = 'w-14 h-14 bg-amber-500 border-2 border-white rounded-xl flex items-center justify-center text-purple-950 font-black text-lg font-fredoka shadow-lg';

      if (formed.length === syllables.length) {
        playSound('correct');
        owlSpeak(`¡Excelente! Has formado ${targetWord}`);
        triggerConfetti();
        completeArcadeLevel(stage, 'train', level, '¡Palabra correcta!');
      } else {
        document.getElementById('train-message').innerText = `Muy bien. Busca ${syllables[formed.length]}.`;
      }
    };
    optContainer.appendChild(b);
  });
}

// 5. Lluvia de Letras
function runRainGame(stage, level) {
  stage.innerHTML = `
    <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
      <button onclick="renderArcadeHub()" class="bouncy bg-slate-800 text-purple-300 font-bold px-3 py-1 rounded-xl text-xs"><i class="fa-solid fa-arrow-left"></i> Volver</button>
      <h4 class="text-indigo-300 font-black font-fredoka">Lluvia de Letras (Nivel ${level})</h4>
      <span id="rain-score" class="text-xs font-bold text-amber-300 font-fredoka">Puntos: 0</span>
    </div>
    <div id="rain-area" class="relative flex-grow bg-slate-950 rounded-2xl overflow-hidden min-h-[260px]">
      <div id="basket" class="absolute bottom-2 flex items-center justify-center text-3xl rounded-lg border-2 border-amber-300 bg-amber-900/70" style="width:64px;height:48px;left:50%;transform:translateX(-50%)">🧺</div>
    </div>
    <div class="flex justify-center gap-8 mt-3">
      <button onclick="moveBasket(-48)" class="bouncy bg-indigo-600 text-white font-black px-6 py-2 rounded-2xl text-lg"><i class="fa-solid fa-arrow-left"></i></button>
      <button onclick="moveBasket(48)" class="bouncy bg-indigo-600 text-white font-black px-6 py-2 rounded-2xl text-lg"><i class="fa-solid fa-arrow-right"></i></button>
    </div>
  `;
  const area = document.getElementById('rain-area');
  const basket = document.getElementById('basket');
  let basketX = Math.max(0, (area.clientWidth - basket.offsetWidth) / 2), score = 0, gameWon = false;
  basket.style.left = `${basketX}px`;
  basket.style.transform = 'none';
  owlSpeak(`Nivel ${level}: Mueve la cesta para atrapar lo que cae.`);
  window.moveBasket = (distance) => {
    basketX = Math.max(0, Math.min(area.clientWidth - basket.offsetWidth, basketX + distance));
    basket.style.left = `${basketX}px`;
  };

  const interval = setInterval(() => {
    if (!document.getElementById('rain-area') || gameWon) return clearInterval(interval);
    const drop = document.createElement('div');
    const item = arcadeContent.randomRainTarget(level);
    drop.className = "absolute flex items-center justify-center text-lg font-black text-yellow-300 font-fredoka";
    drop.style.minWidth = `${Math.max(34, item.length * 12)}px`;
    drop.style.height = '32px';
    drop.style.left = '0px'; drop.style.top = '0px'; drop.innerText = item;
    area.appendChild(drop);
    const dropWidth = drop.offsetWidth;
    drop.style.left = `${Math.random() * Math.max(0, area.clientWidth - dropWidth)}px`;

    let top = 0;
    function fall() {
      if (gameWon || !drop.isConnected || !basket.isConnected) return;
      top += level === 1 ? 2 : level === 2 ? 3 : 4;
      drop.style.top = `${top}px`;
      const dropRect = drop.getBoundingClientRect();
      const basketRect = basket.getBoundingClientRect();
      const horizontalOverlap = dropRect.left < basketRect.right && dropRect.right > basketRect.left;
      const verticalOverlap = dropRect.bottom >= basketRect.top && dropRect.top <= basketRect.bottom;
      if (horizontalOverlap && verticalOverlap) {
        drop.remove();
        if (!gameWon) {
          playSound('correct');
          owlSpeak(item);
          score += 50;
          document.getElementById('rain-score').innerText = `Puntos: ${score}`;
          if (score >= 250) {
            gameWon = true;
            clearInterval(interval);
            completeArcadeLevel(stage, 'rain', level, '¡Atrapaste cinco letras!');
          }
        }
      } else if (top >= area.clientHeight) drop.remove();
      else requestAnimationFrame(fall);
    }
    requestAnimationFrame(fall);
  }, level === 1 ? 1600 : level === 2 ? 1200 : 900);
  activeGameIntervals.push(interval);
}

// 6. Torre de Bloques
function runStackerGame(stage, level) {
  const syllables = arcadeContent.randomSyllableWord(level);
  const targetWord = syllables.join('');
  stage.innerHTML = `
    <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
      <button onclick="renderArcadeHub()" class="bouncy bg-slate-800 text-purple-300 font-bold px-3 py-1 rounded-xl text-xs"><i class="fa-solid fa-arrow-left"></i> Volver</button>
      <h4 class="text-purple-300 font-black font-fredoka">Torre de Bloques (Nivel ${level})</h4>
    </div>
    <p class="text-center text-amber-200 font-bold mt-2">Construye ${targetWord} con sus sílabas en orden.</p>
    <p id="stack-message" class="text-center text-xs text-purple-200 font-bold mt-2">Primera sílaba: ${syllables[0]}</p>
    <div id="stack-tower-area" class="flex-grow bg-slate-950 rounded-2xl p-4 flex flex-col-reverse items-center justify-start gap-2 overflow-y-auto max-h-[260px]">
      <div class="w-48 h-10 bg-amber-700 text-amber-200 font-black flex items-center justify-center rounded-lg text-xs font-fredoka">🏗️ BASE</div>
    </div>
    <div class="flex flex-wrap justify-center gap-3 mt-3">
      ${arcadeContent.sample(syllables).map(syllable => `<button onclick="addBlock('${syllable}')" class="stack-block-btn bouncy bg-purple-600 text-white font-black px-4 py-2 rounded-xl font-fredoka">${syllable}</button>`).join('')}
    </div>
  `;
  let blocks = 0;
  owlSpeak(`Nivel ${level}: Construye ${targetWord} en orden`);
  window.addBlock = (s) => {
    if (blocks >= syllables.length) return;
    if (s !== syllables[blocks]) {
      playSound('wrong');
      document.getElementById('stack-message').innerText = `Busca ${syllables[blocks]}.`;
      owlSpeak(`Busca la sílaba ${syllables[blocks]}.`);
      return;
    }
    playSound('pop'); owlSpeak(s); blocks++;
    const button = [...stage.querySelectorAll('.stack-block-btn')].find(option => option.innerText === s && !option.disabled);
    if (button) button.disabled = true;
    const t = document.getElementById('stack-tower-area');
    const b = document.createElement('div');
    b.className = "w-44 h-10 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-base flex items-center justify-center rounded-xl border border-white font-fredoka flex-shrink-0";
    b.innerText = s;
    t.appendChild(b);
    if (blocks === syllables.length) {
      stage.querySelectorAll('.stack-block-btn').forEach(button => { button.disabled = true; });
      completeArcadeLevel(stage, 'stacker', level, `¡Formaste ${targetWord}!`);
    } else document.getElementById('stack-message').innerText = `Siguiente sílaba: ${syllables[blocks]}`;
  };
}

// 7. El Pincel Mágico
function runPaintGame(stage, level) {
  const target = arcadeContent.randomLetter(level);
  stage.innerHTML = `
    <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
      <button onclick="renderArcadeHub()" class="bouncy bg-slate-800 text-purple-300 font-bold px-3 py-1 rounded-xl text-xs"><i class="fa-solid fa-arrow-left"></i> Volver</button>
      <h4 class="text-pink-300 font-black font-fredoka">El Pincel Mágico (Nivel ${level})</h4>
      <button onclick="clearPaintCanvas()" class="bg-rose-600 text-white px-3 py-1 rounded-xl text-xs font-bold">Limpiar</button>
    </div>
    <p class="text-center text-amber-200 font-black font-fredoka mt-3">Escribe la letra <span class="text-4xl text-white">${target}</span> siguiendo el modelo.</p>
    <div class="relative flex-grow flex items-center justify-center py-3">
      <div id="paint-canvas-frame" class="relative w-full max-w-xl aspect-[16/9] rounded-2xl border-2 border-pink-500/50 bg-slate-950 shadow-inner overflow-hidden">
        <span class="absolute inset-0 flex items-center justify-center text-[170px] leading-none font-black font-fredoka text-slate-700/50 pointer-events-none select-none">${target}</span>
        <canvas id="paint-canvas" width="480" height="270" aria-label="Área para escribir la letra ${target}" class="absolute inset-0 w-full h-full cursor-crosshair touch-none"></canvas>
      </div>
    </div>
    <button id="paint-finish" disabled onclick="completePaintPractice()" class="bouncy bg-amber-500 disabled:opacity-40 text-slate-950 font-black px-5 py-2 rounded-xl text-xs font-fredoka mx-auto mt-3">Terminé mi trazo</button>
  `;
  const canvas = document.getElementById('paint-canvas');
  const ctx = canvas.getContext('2d');
  let drawing = false, drawingDistance = 0, lastPoint = null;
  owlSpeak(`Nivel ${level}. Escribe la letra ${target} siguiendo el modelo.`);
  window.clearPaintCanvas = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingDistance = 0;
    lastPoint = null;
    document.getElementById('paint-finish').disabled = true;
  };
  window.completePaintPractice = () => {
    if (drawingDistance >= 60) completeArcadeLevel(stage, 'paint', level, `¡Escribiste ${target}!`);
  };
  canvas.onpointerdown = (e) => {
    drawing = true;
    canvas.setPointerCapture(e.pointerId);
    ctx.beginPath();
    const r = canvas.getBoundingClientRect();
    lastPoint = {x: (e.clientX - r.left) * canvas.width / r.width, y: (e.clientY - r.top) * canvas.height / r.height};
    ctx.moveTo(lastPoint.x, lastPoint.y);
  };
  canvas.onpointermove = (e) => {
    if (!drawing) return;
    const r = canvas.getBoundingClientRect();
    const point = {x: (e.clientX - r.left) * canvas.width / r.width, y: (e.clientY - r.top) * canvas.height / r.height};
    ctx.lineTo(point.x, point.y);
    ctx.strokeStyle = '#FD79A8'; ctx.lineWidth = level * 3; ctx.lineCap = 'round'; ctx.stroke();
    drawingDistance += Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y);
    lastPoint = point;
    document.getElementById('paint-finish').disabled = drawingDistance < 60;
  };
  canvas.onpointerup = canvas.onpointercancel = () => { drawing = false; };
}

// 8. Memoria Sonora
function runMemoryGame(stage, level) {
  stage.innerHTML = `
    <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
      <button onclick="renderArcadeHub()" class="bouncy bg-slate-800 text-purple-300 font-bold px-3 py-1 rounded-xl text-xs"><i class="fa-solid fa-arrow-left"></i> Volver</button>
      <h4 class="text-amber-300 font-black font-fredoka">Memoria Sonora (Nivel ${level})</h4>
    </div>
    <div id="arcade-memory-grid" class="grid grid-cols-2 sm:grid-cols-4 gap-2 my-auto w-full max-w-lg mx-auto"></div>
  `;
  const cards = arcadeContent.randomMemoryCards(level);
  const grid = document.getElementById('arcade-memory-grid');
  let flipped = [], matchedPairs = 0;
  owlSpeak(`Nivel ${level}: Encuentra las parejas sonoras`);

  cards.forEach(val => {
    const card = document.createElement('button');
    card.className = "arcade-memory-card bouncy bg-amber-500 rounded-2xl border-2 border-amber-300 font-black text-transparent shadow-md flex items-center justify-center font-fredoka";
    card.innerText = val;
    card.onclick = () => {
      if (flipped.length < 2 && !card.classList.contains('is-revealed')) {
        owlSpeak(val);
        card.classList.remove('bg-amber-500', 'text-transparent', 'border-amber-300');
        card.classList.add('is-revealed', 'bg-white', 'text-purple-950', 'border-4', 'border-purple-500');
        flipped.push({ card, val });
        if (flipped.length === 2) {
          if (flipped[0].val === flipped[1].val) {
            playSound('correct');
            flipped.forEach(item => { item.card.disabled = true; });
            matchedPairs++;
            flipped = [];
            if (matchedPairs === cards.length / 2) completeArcadeLevel(stage, 'memory', level, '¡Encontraste todas las parejas!');
          }
          else {
            playSound('wrong');
            setTimeout(() => {
              flipped.forEach(item => {
                item.card.classList.remove('is-revealed', 'bg-white', 'text-purple-950', 'border-4', 'border-purple-500');
                item.card.classList.add('bg-amber-500', 'text-transparent', 'border-2', 'border-amber-300');
              });
              flipped = [];
            }, 800);
          }
        }
      }
    };
    grid.appendChild(card);
  });
}

// 9. Carrera de Sílabas (Runner)
function runRunnerGame(stage, level) {
  const syllables = arcadeContent.randomSyllables(level, 3);
  stage.innerHTML = `
    <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
      <button onclick="renderArcadeHub()" class="bouncy bg-slate-800 text-purple-300 font-bold px-3 py-1 rounded-xl text-xs"><i class="fa-solid fa-arrow-left"></i> Volver</button>
      <h4 class="text-emerald-300 font-black font-fredoka">Carrera de Sílabas (Nivel ${level})</h4>
      <span id="runner-score" class="text-xs font-bold text-amber-300">0/5</span>
    </div>
    <p class="text-center text-amber-200 font-bold mb-2">Salta para recoger sílabas: ${syllables.join(' · ')}. Evita los barriles.</p>
    <div id="runner-area" class="relative flex-grow bg-slate-950 rounded-2xl h-48 overflow-hidden border-b-4 border-emerald-500">
      <div id="runner-player" class="absolute bottom-3 right-8 text-4xl leading-none">🏃</div>
      <div id="runner-obstacle" class="absolute bottom-3 text-3xl leading-none">🛢️</div>
      <div id="runner-syllable" class="absolute bottom-3 min-w-12 h-10 px-2 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center">${syllables[0]}</div>
    </div>
    <div class="flex justify-center gap-4 mt-3">
      <button onclick="runnerJump()" class="bouncy bg-emerald-500 text-white font-black text-lg px-8 py-2 rounded-2xl font-fredoka">¡SALTAR!</button>
    </div>
  `;
  const area = document.getElementById('runner-area');
  const player = document.getElementById('runner-player');
  const obs = document.getElementById('runner-obstacle');
  const syllableNode = document.getElementById('runner-syllable');
  const speed = level === 1 ? 3 : level === 2 ? 4 : 5;
  const objectGap = 220;
  let isJumping = false, obstacleX = -80, syllableX = obstacleX - objectGap;
  let collected = 0, lastTime = 0, gameWon = false, obstacleCleared = false;
  let jumpUntil = 0, jumpTimer = null;
  owlSpeak(`Nivel ${level}. Salta para recoger las sílabas ${syllables.join(', ')} y evita los barriles.`);

  function holdJumpFor(duration) {
    jumpUntil = Math.max(jumpUntil, performance.now() + duration);
    isJumping = true;
    player.style.transform = 'translateY(-65px)';
    if (jumpTimer !== null) clearTimeout(jumpTimer);

    const finishJump = () => {
      const remaining = jumpUntil - performance.now();
      if (remaining > 0) {
        jumpTimer = setTimeout(finishJump, remaining);
        return;
      }
      isJumping = false;
      jumpTimer = null;
      player.style.transform = 'translateY(0px)';
    };
    jumpTimer = setTimeout(finishJump, jumpUntil - performance.now());
  }

  window.runnerJump = () => {
    if (isJumping || gameWon) return;
    holdJumpFor(900);
  };

  function loopRunner(timestamp) {
    if (!area.isConnected || gameWon) return;
    const elapsed = lastTime ? Math.min(timestamp - lastTime, 32) : 16;
    lastTime = timestamp;
    obstacleX += speed * elapsed / 16;
    syllableX = obstacleX - objectGap;
    if (syllableX > area.clientWidth + 60) {
      obstacleX = -80;
      syllableX = obstacleX - objectGap;
      obstacleCleared = false;
    }
    obs.style.left = `${obstacleX}px`;
    syllableNode.style.left = `${syllableX}px`;

    const playerLeft = player.offsetLeft;
    const playerRight = playerLeft + player.offsetWidth;
    const obstacleNear = obstacleX <= playerRight && obstacleX + obs.offsetWidth >= playerLeft;
    const syllableNear = syllableX <= playerRight && syllableX + syllableNode.offsetWidth >= playerLeft;

    if (obstacleNear && !obstacleCleared) {
      if (isJumping) {
        obstacleCleared = true;
        holdJumpFor(Math.ceil(objectGap / speed * 16) + 250);
      } else {
        collected = 0;
        document.getElementById('runner-score').innerText = '0/5 · ¡Salta los barriles!';
        obstacleX = -80;
        syllableX = obstacleX - objectGap;
        owlSpeak('¡Cuidado con el barril! Prueba a saltar.');
      }
    }
    if (syllableNear) {
      if (isJumping && obstacleCleared) {
        collected++;
        document.getElementById('runner-score').innerText = `${collected}/5`;
        playSound('correct');
        owlSpeak(`¡Recogiste ${syllables[(collected - 1) % syllables.length]}!`);
        syllableNode.innerText = syllables[collected % syllables.length];
        obstacleX = -80;
        syllableX = obstacleX - objectGap;
        obstacleCleared = false;
        if (collected >= 5) {
          gameWon = true;
          completeArcadeLevel(stage, 'runner', level, '¡Recogiste cinco sílabas!');
          return;
        }
      } else {
        obstacleX = -80;
        syllableX = obstacleX - objectGap;
        obstacleCleared = false;
      }
    }
    activeGameLoop = requestAnimationFrame(loopRunner);
  }
  activeGameLoop = requestAnimationFrame(loopRunner);
}

// 10. Pesca de Vocales y Sílabas
function runFishingGame(stage, level) {
  const fish = arcadeContent.randomLetters(level, 5);
  const target = arcadeContent.choose(fish);
  stage.innerHTML = `
    <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
      <button onclick="renderArcadeHub()" class="bouncy bg-slate-800 text-purple-300 font-bold px-3 py-1 rounded-xl text-xs"><i class="fa-solid fa-arrow-left"></i> Volver</button>
      <h4 class="text-sky-300 font-black font-fredoka">Pesca Lectora (Nivel ${level})</h4>
    </div>
    <div class="text-center text-xs text-yellow-200 font-bold font-fredoka mb-2">Pesca el pez con la letra: <span class="text-3xl">${target}</span></div>
    <div id="fish-area" class="relative flex-grow bg-blue-950 rounded-2xl p-4 flex flex-wrap items-center justify-around gap-4 min-h-[220px]">
      ${fish.map(v => `
        <button onclick="catchFish('${v}', '${target}', this)" class="bouncy px-4 py-3 bg-blue-600 border-2 border-cyan-300 rounded-2xl text-white font-black text-sm flex items-center gap-2 font-fredoka shadow-lg">
          <span>🐟</span><span>${v}</span>
        </button>
      `).join('')}
    </div>
  `;
  owlSpeak(`Nivel ${level}. Pesca la letra ${target}.`);

  window.catchFish = (v, target, btn) => {
    if (v === target) {
      playSound('correct');
      btn.className = "bouncy px-4 py-3 bg-green-600 border-2 border-white rounded-2xl text-white font-black text-sm flex items-center gap-2 font-fredoka shadow-lg animate-bounce";
      owlSpeak(`¡Correcto! Pescaste la letra ${target}.`);
      btn.disabled = true;
      completeArcadeLevel(stage, 'fishing', level, '¡Pescaste la respuesta correcta!');
    } else {
      playSound('wrong');
      owlSpeak(`Ese pez tiene ${v}. Busca ${target}.`);
    }
  };
}

/* INICIALIZACIÓN */
window.onload = function() {
  const identifier = document.getElementById('auth-identifier');
  const name = document.getElementById('auth-name');
  const password = document.getElementById('auth-password');
  const resetPassword = document.getElementById('reset-password');
  identifier.addEventListener('input', validateAuthFields);
  identifier.addEventListener('blur', validateAuthFields);
  name.addEventListener('input', () => {
    if (authMode === 'register') validateRegistrationFields();
  });
  password.addEventListener('input', () => {
    if (authMode === 'register') validateRegistrationFields();
  });
  resetPassword.addEventListener('input', () => validatePasswordInput(resetPassword));
  initializeAuthentication();
  if (new URLSearchParams(window.location.search).has('token')) {
    document.getElementById('reset-password-modal').classList.remove('hidden');
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
};

let trailResizeFrame = null;
window.addEventListener('resize', () => {
  if (trailResizeFrame !== null) return;
  trailResizeFrame = requestAnimationFrame(() => {
    trailResizeFrame = null;
    drawTrailPath();
  });
});