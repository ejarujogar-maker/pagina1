const crypto = require('node:crypto');
const dns = require('node:dns').promises;
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync, backup } = require('node:sqlite');
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
const port = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';
const databasePath = path.resolve(__dirname, process.env.DATABASE_PATH || 'registro.db');
const databaseBackupPath = path.resolve(path.dirname(databasePath),
  process.env.DATABASE_BACKUP_PATH || 'registro_dos.db');
if (databasePath === databaseBackupPath) {
  throw new Error('DATABASE_BACKUP_PATH debe apuntar a un archivo distinto de DATABASE_PATH.');
}
const baseUrl = process.env.BASE_URL?.replace(/\/+$/, '');
if (isProduction && (!baseUrl || !baseUrl.startsWith('https://'))) {
  throw new Error('En producción configura BASE_URL con la dirección HTTPS pública del servidor.');
}
if (isProduction && (!process.env.REQUEST_HASH_SECRET || process.env.REQUEST_HASH_SECRET.length < 32)) {
  throw new Error('En producción configura REQUEST_HASH_SECRET con al menos 32 caracteres aleatorios.');
}
const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;
const resetDurationMs = 30 * 60 * 1000;
const verificationDurationMs = 10 * 60 * 1000;
const attemptWindowMs = 15 * 60 * 1000;
const maxLoginAttempts = 5;
const maxVerificationCodeAttempts = 5;
const identifierPattern = /^[a-zA-Z0-9_.-]{4,30}$/;
const namePattern = /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validRoles = new Set(['alumno', 'profesor']);
const lessonSequence = [
  ...Array.from({ length: 5 }, (_, index) => `l${index + 1}`), 'm1',
  ...Array.from({ length: 5 }, (_, index) => `l${index + 6}`), 'm2',
  ...Array.from({ length: 5 }, (_, index) => `l${index + 11}`), 'm3',
  ...Array.from({ length: 5 }, (_, index) => `l${index + 16}`), 'm4',
  ...Array.from({ length: 5 }, (_, index) => `l${index + 21}`), 'm5',
  'l26', 'l27', 'm6',
  ...Array.from({ length: 47 }, (_, index) => `b${index + 1}`)
];
const arcadeGameIds = new Set(['snake', 'ninja', 'bubbles', 'train', 'rain', 'stacker', 'paint', 'memory', 'runner', 'fishing']);
const requestSecret = process.env.REQUEST_HASH_SECRET || 'lecturaclub-local-request-hash';

fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const db = new DatabaseSync(databasePath);
db.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    username TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('superadmin', 'profesor', 'alumno')),
    created_at INTEGER NOT NULL,
    email_verified_at INTEGER,
    deleted_at INTEGER,
    access_blocked_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS progress (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    xp INTEGER NOT NULL DEFAULT 0,
    completed_lessons TEXT NOT NULL DEFAULT '[]',
    completed_arcade_levels TEXT NOT NULL DEFAULT '[]',
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS lesson_results (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Vocales', 'Consonantes', 'Sílabas', 'Palabras')),
    attempts INTEGER NOT NULL DEFAULT 0,
    mistakes INTEGER NOT NULL DEFAULT 0,
    best_stars INTEGER NOT NULL DEFAULT 0,
    latest_stars INTEGER NOT NULL DEFAULT 0,
    first_stars INTEGER NOT NULL DEFAULT 0,
    retry_stars INTEGER NOT NULL DEFAULT 0,
    points INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, lesson_id)
  );
  CREATE TABLE IF NOT EXISTS custom_lessons (
    id TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL CHECK (category IN ('Vocales', 'Consonantes', 'Sílabas', 'Palabras')),
    subcategory TEXT NOT NULL DEFAULT '',
    target TEXT NOT NULL,
    words TEXT NOT NULL,
    emojis TEXT NOT NULL DEFAULT '[]',
    theme TEXT NOT NULL DEFAULT 'violet',
    word_filters TEXT NOT NULL DEFAULT '{}',
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS lesson_overrides (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    target TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL DEFAULT '',
    mouth TEXT NOT NULL DEFAULT '',
    examples TEXT NOT NULL DEFAULT '[]',
    syllables TEXT NOT NULL DEFAULT '[]',
    reading_text TEXT NOT NULL DEFAULT '',
    options TEXT NOT NULL DEFAULT '[]',
    word_filters TEXT NOT NULL DEFAULT '{}',
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS custom_games (
    id TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    game_type TEXT NOT NULL CHECK (game_type IN ('puzzle', 'pairs')),
    items TEXT NOT NULL,
    theme TEXT NOT NULL DEFAULT 'orange',
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS custom_game_results (
    game_id TEXT NOT NULL REFERENCES custom_games(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempts INTEGER NOT NULL DEFAULT 0,
    completed_at INTEGER,
    PRIMARY KEY (game_id, student_id)
  );
  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS email_verification_tokens (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS verification_requests (
    id INTEGER PRIMARY KEY,
    email_hash TEXT NOT NULL,
    ip_hash TEXT NOT NULL,
    requested_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS email_verification_attempts (
    id INTEGER PRIMARY KEY,
    email_hash TEXT NOT NULL,
    ip_hash TEXT NOT NULL,
    attempted_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS password_reset_requests (
    id INTEGER PRIMARY KEY,
    email_hash TEXT NOT NULL,
    ip_hash TEXT NOT NULL,
    requested_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY,
    identifier_hash TEXT NOT NULL,
    ip_hash TEXT NOT NULL,
    attempted_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
  CREATE INDEX IF NOT EXISTS reset_expiry_idx ON password_reset_tokens(expires_at);
  CREATE INDEX IF NOT EXISTS login_attempts_time_idx ON login_attempts(attempted_at);
  CREATE INDEX IF NOT EXISTS verification_attempts_time_idx ON email_verification_attempts(attempted_at);
`);

const userColumns = db.prepare('PRAGMA table_info(users)').all().map(column => column.name);
if (!userColumns.includes('email_verified_at')) {
  db.exec('ALTER TABLE users ADD COLUMN email_verified_at INTEGER');
  db.exec('UPDATE users SET email_verified_at = created_at WHERE email_verified_at IS NULL');
}
for (const [column, definition] of [
  ['deleted_at', 'INTEGER'],
  ['access_blocked_at', 'INTEGER']
]) {
  if (!userColumns.includes(column)) db.exec(`ALTER TABLE users ADD COLUMN ${column} ${definition}`);
}
const resultColumns = db.prepare('PRAGMA table_info(lesson_results)').all().map(column => column.name);
const resultNeedsStarsMigration = !resultColumns.includes('first_stars');
if (resultNeedsStarsMigration) db.exec('ALTER TABLE lesson_results ADD COLUMN first_stars INTEGER NOT NULL DEFAULT 0');
if (!resultColumns.includes('retry_stars')) db.exec('ALTER TABLE lesson_results ADD COLUMN retry_stars INTEGER NOT NULL DEFAULT 0');
if (resultNeedsStarsMigration) {
  db.exec('UPDATE lesson_results SET first_stars = latest_stars, retry_stars = MAX(0, points / 10 - latest_stars)');
}
const customLessonColumns = db.prepare('PRAGMA table_info(custom_lessons)').all().map(column => column.name);
if (!customLessonColumns.includes('emojis')) db.exec("ALTER TABLE custom_lessons ADD COLUMN emojis TEXT NOT NULL DEFAULT '[]'");
if (!customLessonColumns.includes('theme')) db.exec("ALTER TABLE custom_lessons ADD COLUMN theme TEXT NOT NULL DEFAULT 'violet'");
for (const [column, definition] of [
  ['description', "TEXT NOT NULL DEFAULT ''"],
  ['subcategory', "TEXT NOT NULL DEFAULT ''"],
  ['word_filters', "TEXT NOT NULL DEFAULT '{}'"]
]) {
  if (!customLessonColumns.includes(column)) db.exec(`ALTER TABLE custom_lessons ADD COLUMN ${column} ${definition}`);
}
if (!customLessonColumns.includes('map_position')) {
  db.exec('ALTER TABLE custom_lessons ADD COLUMN map_position INTEGER NOT NULL DEFAULT 0');
  const legacyLessons = db.prepare('SELECT id, student_id AS studentId FROM custom_lessons ORDER BY student_id, created_at, id').all();
  const setLegacyPosition = db.prepare('UPDATE custom_lessons SET map_position = ? WHERE id = ?');
  const studentLessonCounts = new Map();
  legacyLessons.forEach(lesson => {
    const studentIndex = studentLessonCounts.get(lesson.studentId) || 0;
    setLegacyPosition.run(lessonSequence.length + studentIndex, lesson.id);
    studentLessonCounts.set(lesson.studentId, studentIndex + 1);
  });
}
const customGameColumns = db.prepare('PRAGMA table_info(custom_games)').all().map(column => column.name);
if (!customGameColumns.includes('activity_type')) {
  db.exec("ALTER TABLE custom_games ADD COLUMN activity_type TEXT NOT NULL DEFAULT 'standard'");
}

// Configura el proxy y desactiva cabeceras de diagn?stico para la API.
app.set('trust proxy', process.env.TRUST_PROXY || 1);
// Oculta la firma del servidor para reducir informaci?n ?til a clientes externos.
app.disable('x-powered-by');
// A?ade cabeceras de seguridad a cada respuesta del servidor.
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  });
  if (isProduction && !req.secure) {
    return res.redirect(308, `${baseUrl}${req.originalUrl}`);
  }
  next();
});
let backupTimer = null;
let backupInProgress = null;
// Hace una copia de seguridad de la base de datos para conservar cambios recientes.
function scheduleDatabaseBackup() {
  clearTimeout(backupTimer);
  backupTimer = setTimeout(async () => {
    if (backupInProgress) return;
    backupInProgress = backup(db, databaseBackupPath);
    try {
      await backupInProgress;
    } catch (error) {
      console.error(`No se pudo actualizar la copia de seguridad ${databaseBackupPath}:`, error);
    } finally {
      backupInProgress = null;
    }
  }, 1000);
  backupTimer.unref?.();
}
// Dispara una copia de seguridad cuando una operaci?n de escritura termina con ?xito.
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) scheduleDatabaseBackup();
    });
  }
  next();
});
const backupInterval = setInterval(scheduleDatabaseBackup, 5 * 60 * 1000);
backupInterval.unref?.();
app.use(express.json({ limit: '16kb' }));
// Parsea la cabecera de cookies para que cada ruta vea la sesi?n del cliente.
app.use((req, res, next) => {
  req.cookies = Object.fromEntries((req.headers.cookie || '').split(';')
    .map(part => part.trim())
    .filter(Boolean)
    // Convierte cada cookie en un par clave/valor para el flujo de autenticaci?n.
    .map(part => {
      const separator = part.indexOf('=');
      return separator < 0 ? [part, ''] : [part.slice(0, separator), part.slice(separator + 1)];
    }));
  next();
});
// Rechaza solicitudes con origen cruzado cuando no coinciden con el host esperado.
app.use((req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (!origin) return next();
  let originHost;
  try {
    originHost = new URL(origin).host;
  } catch {
    return res.status(403).json({ error: 'Solicitud no permitida.' });
  }
  if (originHost !== req.get('host') || new URL(origin).origin !== `${req.protocol}://${req.get('host')}`) {
    return res.status(403).json({ error: 'Solicitud no permitida.' });
  }
  next();
});

// Genera un hash con sal para guardar contrase?as sin almacenarlas en texto plano.
function passwordHash(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return { hash: hash.toString('hex'), salt };
}

// Valida la complejidad m?nima de la contrase?a antes de aceptar la cuenta.
function passwordPolicyError(password) {
  if (password.length < 10 || password.length > 128 ||
      !/\p{Ll}/u.test(password) || !/\p{Lu}/u.test(password) ||
      !/\d/.test(password) || !/[^\p{L}\p{N}\s]/u.test(password)) {
    return 'La contraseña debe tener de 10 a 128 caracteres e incluir una mayúscula, una minúscula, un número y un carácter especial.';
  }
  return '';
}

// Calcula el hash SHA-256 del token para almacenarlo de forma segura en la base de datos.
function tokenDigest(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Genera un digest firmado con la clave del servidor para evitar manipulaciones.
function keyedDigest(value) {
  return crypto.createHmac('sha256', requestSecret).update(value).digest('hex');
}

// Reduce un usuario a la versi?n p?blica que la API comparte con el cliente.
function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    emailVerified: Boolean(user.email_verified_at)
  };
}

// Recupera el progreso acumulado y los resultados asociados de un alumno.
function readProgress(userId) {
  const record = db.prepare('SELECT xp, completed_lessons, completed_arcade_levels FROM progress WHERE user_id = ?').get(userId);
  return record ? {
    xp: record.xp,
    completedLessons: JSON.parse(record.completed_lessons),
    completedArcadeLevels: JSON.parse(record.completed_arcade_levels),
    lessonResults: readLessonResults(userId)
  } : { xp: 0, completedLessons: [], completedArcadeLevels: [], lessonResults: readLessonResults(userId) };
}

// Obtiene las m?tricas por lecci?n del estudiante para el panel o la app.
function readLessonResults(userId) {
  return db.prepare(`
    SELECT lesson_id AS lessonId, category, attempts, mistakes, best_stars AS bestStars,
      latest_stars AS latestStars, first_stars AS firstStars, retry_stars AS retryStars, points
    FROM lesson_results WHERE user_id = ?
  `).all(userId);
}

// Guarda el XP y el estado de lecciones completadas del usuario.
function writeProgress(userId, progress) {
  db.prepare(`
    INSERT INTO progress (user_id, xp, completed_lessons, completed_arcade_levels, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      xp = excluded.xp,
      completed_lessons = excluded.completed_lessons,
      completed_arcade_levels = excluded.completed_arcade_levels,
      updated_at = excluded.updated_at
  `).run(userId, progress.xp, JSON.stringify(progress.completedLessons),
    JSON.stringify(progress.completedArcadeLevels), Date.now());
}

// Corrige el formato heredado del progreso para que coincida con la secuencia actual.
function normalizeStoredProgress() {
  const records = db.prepare('SELECT user_id, completed_lessons, completed_arcade_levels FROM progress').all();
  for (const record of records) {
    const savedLessons = new Set(JSON.parse(record.completed_lessons));
    const savedArcadeLevels = new Set(JSON.parse(record.completed_arcade_levels));
    const completedLessons = lessonSequence.filter(lessonId => savedLessons.has(lessonId));
    const completedArcadeLevels = [];
    for (const gameId of arcadeGameIds) {
      for (let level = 1; level <= 3; level++) {
        const completionId = `${gameId}-${level}`;
        if (!savedArcadeLevels.has(completionId)) break;
        completedArcadeLevels.push(completionId);
      }
    }
    if (JSON.stringify(completedLessons) !== JSON.stringify([...savedLessons]) ||
        JSON.stringify(completedArcadeLevels) !== JSON.stringify([...savedArcadeLevels])) {
      db.prepare(`
        UPDATE progress SET completed_lessons = ?, completed_arcade_levels = ?, updated_at = ?
        WHERE user_id = ?
      `).run(JSON.stringify(completedLessons), JSON.stringify(completedArcadeLevels), Date.now(), record.user_id);
    }
  }
}

// Comprueba si un rol tiene permisos para gestionarlo todo del aula.
function hasFullAccess(role) {
  return role === 'profesor' || role === 'superadmin';
}

// Exige autenticaci?n y permisos de profesor o superadministrador.
function requireTeacherOrAdmin(req, res, next) {
  requireAuth(req, res, error => {
    if (error) return next(error);
    if (!hasFullAccess(req.user.role)) return res.status(403).json({ error: 'Solo el profesor o superadministrador puede realizar esta acción.' });
    next();
  });
}

// Clasifica una lecci?n seg?n la rama curricular a la que pertenece.
function lessonCategory(lessonId) {
  if (/^l[1-5]$/.test(lessonId)) return 'Vocales';
  if (/^l\d+$/.test(lessonId)) return 'Consonantes';
  if (/^m\d+$/.test(lessonId)) return Number(lessonId.slice(1)) === 1 ? 'Vocales' : 'Consonantes';
  const bookIndex = Number(lessonId.slice(1));
  if (lessonId.startsWith('b') && bookIndex >= 1 && bookIndex <= 36) return 'Sílabas';
  if (lessonId.startsWith('b') && bookIndex >= 37 && bookIndex <= 47) return 'Palabras';
  return null;
}

// Comprueba que los filtros de palabras solo usen claves y valores admitidos.
function isValidWordFilters(filters) {
  if (!filters || typeof filters !== 'object' || Array.isArray(filters)) return false;
  const allowed = {
    level: ['basic', 'intermediate', 'advanced'],
    syllables: ['any', 'one', 'two', 'three-plus'],
    targetPosition: ['any', 'start', 'middle', 'end'],
    structure: ['any', 'simple', 'complex', 'mixed']
  };
  return Object.entries(filters).every(([key, value]) => allowed[key]?.includes(value));
}

// Convierte una fila de override del contenido en un objeto listo para la API.
function parseLessonOverride(row) {
  return {
    id: row.id, title: row.title, target: row.target, description: row.description,
    category: row.category, subcategory: row.subcategory, mouth: row.mouth,
    examples: JSON.parse(row.examples), syllables: JSON.parse(row.syllables),
    readingText: row.reading_text, options: JSON.parse(row.options),
    wordFilters: JSON.parse(row.word_filters)
  };
}

// Valida y limpia una lecci?n personalizada antes de guardarla.
function normalizeCustomLesson(body) {
  const {
    studentId, title, description = '', category, subcategory = '',
    target, words, emojis: requestedEmojis = [], theme = 'violet', wordFilters = {},
    mapPosition = lessonSequence.length
  } = body || {};
  const emojis = requestedEmojis.length ? requestedEmojis : Array.isArray(words) ? words.map(() => '✨') : [];
  const validCategories = ['Vocales', 'Consonantes', 'Sílabas', 'Palabras'];
  const validThemes = ['violet', 'blue', 'green', 'orange', 'pink'];
  const validSubcategories = {
    Vocales: ['Vocales'],
    Consonantes: ['Consonantes iniciales', 'Sílabas trabadas', 'Dígrafos y sonidos especiales'],
    'Sílabas': ['Sílabas directas', 'Sílabas inversas', 'Sílabas trabadas y mixtas'],
    Palabras: ['1 sílaba', '2 sílabas', '3 o más sílabas', 'Frases y lectura']
  };
  const resolvedSubcategory = subcategory || validSubcategories[category]?.[0];
  if (typeof studentId !== 'string' || typeof title !== 'string' || title.trim().length < 2 ||
      title.trim().length > 80 || !/^[\p{L}\p{M}0-9 .,!¡?¿-]+$/u.test(title.trim()) ||
      typeof description !== 'string' || description.trim().length > 500 ||
      !validCategories.includes(category) ||
      !validSubcategories[category].includes(resolvedSubcategory) ||
      typeof target !== 'string' || !/^[\p{L}\p{M}]{1,20}$/u.test(target.trim()) ||
      !Array.isArray(words) || words.length < 2 || words.length > 8 ||
      words.some(word => typeof word !== 'string' || !/^[\p{L}\p{M}]+(?:[ -][\p{L}\p{M}]+)*$/u.test(word.trim()) || word.trim().length > 40) ||
      !Array.isArray(emojis) || emojis.length !== words.length ||
      emojis.some(emoji => typeof emoji !== 'string' || Array.from(emoji).length > 12 || /[\u0000-\u001f]/u.test(emoji)) ||
      !validThemes.includes(theme) || !isValidWordFilters(wordFilters) ||
      !Number.isInteger(mapPosition) || mapPosition < 0 || mapPosition > 500) {
    return null;
  }
  return {
    studentId, title: title.trim(), description: description.trim(), category, subcategory: resolvedSubcategory,
    target: target.trim().toLocaleUpperCase('es'), words: words.map(word => word.trim()),
    emojis, theme, wordFilters, mapPosition
  };
}

normalizeStoredProgress();

// Crea la cookie que mantiene la sesi?n autenticada del usuario.
function setSessionCookie(res, token) {
  res.cookie('lecturaclub_session', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: sessionDurationMs
  });
}

// Elimina la cookie de sesi?n para cerrar la autenticaci?n del cliente.
function clearSessionCookie(res) {
  res.clearCookie('lecturaclub_session', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/'
  });
}

// Genera un token nuevo y lo registra en la base de datos para iniciar sesi?n.
function createSession(userId, res) {
  const token = crypto.randomBytes(32).toString('base64url');
  const now = Date.now();
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now);
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(tokenDigest(token), userId, now + sessionDurationMs);
  setSessionCookie(res, token);
}

// Revisa la sesi?n almacenada en la cookie y carga el usuario autenticado.
function requireAuth(req, res, next) {
  const token = req.cookies?.lecturaclub_session;
  if (!token) return res.status(401).json({ error: 'Inicia sesión para continuar.' });
  const session = db.prepare(`
    SELECT users.id, users.name, users.email, users.username, users.role, users.email_verified_at
    FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
      AND users.deleted_at IS NULL AND users.access_blocked_at IS NULL
  `).get(tokenDigest(token), Date.now());
  if (!session) {
    clearSessionCookie(res);
    return res.status(401).json({ error: 'Inicia sesión para continuar.' });
  }
  req.user = session;
  next();
}

// Requiere a la sesi?n del superadministrador para acceder a la ruta.
function requireSuperAdmin(req, res, next) {
  requireAuth(req, res, error => {
    if (error) return next(error);
    if (req.user.role !== 'superadmin') return res.status(403).json({ error: 'Solo el superadministrador puede realizar esta acción.' });
    next();
  });
}

// Normaliza un correo o usuario para comparaciones y almacenamiento coherentes.
function normalizedIdentifier(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

// Comprueba si el usuario o la IP ya superaron los intentos permitidos.
function loginIsLimited(identifier, ip) {
  const identifierHash = keyedDigest(`identifier:${identifier}`);
  const ipHash = keyedDigest(`ip:${ip}`);
  const since = Date.now() - attemptWindowMs;
  const count = db.prepare(`
    SELECT COUNT(*) AS count FROM login_attempts
    WHERE attempted_at > ? AND (identifier_hash = ? OR ip_hash = ?)
  `).get(since, identifierHash, ipHash).count;
  return { limited: count >= maxLoginAttempts, identifierHash, ipHash };
}

// Registra un intento fallido para frenar ataques repetidos.
function recordLoginFailure(identifierHash, ipHash) {
  db.prepare('INSERT INTO login_attempts (identifier_hash, ip_hash, attempted_at) VALUES (?, ?, ?)').run(identifierHash, ipHash, Date.now());
  db.prepare('DELETE FROM login_attempts WHERE attempted_at < ?').run(Date.now() - 24 * 60 * 60 * 1000);
}

// Verifica si el dominio del correo tiene un servidor MX v?lido para enviar mensajes.
async function emailDomainHasMailServer(email) {
  if (process.env.EMAIL_DOMAIN_CHECK === 'skip' && process.env.NODE_ENV === 'test') return true;
  const domain = email.slice(email.lastIndexOf('@') + 1);
  try {
    const records = await dns.resolveMx(domain);
    return records.length > 0;
  } catch (error) {
    if (error.code === 'ENOTFOUND') return false;
    if (error.code === 'ENODATA' || error.code === 'ENOTIMP') {
      try {
        await dns.lookup(domain);
        return true;
      } catch (lookupError) {
        if (lookupError.code === 'ENOTFOUND') return false;
        throw lookupError;
      }
    }
    throw error;
  }
}

// Detecta si una direcci?n o IP ha pedido demasiadas verificaciones en poco tiempo.
function verificationIsLimited(email, ip) {
  const emailHash = keyedDigest(`verification-email:${email}`);
  const ipHash = keyedDigest(`verification-ip:${ip}`);
  const since = Date.now() - attemptWindowMs;
  const count = db.prepare(`
    SELECT COUNT(*) AS count FROM verification_requests
    WHERE requested_at > ? AND (email_hash = ? OR ip_hash = ?)
  `).get(since, emailHash, ipHash).count;
  return { limited: count >= 3, emailHash, ipHash };
}

// Comprueba si la misma cuenta o IP agot? los intentos de c?digo de verificaci?n.
function verificationCodeIsLimited(email, ip) {
  const emailHash = keyedDigest(`verification-code-email:${email}`);
  const ipHash = keyedDigest(`verification-code-ip:${ip}`);
  const since = Date.now() - attemptWindowMs;
  const count = db.prepare(`
    SELECT COUNT(*) AS count FROM email_verification_attempts
    WHERE attempted_at > ? AND (email_hash = ? OR ip_hash = ?)
  `).get(since, emailHash, ipHash).count;
  return { limited: count >= maxVerificationCodeAttempts, emailHash, ipHash };
}

// Guarda cada fracaso de verificaci?n para bloquear intentos masivos.
function recordVerificationCodeFailure(emailHash, ipHash) {
  db.prepare('INSERT INTO email_verification_attempts (email_hash, ip_hash, attempted_at) VALUES (?, ?, ?)')
    .run(emailHash, ipHash, Date.now());
  db.prepare('DELETE FROM email_verification_attempts WHERE attempted_at < ?')
    .run(Date.now() - 24 * 60 * 60 * 1000);
}

// Compara la frecuencia de recuperaci?n para evitar abusos del servicio.
function passwordResetIsLimited(email, ip) {
  const emailHash = keyedDigest(`reset-email:${email}`);
  const ipHash = keyedDigest(`reset-ip:${ip}`);
  const since = Date.now() - attemptWindowMs;
  const count = db.prepare(`
    SELECT COUNT(*) AS count FROM password_reset_requests
    WHERE requested_at > ? AND (email_hash = ? OR ip_hash = ?)
  `).get(since, emailHash, ipHash).count;
  return { limited: count >= 3, emailHash, ipHash };
}

// Env?a un c?digo temporal para verificar la cuenta y activar el acceso.
async function sendVerificationEmail(user) {
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  db.prepare('DELETE FROM email_verification_tokens WHERE user_id = ?').run(user.id);
  db.prepare('INSERT INTO email_verification_tokens (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .run(keyedDigest(`verification-code:${user.id}:${code}`), user.id, Date.now() + verificationDurationMs);
  try {
    await mailTransport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: 'Código de verificación de LecturaClub',
      text: `Hola ${user.name}, tu código de verificación de LecturaClub es: ${code}\nEs válido durante 10 minutos. Escríbelo en la página para activar tu cuenta.\nSi no creaste esta cuenta, ignora este mensaje.`
    });
  } catch (error) {
    db.prepare('DELETE FROM email_verification_tokens WHERE user_id = ?').run(user.id);
    console.error('No se pudo enviar el correo de verificación:', error);
    throw error;
  }
}

const bootstrapEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
if (bootstrapEmail) {
  const bootstrapPassword = process.env.ADMIN_PASSWORD;
  if (!emailPattern.test(bootstrapEmail) || !bootstrapPassword || bootstrapPassword.length < 12) {
    throw new Error('ADMIN_EMAIL requiere un correo válido y ADMIN_PASSWORD de al menos 12 caracteres.');
  }
  const existingAdmin = db.prepare('SELECT id, role FROM users WHERE email = ?').get(bootstrapEmail);
  if (existingAdmin && existingAdmin.role !== 'superadmin') {
    throw new Error('ADMIN_EMAIL ya pertenece a una cuenta que no es superadministrador. Usa otro correo.');
  }
  if (!existingAdmin) {
    const digest = passwordHash(bootstrapPassword);
    db.prepare(`
      INSERT INTO users (id, name, email, username, password_hash, password_salt, role, created_at, email_verified_at)
      VALUES (?, ?, ?, ?, ?, ?, 'superadmin', ?, ?)
    `).run(crypto.randomUUID(), process.env.ADMIN_NAME?.trim() || 'Super administrador', bootstrapEmail,
      process.env.ADMIN_USERNAME?.trim().toLowerCase() || bootstrapEmail.split('@')[0],
      digest.hash, digest.salt, Date.now(), Date.now());
  }
}

const smtpHost = process.env.SMTP_HOST;
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;
const mailTransport = smtpHost && smtpUser && smtpPassword
  ? nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    requireTLS: Number(process.env.SMTP_PORT || 587) !== 465 &&
      (isProduction || process.env.SMTP_REQUIRE_TLS !== 'false'),
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: { user: smtpUser, pass: smtpPassword }
  })
  : null;

