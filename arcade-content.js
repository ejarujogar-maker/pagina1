(function (root) {
  const lettersByLevel = {
    1: ['A', 'E', 'I', 'O', 'U'],
    2: ['M', 'P', 'L', 'N', 'T', 'B', 'D', 'F'],
    3: ['S', 'R', 'C', 'G', 'J', 'V', 'Z', 'Ñ']
  };
  const syllablesByLevel = {
    1: ['MA', 'ME', 'MI', 'MO', 'MU', 'PA', 'PE', 'PI', 'PO', 'PU'],
    2: ['CA', 'CE', 'CI', 'CO', 'CU', 'LA', 'LE', 'LI', 'LO', 'LU', 'SA', 'SE', 'SI', 'SO', 'SU'],
    3: ['BRA', 'BRE', 'BRI', 'BRO', 'BRU', 'PLA', 'PLE', 'PLI', 'PLO', 'PLU', 'TRA', 'TRE', 'TRI', 'TRO', 'TRU']
  };
  const wordSyllablesByLevel = {
    1: [['CA', 'SA'], ['ME', 'SA'], ['PA', 'TO'], ['LU', 'NA'], ['PE', 'LO', 'TA'], ['MA', 'NO']],
    2: [['MA', 'RI', 'PO', 'SA'], ['TE', 'LE', 'FO', 'NO'], ['CA', 'MI', 'SE', 'TA'], ['ES', 'TRE', 'LLA'], ['CO', 'NE', 'JO']],
    3: [['A', 'VEN', 'TU', 'RA'], ['CA', 'RA', 'ME', 'LO'], ['CO', 'CO', 'DRI', 'LO'], ['BI', 'CI', 'CLE', 'TA'], ['CHO', 'CO', 'LA', 'TE']]
  };
  const rainTargetsByLevel = {
    1: lettersByLevel[1],
    2: syllablesByLevel[2],
    3: ['SOL', 'LUNA', 'CASA', 'MESA', 'PATO', 'GATO', 'MANO', 'ROSA']
  };
  const memorySymbolsByLevel = {
    1: lettersByLevel[1],
    2: ['MA', 'PA', 'SOL', 'LUNA', 'CASA', 'MESA', 'PATO', 'GATO', 'MANO', 'ROSA'],
    3: ['ELEFANTE', 'MARIPOSA', 'CARAMELO', 'AVENTURA', 'COCODRILO', 'ESTRELLA', 'BICICLETA', 'CHOCOLATE']
  };

  function poolForLevel(pools, level) {
    const pool = pools[level];
    if (!pool) throw new RangeError(`Nivel de minijuego no válido: ${level}`);
    return pool;
  }

  function choose(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new TypeError('Se necesita una lista con al menos una opción.');
    }
    return items[Math.floor(Math.random() * items.length)];
  }

  function sample(items, count = items.length) {
    if (!Array.isArray(items) || !Number.isInteger(count) || count < 0 || count > items.length) {
      throw new RangeError('La cantidad debe estar entre cero y el tamaño de la lista.');
    }
    const shuffled = [...items];
    for (let index = 0; index < count; index++) {
      const swapIndex = index + Math.floor(Math.random() * (shuffled.length - index));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled.slice(0, count);
  }

  const content = {
    randomLetter(level) {
      return choose(poolForLevel(lettersByLevel, level));
    },
    randomLetters(level, count) {
      return sample(poolForLevel(lettersByLevel, level), count);
    },
    randomSyllableWord(level) {
      return [...choose(poolForLevel(wordSyllablesByLevel, level))];
    },
    randomSyllables(level, count) {
      return sample(poolForLevel(syllablesByLevel, level), count);
    },
    randomRainTarget(level) {
      return choose(poolForLevel(rainTargetsByLevel, level));
    },
    randomMemoryCards(level) {
      const symbols = sample(poolForLevel(memorySymbolsByLevel, level), 4);
      return sample([...symbols, ...symbols]);
    },
    choose,
    sample
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = content;
  else root.LecturaClubArcadeContent = content;
})(globalThis);
