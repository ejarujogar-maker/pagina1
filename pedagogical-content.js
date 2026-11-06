(function (root) {
  const letterPrerequisites = {
    Vocales: { A: 'l1', E: 'l2', I: 'l3', O: 'l4', U: 'l5' },
    Consonantes: {
      B: 'l6', C: 'l7', D: 'l8', F: 'l9', G: 'l10', H: 'l11', J: 'l12',
      K: 'l13', L: 'l14', M: 'l15', N: 'l16', Ñ: 'l17', P: 'l18',
      Q: 'l19', R: 'l20', S: 'l21', T: 'l22', V: 'l23', W: 'l24',
      X: 'l25', Y: 'l26', Z: 'l27'
    }
  };
  const syllablePrerequisites = {
    b1: ['MA', 'ME', 'MI', 'MO', 'MU'],
    b2: ['PA', 'PE', 'PI', 'PO', 'PU'],
    b3: ['LA', 'LE', 'LI', 'LO', 'LU'],
    b4: ['SA', 'SE', 'SI', 'SO', 'SU'],
    b5: ['TA', 'TE', 'TI', 'TO', 'TU'],
    b6: ['NA', 'NE', 'NI', 'NO', 'NU'],
    b7: ['DA', 'DE', 'DI', 'DO', 'DU'],
    b8: ['CA', 'CO', 'CU'],
    b9: ['CA', 'QUE', 'QUI', 'CO', 'CU'],
    b10: ['BA', 'BE', 'BI', 'BO', 'BU'],
    b11: ['VA', 'VE', 'VI', 'VO', 'VU'],
    b12: ['RRA', 'RRE', 'RRI', 'RRO', 'RRU'],
    b13: ['RA', 'RE', 'RI', 'RO', 'RU'],
    b14: ['FA', 'FE', 'FI', 'FO', 'FU'],
    b15: ['JA', 'JE', 'JI', 'JO', 'JU', 'GE', 'GI'],
    b16: ['GA', 'GUE', 'GUI', 'GO', 'GU'],
    b17: ['ÑA', 'ÑE', 'ÑI', 'ÑO', 'ÑU'],
    b18: ['CHA', 'CHE', 'CHI', 'CHO', 'CHU'],
    b19: ['LLA', 'LLE', 'LLI', 'LLO', 'LLU'],
    b20: ['YA', 'YE', 'YI', 'YO', 'YU'],
    b21: ['ZA', 'CE', 'CI', 'ZO', 'ZU'],
    b22: ['HA', 'HE', 'HI', 'HO', 'HU'],
    b23: ['KA', 'KE', 'KI', 'KO', 'KU'],
    b24: ['BLA', 'BLE', 'BLI', 'BLO', 'BLU', 'PLA', 'PLE', 'PLI', 'PLO', 'PLU'],
    b25: ['FLA', 'FLE', 'FLI', 'FLO', 'FLU', 'CLA', 'CLE', 'CLI', 'CLO', 'CLU'],
    b26: ['GLA', 'GLE', 'GLI', 'GLO', 'GLU', 'PRA', 'PRE', 'PRI', 'PRO', 'PRU'],
    b27: ['BRA', 'BRE', 'BRI', 'BRO', 'BRU', 'CRA', 'CRE', 'CRI', 'CRO', 'CRU'],
    b28: ['FRA', 'FRE', 'FRI', 'FRO', 'FRU', 'TRA', 'TRE', 'TRI', 'TRO', 'TRU'],
    b29: ['DRA', 'DRE', 'DRI', 'DRO', 'DRU', 'GRA', 'GRE', 'GRI', 'GRO', 'GRU'],
    b30: ['AL', 'EL', 'IL', 'OL', 'UL'],
    b31: ['AN', 'EN', 'IN', 'ON', 'UN'],
    b32: ['AS', 'ES', 'IS', 'OS', 'US'],
    b33: ['XA', 'XE', 'XI', 'XO', 'XU'],
    b34: ['AR', 'ER', 'IR', 'OR', 'UR', 'AM', 'EM', 'IM', 'OM', 'UM'],
    b35: ['IA', 'IE', 'IO', 'IU', 'UA', 'UE', 'UI', 'UO'],
    b36: ['AY', 'EY', 'OY', 'UY']
  };

  function resolvePrerequisite(category, target) {
    const normalized = String(target || '').trim().toLocaleUpperCase('es');
    if (letterPrerequisites[category]?.[normalized]) return letterPrerequisites[category][normalized];
    if (category === 'Vocales' || category === 'Consonantes') return null;
    for (const [lessonId, syllables] of Object.entries(syllablePrerequisites)) {
      if (syllables.includes(normalized)) return lessonId;
    }
    return null;
  }

  const cumulativeLessons = [
    { id: 'c-ma', name: 'Oraciones con MA', target: 'MA', prerequisite: 'b1',
      sentences: ['Mi mamá mima a Mimo.', 'Mimo mira a mamá.'] },
    { id: 'c-pa', name: 'Oraciones con PA', target: 'PA', prerequisite: 'b2',
      sentences: ['Papá mira mi pipa.', 'Papá pasa mi mapa.'] },
    { id: 'c-la', name: 'Oraciones con LA', target: 'LA', prerequisite: 'b3',
      sentences: ['Lola lima la pala.', 'Lola lee la lupa.'] },
    { id: 'c-sa', name: 'Oraciones con SA', target: 'SA', prerequisite: 'b4',
      sentences: ['Susi sale sola.', 'Susi usa la sopa.'] },
    { id: 'c-ta', name: 'Oraciones con TA', target: 'TA', prerequisite: 'b5',
      sentences: ['Tomás salta la tapa.', 'Tomás tapa la moto.'] },
    { id: 'c-na', name: 'Oraciones con NA', target: 'NA', prerequisite: 'b6',
      sentences: ['Nina nada.', 'Nina ama la luna.'] },
    { id: 'c-da', name: 'Oraciones con DA', target: 'DA', prerequisite: 'b7',
      sentences: ['Dalia da el dado.', 'Dalia duda del dedo.'] },
    { id: 'c-ca', name: 'Oraciones con CA', target: 'CA', prerequisite: 'b8',
      sentences: ['Coco cuida la casa.', 'Mamá ama la casa.'] }
  ].map(lesson => ({ ...lesson, category: 'Lecturas', kind: 'cumulative' }));

  const reinforcementLessons = [
    { id: 'r-e', name: 'Refuerzo: vocal E', target: 'E', category: 'Vocales', prerequisite: 'l2',
      syllables: ['E'], words: [['estrella', '⭐'], ['elefante', '🐘'], ['erizo', '🦔']] },
    { id: 'r-q', name: 'Refuerzo: consonante Q', target: 'Q', category: 'Consonantes', prerequisite: 'l19',
      syllables: ['Q'], words: [['queso', '🧀'], ['quiosco', '🏬'], ['paquete', '📦']] },
    { id: 'r-c', name: 'Refuerzo: consonante C', target: 'C', category: 'Consonantes', prerequisite: 'l7',
      syllables: ['C'], words: [['casa', '🏠'], ['coco', '🥥'], ['cuna', '🛏️']] },
    { id: 'r-s', name: 'Refuerzo: consonante S', target: 'S', category: 'Consonantes', prerequisite: 'l21',
      syllables: ['S'], words: [['sapo', '🐸'], ['sopa', '🥣'], ['mesa', '🪑']] },
    { id: 'r-k', name: 'Refuerzo: consonante K', target: 'K', category: 'Consonantes', prerequisite: 'l13',
      syllables: ['K'], words: [['kilo', '⚖️'], ['kiwi', '🥝'], ['kiosco', '🏬']] },
    { id: 'r-ca-co-cu', name: 'Refuerzo: CA, CO y CU', target: 'CA', category: 'Sílabas', prerequisite: 'b8',
      syllables: ['CA', 'CO', 'CU'], words: [['casa', '🏠'], ['coco', '🥥'], ['cuna', '🛏️']] },
    { id: 'r-ce-ci', name: 'Refuerzo: CE y CI', target: 'CE', category: 'Sílabas', prerequisite: 'b21',
      syllables: ['CE', 'CI'], words: [['cena', '🍽️'], ['cine', '🎬'], ['cielo', '🌤️']] },
    { id: 'r-ga-go', name: 'Refuerzo: GA y GO', target: 'GA', category: 'Sílabas', prerequisite: 'b16',
      syllables: ['GA', 'GO'], words: [['gato', '🐈'], ['goma', '🧽'], ['gota', '💧']] },
    { id: 'r-gue-gui', name: 'Refuerzo: GUE y GUI', target: 'GUE', category: 'Sílabas', prerequisite: 'b16',
      syllables: ['GUE', 'GUI'], words: [['guerra', '🛡️'], ['guía', '🧭'], ['guitarra', '🎸']] },
    { id: 'r-ge-gi', name: 'Refuerzo: GE y GI', target: 'GE', category: 'Sílabas', prerequisite: 'b15',
      syllables: ['GE', 'GI'], words: [['gemelo', '👯'], ['genio', '🧞'], ['girasol', '🌻']] }
  ].map(lesson => ({ ...lesson, kind: 'reinforcement' }));

  const learningPathStages = [
    {
      id: 'vowels',
      lessonIds: ['l1', 'l2', 'l4', 'l3', 'l5', 'm1', 'r-e']
    },
    {
      id: 'direct-simple',
      lessonIds: [
        'l15', 'b1', 'c-ma', 'l18', 'b2', 'c-pa', 'l14', 'b3', 'c-la',
        'l21', 'b4', 'c-sa', 'r-s', 'm2'
      ]
    },
    {
      id: 'direct-intermediate',
      lessonIds: [
        'l22', 'b5', 'c-ta', 'l16', 'b6', 'c-na', 'l8', 'b7', 'c-da',
        'l6', 'b10', 'l23', 'b11', 'm3'
      ]
    },
    {
      id: 'direct-complex',
      lessonIds: [
        'l7', 'b8', 'c-ca', 'r-c', 'r-ca-co-cu', 'l13', 'b23', 'r-k', 'l19', 'b9',
        'r-q', 'l20', 'b13', 'b12', 'l27', 'b21', 'r-ce-ci', 'l9', 'b14',
        'l12', 'b15', 'r-ge-gi', 'l10', 'b16', 'r-ga-go', 'r-gue-gui', 'm4'
      ]
    },
    {
      id: 'other-syllables',
      lessonIds: [
        'l17', 'b17', 'l11', 'b22', 'l26', 'b20', 'l24', 'l25', 'b33',
        'b18', 'b19', 'm5'
      ]
    },
    {
      id: 'syllable-patterns',
      lessonIds: [
        'b30', 'b31', 'b32', 'b34', 'b35', 'b36',
        'b24', 'b25', 'b26', 'b27', 'b28', 'b29', 'm6'
      ]
    },
    {
      id: 'contextual-reading',
      lessonIds: Array.from({ length: 11 }, (_, index) => `b${index + 37}`)
    }
  ];
  const learningPathOrder = learningPathStages.flatMap(stage => stage.lessonIds);
  const guestAccessLimitLessonId = 'c-ma';
  const guestAccessLimitIndex = learningPathOrder.indexOf(guestAccessLimitLessonId);
  const guestAccessibleLessonIds = learningPathOrder.slice(0, guestAccessLimitIndex + 1);
  const isGuestLessonAccessible = lessonId => guestAccessibleLessonIds.includes(lessonId);

  const content = {
    letterPrerequisites,
    syllablePrerequisites,
    cumulativeLessons,
    reinforcementLessons,
    learningPathStages,
    learningPathOrder,
    guestAccessLimitLessonId,
    guestAccessibleLessonIds,
    isGuestLessonAccessible,
    supplementalLessonIds: [
      ...cumulativeLessons.map(lesson => lesson.id),
      ...reinforcementLessons.map(lesson => lesson.id)
    ],
    resolvePrerequisite
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = content;
  else root.LecturaClubPedagogicalContent = content;
})(globalThis);