// Registra una nueva cuenta y exige verificaci?n del correo antes de activar el acceso.
app.post('/api/auth/register', async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = normalizedIdentifier(req.body?.email);
  const username = normalizedIdentifier(req.body?.username);
  const password = req.body?.password;
  const role = req.body?.role;
  if (name.length < 8 || name.length > 80 || !namePattern.test(name) || !emailPattern.test(email) ||
      !identifierPattern.test(username) || typeof password !== 'string' ||
      passwordPolicyError(password) || !validRoles.has(role)) {
    return res.status(400).json({ error: 'Revisa el nombre (mínimo 8 caracteres, solo letras), correo, usuario (mínimo 4 caracteres), tipo de cuenta y contraseña (mayúscula, minúscula, número y carácter especial; mínimo 10 caracteres).' });
  }
  if (!mailTransport || !baseUrl) {
    return res.status(503).json({ error: 'El registro requiere correo verificado. El envío de correo no está configurado en el servidor.' });
  }
  const attempt = verificationIsLimited(email, req.ip || req.socket.remoteAddress || 'unknown');
  if (attempt.limited) {
    return res.status(429).json({ error: 'Demasiadas solicitudes de verificación. Espera 15 minutos antes de intentarlo de nuevo.' });
  }
  db.prepare('INSERT INTO verification_requests (email_hash, ip_hash, requested_at) VALUES (?, ?, ?)')
    .run(attempt.emailHash, attempt.ipHash, Date.now());
  try {
    if (!await emailDomainHasMailServer(email)) {
      return res.status(400).json({ error: 'Ese dominio no tiene un servicio de correo válido. Revisa la dirección.' });
    }
  } catch (error) {
    console.error('No se pudo validar el dominio del correo:', error);
    return res.status(503).json({ error: 'No se pudo comprobar el dominio del correo. Inténtalo de nuevo más tarde.' });
  }
  const digest = passwordHash(password);
  const user = {
    id: crypto.randomUUID(), name, email, username, role,
    password_hash: digest.hash, password_salt: digest.salt
  };
  let accountCreated = false;
  try {
    db.prepare(`
      INSERT INTO users (id, name, email, username, password_hash, password_salt, role, created_at, email_verified_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
    `).run(user.id, user.name, user.email, user.username, user.password_hash, user.password_salt, user.role, Date.now());
    accountCreated = true;
    await sendVerificationEmail(user);
    res.status(202).json({ message: 'Enviamos un código de seis dígitos a tu correo. Escríbelo para activar tu cuenta; vence en 10 minutos.' });
  } catch (error) {
    if (accountCreated) db.prepare('DELETE FROM users WHERE id = ? AND email_verified_at IS NULL').run(user.id);
    if (error.errcode === 2067 || error.message.includes('UNIQUE constraint failed: users.')) {
      return res.status(409).json({ error: 'El correo o nombre de usuario ya está registrado.' });
    }
    if (accountCreated) return res.status(503).json({ error: 'No se pudo enviar el correo de verificación. Comprueba la configuración e inténtalo de nuevo.' });
    console.error('No se pudo registrar la cuenta:', error);
    res.status(500).json({ error: 'No se pudo crear la cuenta.' });
  }
});

// Valida credenciales y crea la sesi?n autenticada del usuario.
app.post('/api/auth/login', async (req, res) => {
  const identifier = normalizedIdentifier(req.body?.identifier);
  const password = req.body?.password;
  if (!identifier || typeof password !== 'string' || identifier.length > 254 || password.length > 128) {
    return res.status(400).json({ error: 'Completa el usuario y la contraseña.' });
  }
  const attempt = loginIsLimited(identifier, req.ip || req.socket.remoteAddress || 'unknown');
  if (attempt.limited) {
    res.set('Retry-After', String(Math.ceil(attemptWindowMs / 1000)));
    return res.status(429).json({ error: 'Demasiados intentos. Espera 15 minutos antes de intentarlo de nuevo.' });
  }
  const user = db.prepare('SELECT * FROM users WHERE deleted_at IS NULL AND (email = ? COLLATE NOCASE OR username = ? COLLATE NOCASE)').get(identifier, identifier);
  const candidate = passwordHash(typeof password === 'string' ? password : '', user?.password_salt || 'lecturaclub-invalid-account');
  const valid = user && crypto.timingSafeEqual(Buffer.from(candidate.hash, 'hex'), Buffer.from(user.password_hash, 'hex'));
  if (!valid) {
    recordLoginFailure(attempt.identifierHash, attempt.ipHash);
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  }
  if (user.access_blocked_at) {
    return res.status(403).json({ error: 'El acceso a esta cuenta está bloqueado. Contacta al administrador.' });
  }
  if (!user.email_verified_at) {
    if (!mailTransport || !baseUrl) {
      return res.status(503).json({ error: 'Tu correo aún no está confirmado y el envío de códigos no está configurado en el servidor.' });
    }
    const verificationAttempt = verificationIsLimited(user.email, req.ip || req.socket.remoteAddress || 'unknown');
    if (verificationAttempt.limited) {
      res.set('Retry-After', String(Math.ceil(attemptWindowMs / 1000)));
      return res.status(429).json({ error: 'Tu correo aún no está confirmado. Ya se enviaron varios códigos; espera 15 minutos antes de volver a intentarlo.' });
    }
    db.prepare('INSERT INTO verification_requests (email_hash, ip_hash, requested_at) VALUES (?, ?, ?)')
      .run(verificationAttempt.emailHash, verificationAttempt.ipHash, Date.now());
    try {
      await sendVerificationEmail(user);
    } catch (error) {
      console.error('No se pudo reenviar el código al iniciar sesión:', error);
      return res.status(503).json({ error: 'Tu correo aún no está confirmado, pero no se pudo enviar un código nuevo. Inténtalo más tarde.' });
    }
    return res.status(403).json({
      error: 'Tu correo aún no está confirmado. Te enviamos un nuevo código para verificarlo.',
      email: user.email,
      requiresEmailVerification: true
    });
  }
  db.prepare('DELETE FROM login_attempts WHERE identifier_hash = ? OR ip_hash = ?').run(attempt.identifierHash, attempt.ipHash);
  createSession(user.id, res);
  res.json({ user: publicUser(user), progress: readProgress(user.id) });
});

// Devuelve el perfil del usuario autenticado para el cliente y el panel.
app.get('/api/auth/me', (req, res) => {
  const token = req.cookies?.lecturaclub_session;
  if (!token) return res.json({ user: null, progress: null });
  const user = db.prepare(`
    SELECT users.id, users.name, users.email, users.username, users.role, users.email_verified_at
    FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
      AND users.deleted_at IS NULL AND users.access_blocked_at IS NULL
  `).get(tokenDigest(token), Date.now());
  if (!user) {
    clearSessionCookie(res);
    return res.json({ user: null, progress: null });
  }
  res.json({ user: publicUser(user), progress: readProgress(user.id) });
});

// Comprueba el c?digo de verificaci?n y activa la cuenta del usuario.
app.post('/api/auth/verify-email', (req, res) => {
  const email = normalizedIdentifier(req.body?.email);
  const code = req.body?.code;
  if (!emailPattern.test(email) || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'Escribe el correo y el código de seis dígitos recibido.' });
  }
  const attempt = verificationCodeIsLimited(email, req.ip || req.socket.remoteAddress || 'unknown');
  if (attempt.limited) {
    res.set('Retry-After', String(Math.ceil(attemptWindowMs / 1000)));
    return res.status(429).json({ error: 'Demasiados intentos. Espera 15 minutos antes de solicitar otro código.' });
  }
  const user = db.prepare('SELECT id FROM users WHERE email = ? COLLATE NOCASE AND email_verified_at IS NULL').get(email);
  const verification = user && db.prepare(`
    SELECT user_id FROM email_verification_tokens
    WHERE token_hash = ? AND user_id = ? AND expires_at > ?
  `).get(keyedDigest(`verification-code:${user.id}:${code}`), user.id, Date.now());
  if (!verification) {
    recordVerificationCodeFailure(attempt.emailHash, attempt.ipHash);
    return res.status(400).json({ error: 'El código no es válido o ha caducado. Solicita uno nuevo e inténtalo otra vez.' });
  }
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare('UPDATE users SET email_verified_at = ? WHERE id = ?').run(Date.now(), verification.user_id);
    db.prepare('DELETE FROM email_verification_tokens WHERE user_id = ?').run(verification.user_id);
    db.prepare('DELETE FROM email_verification_attempts WHERE email_hash = ?').run(attempt.emailHash);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  res.json({ message: 'Correo confirmado. Ya puedes iniciar sesión.' });
});

// Reenv?a un c?digo de confirmaci?n cuando el usuario lo solicita de nuevo.
app.post('/api/auth/resend-verification', async (req, res) => {
  if (!mailTransport || !baseUrl) {
    return res.status(503).json({ error: 'El envío de correo no está configurado en el servidor.' });
  }
  const email = normalizedIdentifier(req.body?.email);
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: 'Escribe un correo electrónico válido.' });
  }
  const attempt = verificationIsLimited(email, req.ip || req.socket.remoteAddress || 'unknown');
  if (attempt.limited) {
    return res.status(429).json({ error: 'Demasiadas solicitudes. Espera 15 minutos antes de intentarlo de nuevo.' });
  }
  db.prepare('INSERT INTO verification_requests (email_hash, ip_hash, requested_at) VALUES (?, ?, ?)')
    .run(attempt.emailHash, attempt.ipHash, Date.now());
  const user = db.prepare('SELECT id, email, name FROM users WHERE email = ? COLLATE NOCASE AND email_verified_at IS NULL').get(email);
  if (user) {
    try {
      await sendVerificationEmail(user);
    } catch {
      return res.status(503).json({ error: 'No se pudo enviar el correo de verificación. Inténtalo más tarde.' });
    }
  }
  res.json({ message: 'Si la cuenta necesita confirmación, enviaremos un nuevo código a ese correo.' });
});

// Cierra la sesi?n actual y elimina la cookie del cliente.
app.post('/api/auth/logout', (req, res) => {
  const token = req.cookies?.lecturaclub_session;
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenDigest(token));
  clearSessionCookie(res);
  res.json({ ok: true });
});

// Solicita un enlace de recuperaci?n para restablecer la contrase?a.
app.post('/api/auth/forgot-password', async (req, res) => {
  if (!mailTransport || !baseUrl) {
    return res.status(503).json({ error: 'La recuperación por correo no está configurada en el servidor.' });
  }
  const email = normalizedIdentifier(req.body?.identifier);
  if (!emailPattern.test(email)) {
    return res.json({ message: 'Si existe una cuenta con ese correo, recibirá un enlace de recuperación válido durante 30 minutos.' });
  }
  const attempt = passwordResetIsLimited(email, req.ip || req.socket.remoteAddress || 'unknown');
  if (attempt.limited) {
    return res.status(429).json({ error: 'Demasiadas solicitudes de recuperación. Espera 15 minutos antes de intentarlo de nuevo.' });
  }
  db.prepare('INSERT INTO password_reset_requests (email_hash, ip_hash, requested_at) VALUES (?, ?, ?)')
    .run(attempt.emailHash, attempt.ipHash, Date.now());
  const user = db.prepare('SELECT id, email, name FROM users WHERE email = ? COLLATE NOCASE').get(email);
  if (user) {
    const token = crypto.randomBytes(32).toString('base64url');
    db.prepare('DELETE FROM password_reset_tokens WHERE user_id = ?').run(user.id);
    db.prepare('INSERT INTO password_reset_tokens (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
      .run(tokenDigest(token), user.id, Date.now() + resetDurationMs);
    const link = `${baseUrl}/?token=${encodeURIComponent(token)}`;
    try {
      await mailTransport.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: user.email,
        subject: 'Restablece tu contraseña de LecturaClub',
        text: `Hola ${user.name}, usa este enlace antes de 30 minutos para cambiar tu contraseña: ${link}\nSi no solicitaste el cambio, ignora este mensaje.`
      });
    } catch (error) {
      db.prepare('DELETE FROM password_reset_tokens WHERE token_hash = ?').run(tokenDigest(token));
      console.error('No se pudo enviar el correo de recuperación:', error);
      return res.status(503).json({ error: 'No se pudo enviar el correo de recuperación. Inténtalo más tarde.' });
    }
  }
  res.json({ message: 'Si existe una cuenta con ese correo, recibirá un enlace de recuperación válido durante 30 minutos.' });
});

// Cambia la contrase?a usando el token temporal de recuperaci?n.
app.post('/api/auth/reset-password', (req, res) => {
  const token = req.body?.token;
  const password = req.body?.password;
  if (typeof token !== 'string' || token.length > 128 || typeof password !== 'string' ||
      passwordPolicyError(password)) {
    return res.status(400).json({ error: 'El enlace no es válido o la contraseña no cumple los requisitos.' });
  }
  const tokenHash = tokenDigest(token);
  const reset = db.prepare('SELECT user_id FROM password_reset_tokens WHERE token_hash = ? AND expires_at > ?').get(tokenHash, Date.now());
  if (!reset) return res.status(400).json({ error: 'El enlace no es válido o ha caducado. Solicita uno nuevo.' });
  const digest = passwordHash(password);
  db.prepare('UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?').run(digest.hash, digest.salt, reset.user_id);
  db.prepare('DELETE FROM password_reset_tokens WHERE user_id = ?').run(reset.user_id);
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(reset.user_id);
  clearSessionCookie(res);
  res.json({ message: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
});

// Lista los usuarios del panel administrativo con su estado y progreso.
app.get('/api/admin/users', requireSuperAdmin, (req, res) => {
  const users = db.prepare(`
    SELECT users.id, users.name, users.email, users.username, users.role,
      users.created_at AS createdAt, users.email_verified_at AS emailVerifiedAt,
      users.deleted_at AS deletedAt, users.access_blocked_at AS accessBlockedAt,
      (SELECT COUNT(*) FROM sessions WHERE sessions.user_id = users.id AND sessions.expires_at > ?) AS activeSessions,
      COALESCE(progress.xp, 0) AS xp
    FROM users LEFT JOIN progress ON progress.user_id = users.id
    ORDER BY users.created_at DESC
  `).all(Date.now());
  res.json({ users, currentUserId: req.user.id });
});

// Crea una cuenta de profesor o alumno desde el panel de administraci?n.
app.post('/api/admin/users', requireSuperAdmin, (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = normalizedIdentifier(req.body?.email);
  const username = normalizedIdentifier(req.body?.username);
  const password = req.body?.password;
  const role = req.body?.role;
  if (name.length < 8 || name.length > 80 || !namePattern.test(name) ||
      !emailPattern.test(email) || !identifierPattern.test(username) ||
      typeof password !== 'string' || passwordPolicyError(password) ||
      !validRoles.has(role)) {
    return res.status(400).json({ error: 'Revisa nombre, correo, usuario, tipo de cuenta y contraseña.' });
  }
  const digest = passwordHash(password);
  try {
    const user = {
      id: crypto.randomUUID(), name, email, username, role,
      password_hash: digest.hash, password_salt: digest.salt,
      email_verified_at: Date.now()
    };
    db.prepare(`
      INSERT INTO users (id, name, email, username, password_hash, password_salt,
        role, created_at, email_verified_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(user.id, user.name, user.email, user.username, user.password_hash,
      user.password_salt, user.role, Date.now(), user.email_verified_at);
    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    if (error.errcode === 2067 || error.message.includes('UNIQUE constraint failed: users.')) {
      return res.status(409).json({ error: 'El correo o nombre de usuario ya está registrado.' });
    }
    throw error;
  }
});

// Actualiza el rol del usuario seleccionado por el superadministrador.
app.patch('/api/admin/users/:id/role', requireSuperAdmin, (req, res) => {
  const { role } = req.body || {};
  if (!['alumno', 'profesor'].includes(role)) {
    return res.status(400).json({ error: 'El rol debe ser alumno o profesor.' });
  }
  const target = db.prepare('SELECT id, role FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'No se encontró ese usuario.' });
  if (target.role === 'superadmin') {
    return res.status(400).json({ error: 'No se puede cambiar el rol de un superadministrador desde este panel.' });
  }
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, target.id);
  res.json({ ok: true, role });
});

// Elimina l?gicamente una cuenta y revoca sus sesiones activas.
app.delete('/api/admin/users/:id', requireSuperAdmin, (req, res) => {
  const userId = req.params.id;
  if (userId === req.user.id) {
    return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta de superadministrador.' });
  }
  const target = db.prepare('SELECT id, role, deleted_at FROM users WHERE id = ?').get(userId);
  if (!target) return res.status(404).json({ error: 'No se encontró ese usuario.' });
  if (target.deleted_at) return res.status(404).json({ error: 'La cuenta ya está eliminada.' });
  if (target.role === 'superadmin') {
    const count = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'superadmin' AND deleted_at IS NULL").get().count;
    if (count <= 1) return res.status(400).json({ error: 'No se puede eliminar el último superadministrador.' });
  }
  db.prepare('UPDATE users SET deleted_at = ? WHERE id = ?').run(Date.now(), userId);
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
  res.json({ ok: true });
});

// Restaura una cuenta previamente eliminada para volver a usarla.
app.post('/api/admin/users/:id/restore', requireSuperAdmin, (req, res) => {
  const result = db.prepare('UPDATE users SET deleted_at = NULL, access_blocked_at = NULL WHERE id = ? AND deleted_at IS NOT NULL').run(req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'No se encontró una cuenta eliminada para restaurar.' });
  res.json({ ok: true });
});

// Bloquea o desbloquea el acceso de un usuario activo.
app.patch('/api/admin/users/:id/access', requireSuperAdmin, (req, res) => {
  const { blocked } = req.body || {};
  if (typeof blocked !== 'boolean') return res.status(400).json({ error: 'Indica si el acceso debe quedar bloqueado.' });
  const target = db.prepare('SELECT id, deleted_at FROM users WHERE id = ?').get(req.params.id);
  if (!target || target.deleted_at) return res.status(404).json({ error: 'No se encontró una cuenta activa.' });
  db.prepare('UPDATE users SET access_blocked_at = ? WHERE id = ?').run(blocked ? Date.now() : null, target.id);
  if (blocked) db.prepare('DELETE FROM sessions WHERE user_id = ?').run(target.id);
  res.json({ ok: true, blocked });
});

// Cierra todas las sesiones abiertas del usuario objetivo.
app.delete('/api/admin/users/:id/sessions', requireSuperAdmin, (req, res) => {
  const target = db.prepare('SELECT id FROM users WHERE id = ? AND deleted_at IS NULL').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'No se encontró una cuenta activa.' });
  const result = db.prepare('DELETE FROM sessions WHERE user_id = ?').run(target.id);
  res.json({ ok: true, closedSessions: result.changes });
});

// Devuelve las lecciones personalizadas del alumno o del grupo que se consulta.
app.get('/api/lessons/custom', requireAuth, (req, res) => {
  const studentId = req.user.role === 'alumno'
    ? req.user.id
    : hasFullAccess(req.user.role) ? req.query.studentId : null;
  if (studentId && !db.prepare("SELECT id FROM users WHERE id = ? AND role = 'alumno' AND deleted_at IS NULL").get(studentId)) {
    return res.status(404).json({ error: 'No se encontró ese alumno.' });
  }
  const lessons = studentId
    ? db.prepare(`SELECT id, title, description, category, subcategory, target, words, emojis, theme,
        word_filters AS wordFilters, map_position AS mapPosition, created_at AS createdAt
      FROM custom_lessons WHERE student_id = ? ORDER BY map_position, created_at`).all(studentId)
    : [];
  res.json({ lessons: lessons.map(lesson => ({
    ...lesson, words: JSON.parse(lesson.words), emojis: JSON.parse(lesson.emojis),
    wordFilters: JSON.parse(lesson.wordFilters), isCustom: true
  })) });
});

// Lista los alumnos asignados al profesor o administrador.
app.get('/api/teacher/students', requireTeacherOrAdmin, (req, res) => {
  const students = db.prepare(`
    SELECT users.id, users.name, users.username, users.email, COALESCE(progress.xp, 0) AS xp
    FROM users LEFT JOIN progress ON progress.user_id = users.id
    WHERE users.role = 'alumno' AND users.deleted_at IS NULL ORDER BY users.name COLLATE NOCASE
  `).all();
  res.json({ students });
});

// Consulta la experiencia acumulada de un alumno concreto.
app.get('/api/teacher/students/:id/experience', requireTeacherOrAdmin, (req, res) => {
  const student = db.prepare("SELECT id, name, username FROM users WHERE id = ? AND role = 'alumno' AND deleted_at IS NULL")
    .get(req.params.id);
  if (!student) return res.status(404).json({ error: 'No se encontró ese alumno.' });
  const lessons = db.prepare(`SELECT id, title, description, category, subcategory, target, words,
      emojis, theme, word_filters AS wordFilters, map_position AS mapPosition,
      created_at AS createdAt
    FROM custom_lessons WHERE student_id = ? ORDER BY map_position, created_at`).all(student.id)
    .map(lesson => ({
      ...lesson, words: JSON.parse(lesson.words), emojis: JSON.parse(lesson.emojis),
      wordFilters: JSON.parse(lesson.wordFilters), isCustom: true
    }));
  const games = db.prepare(`SELECT custom_games.id, custom_games.title,
      CASE WHEN custom_games.activity_type = 'bridge' THEN 'bridge' ELSE custom_games.game_type END AS type,
      custom_games.items, custom_games.theme,
      COALESCE(custom_game_results.attempts, 0) AS attempts,
      custom_game_results.completed_at AS completedAt
    FROM custom_games LEFT JOIN custom_game_results
      ON custom_game_results.game_id = custom_games.id AND custom_game_results.student_id = custom_games.student_id
    WHERE custom_games.student_id = ? ORDER BY custom_games.created_at`).all(student.id)
    .map(game => ({ ...game, items: JSON.parse(game.items) }));
  res.json({ student, progress: readProgress(student.id), lessons, games });
});

// Recupera el avance detallado de un alumno para acompa?amiento pedag?gico.
app.get('/api/teacher/students/:id/progress', requireTeacherOrAdmin, (req, res) => {
  const student = db.prepare("SELECT id, name, username FROM users WHERE id = ? AND role = 'alumno' AND deleted_at IS NULL").get(req.params.id);
  if (!student) return res.status(404).json({ error: 'No se encontró ese alumno.' });
  const rows = readLessonResults(student.id);
  const sections = ['Vocales', 'Consonantes', 'Sílabas', 'Palabras'].map(category => {
    const categoryRows = rows.filter(row => row.category === category);
    const attempts = categoryRows.reduce((total, row) => total + row.attempts, 0);
    const points = categoryRows.reduce((total, row) => total + row.points, 0);
    return {
      category,
      points,
      firstStars: categoryRows.reduce((total, row) => total + row.firstStars, 0),
      retryStars: categoryRows.reduce((total, row) => total + row.retryStars, 0),
      attempts,
      repetitions: categoryRows.reduce((total, row) => total + Math.max(0, row.attempts - 1), 0),
      mistakes: categoryRows.reduce((total, row) => total + row.mistakes, 0),
      weightedScore: attempts ? Math.round((points / (attempts * 30)) * 100) : 0
    };
  });
  const lessons = db.prepare(`
    SELECT lesson_id AS lessonId, category, attempts, mistakes, best_stars AS bestStars,
      latest_stars AS latestStars, first_stars AS firstStars, retry_stars AS retryStars,
      points FROM lesson_results
    WHERE user_id = ? ORDER BY updated_at DESC
  `).all(student.id);
  const customLessons = db.prepare(`
    SELECT id, title, description, category, subcategory, target, words, emojis, theme,
      word_filters AS wordFilters, created_at AS createdAt, map_position AS mapPosition
    FROM custom_lessons WHERE student_id = ? ORDER BY map_position, created_at
  `).all(student.id).map(lesson => ({
    ...lesson, words: JSON.parse(lesson.words), emojis: JSON.parse(lesson.emojis),
    wordFilters: JSON.parse(lesson.wordFilters)
  }));
  const customGames = db.prepare(`
    SELECT custom_games.id, custom_games.title,
      CASE WHEN custom_games.activity_type = 'bridge' THEN 'bridge' ELSE custom_games.game_type END AS type,
      custom_games.items,
      custom_games.theme, COALESCE(custom_game_results.attempts, 0) AS attempts,
      custom_game_results.completed_at AS completedAt
    FROM custom_games LEFT JOIN custom_game_results
      ON custom_game_results.game_id = custom_games.id AND custom_game_results.student_id = custom_games.student_id
    WHERE custom_games.student_id = ? ORDER BY custom_games.created_at DESC
  `).all(student.id).map(game => ({ ...game, items: JSON.parse(game.items) }));
  res.json({ student, sections, lessons, customLessons, customGames });
});

// Expone el cat?logo de lecciones disponible para profesores.
app.get('/api/teacher/lessons', requireTeacherOrAdmin, (req, res) => {
  const lessons = db.prepare(`
    SELECT custom_lessons.id, custom_lessons.title, custom_lessons.description,
      custom_lessons.category, custom_lessons.subcategory, custom_lessons.target,
      custom_lessons.words, custom_lessons.emojis, custom_lessons.theme,
      custom_lessons.word_filters AS wordFilters, custom_lessons.map_position AS mapPosition,
      custom_lessons.student_id AS studentId,
      users.name AS studentName, users.username AS studentUsername
    FROM custom_lessons JOIN users ON users.id = custom_lessons.student_id
    WHERE users.deleted_at IS NULL ORDER BY custom_lessons.created_at DESC
  `).all();
  res.json({ lessons: lessons.map(lesson => ({
    ...lesson, words: JSON.parse(lesson.words), emojis: JSON.parse(lesson.emojis),
    wordFilters: JSON.parse(lesson.wordFilters)
  })) });
});

// Devuelve los overrides de lecciones para editar el contenido del curso.
app.get('/api/teacher/lesson-overrides', requireTeacherOrAdmin, (req, res) => {
  const overrides = db.prepare('SELECT * FROM lesson_overrides ORDER BY id').all();
  res.json({ overrides: overrides.map(parseLessonOverride) });
});

// Obtiene los overrides visibles para el usuario actual.
app.get('/api/lessons/overrides', requireAuth, (req, res) => {
  const overrides = db.prepare('SELECT * FROM lesson_overrides ORDER BY id').all();
  res.json({ overrides: overrides.map(parseLessonOverride) });
});

// Guarda una lecci?n del cat?logo o la reemplaza si ya exist?a.
app.put('/api/teacher/lessons/catalog/:id', requireTeacherOrAdmin, (req, res) => {
  const { title, target, description = '', category, subcategory = '', examples = [],
    syllables = [], readingText = '', options = [], wordFilters = {} } = req.body || {};
  if (!/^(?:l\d+|b\d+|m\d+)$/.test(req.params.id) ||
      typeof title !== 'string' || title.trim().length < 2 || title.trim().length > 80 ||
      typeof target !== 'string' || !/^[\p{L}\p{M}]{1,20}$/u.test(target.trim()) ||
      typeof description !== 'string' || description.length > 500 ||
      typeof category !== 'string' || !['Vocales', 'Consonantes', 'Sílabas', 'Palabras'].includes(category) ||
      typeof subcategory !== 'string' || subcategory.length > 80 ||
      !Array.isArray(examples) || examples.length > 20 ||
      examples.some(item => !item || typeof item.w !== 'string' || item.w.length > 40 ||
        typeof item.emoji !== 'string' || Array.from(item.emoji).length > 12) ||
      !Array.isArray(syllables) || syllables.length > 20 ||
      syllables.some(item => typeof item !== 'string' || item.length > 12) ||
      !Array.isArray(options) || options.length > 20 ||
      options.some(item => typeof item !== 'string' || item.length > 20) ||
      typeof readingText !== 'string' || readingText.length > 2000 ||
      !isValidWordFilters(wordFilters)) {
    return res.status(400).json({ error: 'Revisa el título, objetivo, descripción y contenido de la lección.' });
  }
  const override = {
    id: req.params.id, title: title.trim(), target: target.trim().toLocaleUpperCase('es'),
    description: description.trim(), category, subcategory, mouth: description.trim(),
    examples, syllables, readingText, options, wordFilters
  };
  db.prepare(`
    INSERT INTO lesson_overrides (id, title, target, description, category, subcategory,
      mouth, examples, syllables, reading_text, options, word_filters, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET title = excluded.title, target = excluded.target,
      description = excluded.description, category = excluded.category, subcategory = excluded.subcategory,
      mouth = excluded.mouth, examples = excluded.examples, syllables = excluded.syllables,
      reading_text = excluded.reading_text, options = excluded.options,
      word_filters = excluded.word_filters, updated_at = excluded.updated_at
  `).run(override.id, override.title, override.target, override.description, override.category,
    override.subcategory, override.mouth, JSON.stringify(override.examples),
    JSON.stringify(override.syllables), override.readingText, JSON.stringify(override.options),
    JSON.stringify(override.wordFilters), Date.now());
  res.json({ override });
});

// Elimina una lecci?n personalizada del profesor o del contenido docente.
app.delete('/api/teacher/lessons/:id', requireTeacherOrAdmin, (req, res) => {
  const lesson = db.prepare('SELECT id, student_id AS studentId, map_position AS mapPosition FROM custom_lessons WHERE id = ?').get(req.params.id);
  if (!lesson) return res.status(404).json({ error: 'No se encontró una lección que puedas borrar.' });

  db.exec('BEGIN');
  try {
    const progress = readProgress(lesson.studentId);
    progress.completedLessons = progress.completedLessons.filter(id => id !== lesson.id);
    writeProgress(lesson.studentId, progress);
    db.prepare('DELETE FROM lesson_results WHERE user_id = ? AND lesson_id = ?').run(lesson.studentId, lesson.id);
    db.prepare('DELETE FROM custom_lessons WHERE id = ?').run(lesson.id);
    db.prepare(`UPDATE custom_lessons SET map_position = map_position - 1
      WHERE student_id = ? AND map_position > ?`).run(lesson.studentId, lesson.mapPosition);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  res.json({ ok: true });
});

// Actualiza una lecci?n del profesor con el contenido nuevo enviado por el cliente.
app.put('/api/teacher/lessons/:id', requireTeacherOrAdmin, (req, res) => {
  const lesson = db.prepare('SELECT id, student_id AS studentId, map_position AS mapPosition FROM custom_lessons WHERE id = ?').get(req.params.id);
  if (!lesson) return res.status(404).json({ error: 'No se encontró esa lección.' });
  const input = normalizeCustomLesson(req.body);
  if (!input) return res.status(400).json({ error: 'Revisa título, descripción, categoría, objetivo, filtros y palabras de la lección.' });
  const student = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'alumno' AND deleted_at IS NULL")
    .get(input.studentId);
  if (!student) return res.status(404).json({ error: 'No se encontró ese alumno activo.' });
  db.exec('BEGIN');
  try {
    if (lesson.studentId === student.id && input.mapPosition < lesson.mapPosition) {
      db.prepare(`UPDATE custom_lessons SET map_position = map_position + 1
        WHERE student_id = ? AND id != ? AND map_position >= ? AND map_position < ?`)
        .run(student.id, lesson.id, input.mapPosition, lesson.mapPosition);
    } else if (lesson.studentId === student.id && input.mapPosition > lesson.mapPosition) {
      db.prepare(`UPDATE custom_lessons SET map_position = map_position - 1
        WHERE student_id = ? AND id != ? AND map_position > ? AND map_position <= ?`)
        .run(student.id, lesson.id, lesson.mapPosition, input.mapPosition);
    } else if (lesson.studentId !== student.id) {
      db.prepare(`UPDATE custom_lessons SET map_position = map_position - 1
        WHERE student_id = ? AND map_position > ?`).run(lesson.studentId, lesson.mapPosition);
      db.prepare(`UPDATE custom_lessons SET map_position = map_position + 1
        WHERE student_id = ? AND map_position >= ?`).run(student.id, input.mapPosition);
    }
    db.prepare(`UPDATE custom_lessons SET student_id = ?, title = ?, description = ?,
      category = ?, subcategory = ?, target = ?, words = ?, emojis = ?, theme = ?,
      word_filters = ?, map_position = ? WHERE id = ?`).run(
      student.id, input.title, input.description, input.category, input.subcategory,
      input.target, JSON.stringify(input.words), JSON.stringify(input.emojis),
      input.theme, JSON.stringify(input.wordFilters), input.mapPosition, lesson.id
    );
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  db.prepare('UPDATE lesson_results SET category = ? WHERE lesson_id = ?').run(input.category, lesson.id);
  res.json({ ok: true });
});

// Crea una nueva lecci?n did?ctica para uso de un alumno o grupo.
app.post('/api/teacher/lessons', requireTeacherOrAdmin, (req, res) => {
  const input = normalizeCustomLesson(req.body);
  if (!input) return res.status(400).json({ error: 'Completa el título, descripción, ubicación, objetivo y entre 2 y 8 palabras válidas con sus emojis.' });
  const student = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'alumno' AND deleted_at IS NULL")
    .get(input.studentId);
  if (!student) return res.status(404).json({ error: 'No se encontró ese alumno activo.' });
  const lesson = {
    id: `c-${crypto.randomUUID()}`,
    title: input.title, description: input.description, category: input.category,
    subcategory: input.subcategory, target: input.target, words: input.words,
    emojis: input.emojis, theme: input.theme, wordFilters: input.wordFilters,
    mapPosition: input.mapPosition
  };
  db.exec('BEGIN');
  try {
    db.prepare(`UPDATE custom_lessons SET map_position = map_position + 1
      WHERE student_id = ? AND map_position >= ?`).run(student.id, lesson.mapPosition);
    db.prepare(`
      INSERT INTO custom_lessons (id, teacher_id, student_id, title, description, category,
        subcategory, target, words, emojis, theme, word_filters, map_position, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(lesson.id, req.user.id, student.id, lesson.title, lesson.description, lesson.category,
      lesson.subcategory, lesson.target, JSON.stringify(lesson.words), JSON.stringify(lesson.emojis),
      lesson.theme, JSON.stringify(lesson.wordFilters), lesson.mapPosition, Date.now());
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  res.status(201).json({ lesson: { ...lesson, isCustom: true } });
});

// Devuelve los juegos personalizados asociados al usuario actual.
app.get('/api/games/custom', requireAuth, (req, res) => {
  const games = req.user.role === 'alumno'
    ? db.prepare(`
      SELECT custom_games.id, custom_games.title,
        CASE WHEN custom_games.activity_type = 'bridge' THEN 'bridge' ELSE custom_games.game_type END AS type,
        custom_games.items,
        custom_games.theme, COALESCE(custom_game_results.attempts, 0) AS attempts,
        custom_game_results.completed_at AS completedAt
      FROM custom_games LEFT JOIN custom_game_results
        ON custom_game_results.game_id = custom_games.id AND custom_game_results.student_id = custom_games.student_id
      WHERE custom_games.student_id = ? ORDER BY custom_games.created_at
    `).all(req.user.id).map(game => ({ ...game, items: JSON.parse(game.items) }))
    : [];
  res.json({ games });
});

// Lista los juegos del profesor para gestionarlos desde el dashboard.
app.get('/api/teacher/games', requireTeacherOrAdmin, (req, res) => {
  const games = req.user.role === 'superadmin'
    ? db.prepare(`
      SELECT custom_games.id, custom_games.title,
        CASE WHEN custom_games.activity_type = 'bridge' THEN 'bridge' ELSE custom_games.game_type END AS type,
        custom_games.items, custom_games.theme, custom_games.student_id AS studentId,
        users.name AS studentName, users.username AS studentUsername
      FROM custom_games JOIN users ON users.id = custom_games.student_id
      ORDER BY custom_games.created_at DESC
    `).all()
    : db.prepare(`
      SELECT custom_games.id, custom_games.title,
        CASE WHEN custom_games.activity_type = 'bridge' THEN 'bridge' ELSE custom_games.game_type END AS type,
        custom_games.items, custom_games.theme, custom_games.student_id AS studentId,
        users.name AS studentName, users.username AS studentUsername
      FROM custom_games JOIN users ON users.id = custom_games.student_id
      WHERE custom_games.teacher_id = ? ORDER BY custom_games.created_at DESC
    `).all(req.user.id);
  res.json({ games: games.map(game => ({ ...game, items: JSON.parse(game.items) })) });
});

// Borra un juego personalizado y sus resultados asociados.
app.delete('/api/teacher/games/:id', requireTeacherOrAdmin, (req, res) => {
  const game = req.user.role === 'superadmin'
    ? db.prepare('SELECT id FROM custom_games WHERE id = ?').get(req.params.id)
    : db.prepare('SELECT id FROM custom_games WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!game) return res.status(404).json({ error: 'No se encontró un juego que puedas borrar.' });
  db.prepare('DELETE FROM custom_games WHERE id = ?').run(game.id);
  res.json({ ok: true });
});

// Crea un juego de tipo puzzle o parejas para un estudiante.
app.post('/api/teacher/games', requireTeacherOrAdmin, (req, res) => {
  const { studentId, title, type = 'puzzle', items, theme = 'orange' } = req.body || {};
  const validThemes = ['violet', 'blue', 'green', 'orange', 'pink'];
  if (typeof studentId !== 'string' || typeof title !== 'string' || title.trim().length < 2 ||
      title.trim().length > 80 || !['puzzle', 'pairs', 'bridge'].includes(type) ||
      !Array.isArray(items) || items.length < 3 || items.length > 12 ||
      items.some(item => !item || typeof item.word !== 'string' ||
        !/^[\p{L}\p{M}]+(?:[ -][\p{L}\p{M}]+)*$/u.test(item.word.trim()) ||
        item.word.trim().length > 40 || typeof item.emoji !== 'string' ||
        !item.emoji.trim() || Array.from(item.emoji).length > 12 ||
        (type === 'bridge' && (typeof item.syllable !== 'string' ||
          !/^[\p{L}\p{M}]{1,12}$/u.test(item.syllable.trim()) ||
          item.syllable.trim().toLocaleLowerCase('es') === item.word.trim().toLocaleLowerCase('es') ||
          !item.word.toLocaleLowerCase('es').includes(item.syllable.trim().toLocaleLowerCase('es'))))) ||
      !validThemes.includes(theme)) {
    return res.status(400).json({ error: 'Escribe un título y añade al menos tres palabras e imágenes válidas; para el puente, indica una sílaba que sea solo una parte de cada palabra.' });
  }
  const student = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'alumno'").get(studentId);
  if (!student) return res.status(404).json({ error: 'No se encontró ese alumno.' });
  const game = {
    id: `g-${crypto.randomUUID()}`,
    title: title.trim(),
    type,
    items: items.map(item => ({
      word: item.word.trim(),
      emoji: item.emoji.trim(),
      ...(type === 'bridge' ? { syllable: item.syllable.trim().toLocaleLowerCase('es') } : {})
    })),
    theme
  };
  db.prepare(`
    INSERT INTO custom_games (id, teacher_id, student_id, title, game_type, items, theme, activity_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(game.id, req.user.id, student.id, game.title,
    game.type === 'bridge' ? 'puzzle' : game.type, JSON.stringify(game.items), game.theme,
    game.type === 'bridge' ? 'bridge' : 'standard', Date.now());
  res.status(201).json({ game });
});

// Guarda la finalizaci?n del juego personalizado del alumno.
app.post('/api/games/custom/:id/complete', requireAuth, (req, res) => {
  if (req.user.role !== 'alumno') return res.status(403).json({ error: 'Solo el alumno asignado puede completar este juego.' });
  const game = db.prepare('SELECT id FROM custom_games WHERE id = ? AND student_id = ?').get(req.params.id, req.user.id);
  if (!game) return res.status(404).json({ error: 'No se encontró ese juego asignado.' });
  db.prepare(`
    INSERT INTO custom_game_results (game_id, student_id, attempts, completed_at)
    VALUES (?, ?, 1, ?) ON CONFLICT(game_id, student_id) DO UPDATE SET
      attempts = custom_game_results.attempts + 1, completed_at = excluded.completed_at
  `).run(game.id, req.user.id, Date.now());
  res.json({ ok: true });
});

// Entrega el progreso del usuario autenticado al cliente.
app.get('/api/progress', requireAuth, (req, res) => {
  res.json(readProgress(req.user.id));
});

// Guarda el progreso del alumno con XP y lecciones completadas.
app.put('/api/progress', requireAuth, (req, res) => {
  const { xp, completedLessons, completedArcadeLevels } = req.body || {};
  if (!Number.isSafeInteger(xp) || xp < 0 || xp > 1_000_000_000 ||
      completedLessons !== undefined || completedArcadeLevels !== undefined) {
    return res.status(400).json({ error: 'El progreso enviado no es válido.' });
  }
  const progress = readProgress(req.user.id);
  progress.xp = xp;
  writeProgress(req.user.id, progress);
  res.json({ ok: true });
});

// Reinicia el progreso del estudiante cuando se solicita un nuevo inicio.
app.post('/api/progress/reset', requireAuth, (req, res) => {
  if (!hasFullAccess(req.user.role)) return res.status(403).json({ error: 'Solo el profesor o superadministrador puede reiniciar el progreso.' });
  const { scope = 'all', lessonId, category } = req.body || {};
  const studentId = req.body?.studentId;
  const validCategories = ['Vocales', 'Consonantes', 'Sílabas', 'Palabras'];
  if (typeof studentId !== 'string' ||
      (scope === 'lesson' && typeof lessonId !== 'string') ||
      (scope === 'section' && !validCategories.includes(category)) ||
      !['all', 'lesson', 'section'].includes(scope)) {
    return res.status(400).json({ error: 'Indica el alumno y el alcance del reinicio.' });
  }
  const selectedLesson = typeof lessonId === 'string'
    ? db.prepare('SELECT id, category FROM custom_lessons WHERE id = ? AND student_id = ?').get(lessonId, studentId)
    : null;
  const student = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'alumno'").get(studentId);
  if (!student) return res.status(404).json({ error: 'No se encontró ese alumno.' });
  if (scope === 'all') {
    writeProgress(studentId, { xp: 0, completedLessons: [], completedArcadeLevels: [] });
    db.prepare('DELETE FROM lesson_results WHERE user_id = ?').run(studentId);
    db.prepare('DELETE FROM custom_game_results WHERE student_id = ?').run(studentId);
  } else {
    let lessonIds;
    if (scope === 'lesson') {
      if (!lessonSequence.includes(lessonId) && !selectedLesson) {
        return res.status(404).json({ error: 'No se encontró esa lección del alumno.' });
      }
      lessonIds = [lessonId];
    } else {
      lessonIds = [
        ...lessonSequence.filter(id => lessonCategory(id) === category),
        ...db.prepare('SELECT id FROM custom_lessons WHERE student_id = ? AND category = ?').all(studentId, category).map(row => row.id)
      ];
    }
    const progress = readProgress(studentId);
    const resetIds = new Set(lessonIds);
    progress.completedLessons = progress.completedLessons.filter(id => !resetIds.has(id));
    writeProgress(studentId, progress);
    const deleteResult = db.prepare('DELETE FROM lesson_results WHERE user_id = ? AND lesson_id = ?');
    for (const id of resetIds) deleteResult.run(studentId, id);
  }
  res.json({ ok: true, progress: readProgress(studentId) });
});

// Marca una actividad como completada y actualiza XP y logros.
app.post('/api/progress/complete', requireAuth, (req, res) => {
  const { type, id, gameId, level } = req.body || {};
  const privileged = hasFullAccess(req.user.role);
  const progress = readProgress(req.user.id);
  let completionId;
  let award;
  let customLesson = null;
  const mistakes = req.body?.mistakes === undefined ? 0 : req.body.mistakes;

  if (type === 'lesson') {
    if (typeof id !== 'string' || !Number.isInteger(mistakes) || mistakes < 0 || mistakes > 100) {
      return res.status(400).json({ error: 'La lección solicitada no es válida.' });
    }
    completionId = id;
    if (!lessonSequence.includes(id)) {
      customLesson = db.prepare('SELECT id, category, student_id FROM custom_lessons WHERE id = ?').get(id);
      if (!customLesson || customLesson.student_id !== req.user.id) {
        return res.status(404).json({ error: 'No se encontró esa lección asignada.' });
      }
    } else if (!privileged && !progress.completedLessons.includes(completionId)) {
      const nextLessonId = lessonSequence.find(lessonId => !progress.completedLessons.includes(lessonId));
      if (nextLessonId !== completionId) {
        return res.status(403).json({ error: 'Completa primero la lección anterior para desbloquear esta.' });
      }
    }
    award = id.startsWith('m') ? 150 : 100;
  } else if (type === 'arcade') {
    if (typeof gameId !== 'string' || !arcadeGameIds.has(gameId) ||
        !Number.isInteger(level) || level < 1 || level > 3) {
      return res.status(400).json({ error: 'El nivel solicitado no es válido.' });
    }
    completionId = `${gameId}-${level}`;
    if (progress.completedArcadeLevels.includes(completionId)) {
      return res.json({ ok: true, progress });
    }
    if (!privileged && level > 1 && !progress.completedArcadeLevels.includes(`${gameId}-${level - 1}`)) {
      return res.status(403).json({ error: 'Completa el nivel anterior de este minijuego para desbloquearlo.' });
    }
    award = 25;
    progress.completedArcadeLevels.push(completionId);
  } else {
    return res.status(400).json({ error: 'El tipo de progreso no es válido.' });
  }

  db.exec('BEGIN IMMEDIATE');
  try {
    const latestProgress = readProgress(req.user.id);
    if (type === 'lesson') {
      if (lessonSequence.includes(completionId) && !latestProgress.completedLessons.includes(completionId)) {
        const nextLessonId = lessonSequence.find(lessonId => !latestProgress.completedLessons.includes(lessonId));
        if (!privileged && nextLessonId !== completionId) {
          db.exec('ROLLBACK');
          return res.status(403).json({ error: 'Completa primero la lección anterior para desbloquear esta.' });
        }
        latestProgress.completedLessons.push(completionId);
        latestProgress.xp = Math.min(1_000_000_000, latestProgress.xp + award);
      }
      const category = customLesson?.category || lessonCategory(completionId);
      if (category) {
        const stars = Math.max(0, 3 - Math.min(3, mistakes));
        const previousResult = db.prepare('SELECT attempts FROM lesson_results WHERE user_id = ? AND lesson_id = ?')
          .get(req.user.id, completionId);
        if (customLesson && !previousResult) latestProgress.xp = Math.min(1_000_000_000, latestProgress.xp + award);
        db.prepare(`
          INSERT INTO lesson_results (user_id, lesson_id, category, attempts, mistakes,
            best_stars, latest_stars, first_stars, retry_stars, points, updated_at)
          VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id, lesson_id) DO UPDATE SET
            attempts = lesson_results.attempts + 1,
            mistakes = lesson_results.mistakes + excluded.mistakes,
            best_stars = MAX(lesson_results.best_stars, excluded.best_stars),
            latest_stars = excluded.latest_stars,
            retry_stars = lesson_results.retry_stars + excluded.retry_stars,
            points = lesson_results.points + excluded.points,
            updated_at = excluded.updated_at
        `).run(req.user.id, completionId, category, mistakes, stars, stars,
          previousResult ? 0 : stars, previousResult ? stars : 0, stars * 10, Date.now());
      }
    } else if (!latestProgress.completedArcadeLevels.includes(completionId)) {
      if (!privileged && level > 1 && !latestProgress.completedArcadeLevels.includes(`${gameId}-${level - 1}`)) {
        db.exec('ROLLBACK');
        return res.status(403).json({ error: 'Completa el nivel anterior de este minijuego para desbloquearlo.' });
      }
      latestProgress.completedArcadeLevels.push(completionId);
      latestProgress.xp = Math.min(1_000_000_000, latestProgress.xp + award);
    }
    writeProgress(req.user.id, latestProgress);
    db.exec('COMMIT');
    res.json({ ok: true, progress: readProgress(req.user.id) });
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
});

// Sirve la p?gina principal de la aplicaci?n para el navegador.
app.get(['/', '/index.html'], (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
// Sirve el archivo JavaScript principal del cliente.
app.get('/script.js', (req, res) => res.sendFile(path.join(__dirname, 'script.js')));
// Entrega el script de protecci?n de sesi?n para la vista del alumno.
app.get('/session-protection.js', (req, res) => res.sendFile(path.join(__dirname, 'session-protection.js')));
// Sirve el reproductor de lecciones que maneja el contenido educativo.
app.get('/lesson-player.js', (req, res) => res.sendFile(path.join(__dirname, 'lesson-player.js')));
// Entrega el dashboard del profesor para gestionar alumnos y contenido.
app.get('/teacher-dashboard.js', (req, res) => res.sendFile(path.join(__dirname, 'teacher-dashboard.js')));
// Sirve el script de juegos personalizados para la interfaz interactiva.
app.get('/custom-games.js', (req, res) => res.sendFile(path.join(__dirname, 'custom-games.js')));
// Entrega el cat?logo de emojis para crear lecciones y juegos.
app.get('/emoji-catalog.js', (req, res) => res.sendFile(path.join(__dirname, 'emoji-catalog.js')));
// Sirve el contenido arcade del proyecto para los minijuegos.
app.get('/arcade-content.js', (req, res) => res.sendFile(path.join(__dirname, 'arcade-content.js')));
// Sirve la hoja de estilos principal para la experiencia visual.
app.get('/style.css', (req, res) => res.sendFile(path.join(__dirname, 'style.css')));
// Env?a un 404 cuando la ruta solicitada no existe en la app.
app.use((req, res) => res.sendStatus(404));
// Maneja errores globales y devuelve una respuesta HTTP ?til al cliente.
app.use((error, req, res, next) => {
  console.error('Error en la solicitud:', error);
  if (res.headersSent) return next(error);
  res.status(error.status || 500).json({ error: error.status === 413 ? 'La solicitud es demasiado grande.' : 'Error interno del servidor.' });
});

// Arranca el servidor HTTP para aceptar conexiones del navegador.
const server = app.listen(port, () => {
  scheduleDatabaseBackup();
  console.log(`LecturaClub disponible en http://localhost:${server.address().port}`);
});
