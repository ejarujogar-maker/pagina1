const assert = require('node:assert/strict');
const net = require('node:net');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { after, test } = require('node:test');

const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'lecturaclub-test-'));
const sentMail = [];
const smtpServer = net.createServer(socket => {
  socket.write('220 localhost ESMTP\r\n');
  let buffer = '';
  let messageLines = null;
  let authState = '';
  socket.on('data', chunk => {
    buffer += chunk.toString();
    while (buffer.includes('\r\n')) {
      const end = buffer.indexOf('\r\n');
      const line = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      if (messageLines) {
        if (line === '.') {
          sentMail.push(messageLines.join('\n'));
          messageLines = null;
          socket.write('250 Message accepted\r\n');
        } else {
          messageLines.push(line.startsWith('..') ? line.slice(1) : line);
        }
      } else if (authState === 'username' || authState === 'password') {
        if (authState === 'username') {
          authState = 'password';
          socket.write('334 UGFzc3dvcmQ6\r\n');
        } else {
          authState = '';
          socket.write('235 Authentication successful\r\n');
        }
      } else if (/^EHLO\b|^HELO\b/i.test(line)) {
        socket.write('250-localhost\r\n250-AUTH PLAIN LOGIN\r\n250 SIZE 10485760\r\n');
      } else if (/^AUTH PLAIN\b/i.test(line)) {
        socket.write('235 Authentication successful\r\n');
      } else if (/^AUTH LOGIN\b/i.test(line)) {
        authState = 'username';
        socket.write('334 VXNlcm5hbWU6\r\n');
      } else if (/^(MAIL FROM|RCPT TO):/i.test(line)) {
        socket.write('250 OK\r\n');
      } else if (/^DATA$/i.test(line)) {
        messageLines = [];
        socket.write('354 End data with <CR><LF>.<CR><LF>\r\n');
      } else if (/^RSET$/i.test(line)) {
        socket.write('250 OK\r\n');
      } else if (/^QUIT$/i.test(line)) {
        socket.write('221 Bye\r\n');
        socket.end();
      } else {
        socket.write('250 OK\r\n');
      }
    }
  });
});

let child;
const smtpReady = new Promise((resolve, reject) => {
  smtpServer.once('error', reject);
  smtpServer.listen(0, '127.0.0.1', resolve);
});
const serverReady = smtpReady.then(() => new Promise((resolve, reject) => {
  child = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
    cwd: tempDirectory,
    env: {
      ...process.env,
      PORT: '0',
      DATABASE_PATH: path.join(tempDirectory, 'test.db'),
      NODE_ENV: 'test',
      EMAIL_DOMAIN_CHECK: 'skip',
      BASE_URL: 'http://localhost',
      SMTP_HOST: '127.0.0.1',
      SMTP_PORT: String(smtpServer.address().port),
      SMTP_REQUIRE_TLS: 'false',
      SMTP_USER: 'test-user',
      SMTP_PASSWORD: 'test-password',
      ADMIN_EMAIL: 'admin@example.test',
      ADMIN_PASSWORD: 'SuperAdmin-password-2026',
      ADMIN_NAME: 'Administrador de prueba',
      ADMIN_USERNAME: 'admin_test'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  const timeout = setTimeout(() => reject(new Error(`Servidor no inició:\n${output}`)), 20000);
  child.stdout.on('data', data => {
    output += data.toString();
    const match = output.match(/http:\/\/localhost:(\d+)/);
    if (match) {
      clearTimeout(timeout);
      resolve(`http://localhost:${match[1]}`);
    }
  });
  child.stderr.on('data', data => { output += data.toString(); });
  child.once('exit', code => {
    clearTimeout(timeout);
    reject(new Error(`Servidor terminó con código ${code}:\n${output}`));
  });
}));

after(async () => {
  if (child && child.exitCode === null) {
    child.kill();
    await new Promise(resolve => child.once('exit', resolve));
  }
  await new Promise(resolve => smtpServer.close(resolve));
  fs.rmSync(tempDirectory, { recursive: true, force: true });
});

async function request(origin, route, body, headers = {}) {
  return fetch(`${origin}${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });
}

function mailCode(message) {
  const decoded = message
    .replace(/=\r?\n/g, '')
    .replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  const match = decoded.match(/es:\s*(\d{6})/i);
  assert.ok(match, 'Expected a six-digit verification code in delivered mail.');
  return match[1];
}

function mailToken(message, type) {
  const decoded = message
    .replace(/=\r?\n/g, '')
    .replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  const match = decoded.match(new RegExp(`http://localhost(?::\\d+)?/\\?${type}=([A-Za-z0-9_-]+)`));
  assert.ok(match, `Expected ${type} link in delivered mail.`);
  return match[1];
}

test('registration requires delivered email confirmation, and password reset revokes sessions', async () => {
  const origin = await serverReady;
  const invalidName = await request(origin, '/api/auth/register', {
    name: 'Alumno2',
    email: 'nombre-invalido@example.test',
    username: 'nombre_invalido',
    role: 'alumno',
    password: 'Contraseña-segura-123'
  });
  assert.equal(invalidName.status, 400);
  const shortName = await request(origin, '/api/auth/register', {
    name: 'Ana R',
    email: 'nombre-corto@example.test',
    username: 'ana_ruiz',
    role: 'alumno',
    password: 'Contraseña-segura-123'
  });
  assert.equal(shortName.status, 400);
  const shortUsername = await request(origin, '/api/auth/register', {
    name: 'Estudiante Demo',
    email: 'usuario-corto@example.test',
    username: 'abc',
    role: 'alumno',
    password: 'Contraseña-segura-123'
  });
  assert.equal(shortUsername.status, 400);
  const weakPassword = await request(origin, '/api/auth/register', {
    name: 'Alumno Demo',
    email: 'clave-debil@example.test',
    username: 'clave_debil',
    role: 'alumno',
    password: 'contraseña123'
  });
  assert.equal(weakPassword.status, 400);

  const registration = await request(origin, '/api/auth/register', {
    name: 'Estudiante Demo',
    email: 'alumno@example.test',
    username: 'alumno_demo',
    role: 'alumno',
    password: 'Contraseña-segura-123'
  });
  const registrationResult = await registration.json();
  assert.equal(registration.status, 202, JSON.stringify(registrationResult));
  assert.equal(registration.headers.get('set-cookie'), null);
  assert.match(registrationResult.message, /código de seis dígitos/i);
  assert.equal(sentMail.length, 1);
  const testDatabase = new DatabaseSync(path.join(tempDirectory, 'test.db'));
  try {
    const storedPassword = testDatabase.prepare(
      'SELECT password_hash, password_salt FROM users WHERE username = ?'
    ).get('alumno_demo');
    assert.match(storedPassword.password_hash, /^[a-f0-9]{128}$/);
    assert.match(storedPassword.password_salt, /^[a-f0-9]{32}$/);
    assert.notEqual(storedPassword.password_hash, 'Contraseña-segura-123');
  } finally {
    testDatabase.close();
  }

  const invalidAddress = await request(origin, '/api/auth/register', {
    name: 'Correo Inválido',
    email: 'x-no-es-correo',
    username: 'correo_invalido',
    role: 'alumno',
    password: 'Contraseña-segura-123'
  });
  assert.equal(invalidAddress.status, 400);

  const unverifiedLogin = await request(origin, '/api/auth/login', {
    identifier: 'alumno@example.test',
    password: 'Contraseña-segura-123'
  });
  assert.equal(unverifiedLogin.status, 403);
  const unverifiedLoginResult = await unverifiedLogin.json();
  assert.equal(unverifiedLoginResult.requiresEmailVerification, true);
  assert.equal(unverifiedLoginResult.email, 'alumno@example.test');
  assert.equal(unverifiedLogin.headers.get('set-cookie'), null);
  assert.match(unverifiedLoginResult.error, /nuevo código/i);
  assert.equal(sentMail.length, 2);

  const code = mailCode(sentMail[1]);
  const wrongCodeValue = code === '000000' ? '000001' : '000000';
  const wrongCode = await request(origin, '/api/auth/verify-email', { email: 'alumno@example.test', code: wrongCodeValue });
  assert.equal(wrongCode.status, 400);
  const verified = await request(origin, '/api/auth/verify-email', { email: 'alumno@example.test', code });
  assert.equal(verified.status, 200, JSON.stringify(await verified.json()));
  const verifiedAgain = await request(origin, '/api/auth/verify-email', { email: 'alumno@example.test', code });
  assert.equal(verifiedAgain.status, 400);

  const login = await request(origin, '/api/auth/login', {
    identifier: 'alumno_demo',
    password: 'Contraseña-segura-123'
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.getSetCookie()[0].split(';')[0];

  const saved = await fetch(`${origin}/api/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ xp: 125, completedLessons: ['l1', 'l2'], completedArcadeLevels: ['bubbles-1'] })
  });
  assert.equal(saved.status, 400);
  const lockedLesson = await fetch(`${origin}/api/progress/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ type: 'lesson', id: 'l2' })
  });
  assert.equal(lockedLesson.status, 403);
  const lockedLevel = await fetch(`${origin}/api/progress/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ type: 'arcade', gameId: 'bubbles', level: 2 })
  });
  assert.equal(lockedLevel.status, 403);
  for (const body of [
    { type: 'lesson', id: 'l1' },
    { type: 'lesson', id: 'l2' },
    { type: 'arcade', gameId: 'bubbles', level: 1 }
  ]) {
    const completion = await fetch(`${origin}/api/progress/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify(body)
    });
    assert.equal(completion.status, 200, JSON.stringify(await completion.json()));
  }
  const secondBrowserLogin = await request(origin, '/api/auth/login', {
    identifier: 'alumno@example.test',
    password: 'Contraseña-segura-123'
  });
  assert.equal(secondBrowserLogin.status, 200);
  const secondBrowserCookie = secondBrowserLogin.headers.getSetCookie()[0].split(';')[0];
  assert.notEqual(secondBrowserCookie, cookie);
  const secondBrowserSession = await fetch(`${origin}/api/auth/me`, {
    headers: { Cookie: secondBrowserCookie }
  });
  const secondBrowserAccount = await secondBrowserSession.json();
  assert.equal(secondBrowserSession.status, 200);
  assert.equal(secondBrowserAccount.progress.xp, 225);
  assert.deepEqual(secondBrowserAccount.progress.completedLessons, ['l1', 'l2']);
  assert.deepEqual(secondBrowserAccount.progress.completedArcadeLevels, ['bubbles-1']);

  const recovery = await request(origin, '/api/auth/forgot-password', { identifier: 'alumno@example.test' });
  assert.equal(recovery.status, 200);
  assert.equal(sentMail.length, 3);
  const resetToken = mailToken(sentMail[2], 'token');
  const rejectedReset = await request(origin, '/api/auth/reset-password', {
    token: resetToken,
    password: 'contraseña123'
  });
  assert.equal(rejectedReset.status, 400);
  const reset = await request(origin, '/api/auth/reset-password', {
    token: resetToken,
    password: 'Nueva-Contraseña-segura-456'
  });
  assert.equal(reset.status, 200);
  assert.equal((await fetch(`${origin}/api/progress`, { headers: { Cookie: cookie } })).status, 401);
  for (const email of ['desconocido1@example.test', 'desconocido2@example.test']) {
    assert.equal((await request(origin, '/api/auth/forgot-password', { identifier: email })).status, 200);
  }
  assert.equal((await request(origin, '/api/auth/forgot-password', { identifier: 'desconocido3@example.test' })).status, 429);

  const newLogin = await request(origin, '/api/auth/login', {
    identifier: 'alumno@example.test',
    password: 'Nueva-Contraseña-segura-456'
  });
  assert.equal(newLogin.status, 200);
  const studentCookie = newLogin.headers.getSetCookie()[0].split(';')[0];
  const progress = await fetch(`${origin}/api/auth/me`, { headers: { Cookie: studentCookie } });
  const account = await progress.json();
  assert.equal(account.user.emailVerified, true);
  assert.equal(account.progress.xp, 225);
  assert.deepEqual(account.progress.completedLessons, ['l1', 'l2']);
  assert.deepEqual(account.progress.completedArcadeLevels, ['bubbles-1']);

  const forbiddenAdminList = await fetch(`${origin}/api/admin/users`, { headers: { Cookie: studentCookie } });
  assert.equal(forbiddenAdminList.status, 403);
  const forbiddenRoleChange = await fetch(`${origin}/api/admin/users/${account.user.id}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
    body: JSON.stringify({ role: 'profesor' })
  });
  assert.equal(forbiddenRoleChange.status, 403);
  assert.equal((await fetch(`${origin}/api/admin/users/${account.user.id}/permanent`, {
    method: 'DELETE', headers: { Cookie: studentCookie }
  })).status, 403);

  const adminLogin = await request(origin, '/api/auth/login', {
    identifier: 'admin_test',
    password: 'SuperAdmin-password-2026'
  });
  assert.equal(adminLogin.status, 200);
  const adminCookie = adminLogin.headers.getSetCookie()[0].split(';')[0];
  const adminFullLesson = await fetch(`${origin}/api/progress/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ type: 'lesson', id: 'b47' })
  });
  assert.equal(adminFullLesson.status, 200);
  const adminFullArcade = await fetch(`${origin}/api/progress/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ type: 'arcade', gameId: 'snake', level: 3 })
  });
  assert.equal(adminFullArcade.status, 200);
  const userList = await fetch(`${origin}/api/admin/users`, { headers: { Cookie: adminCookie } });
  assert.equal(userList.status, 200);
  const listed = await userList.json();
  assert.equal(listed.users.length, 2);
  assert.equal(listed.users.find(user => user.username === 'admin_test').role, 'superadmin');

  const invalidRoleChange = await fetch(`${origin}/api/admin/users/${account.user.id}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ role: 'superadmin' })
  });
  assert.equal(invalidRoleChange.status, 400);
  const protectedSuperAdminRoleChange = await fetch(`${origin}/api/admin/users/${listed.currentUserId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ role: 'alumno' })
  });
  assert.equal(protectedSuperAdminRoleChange.status, 400);
  const promoteAccount = await fetch(`${origin}/api/admin/users/${account.user.id}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ role: 'profesor' })
  });
  assert.equal(promoteAccount.status, 200);
  assert.equal((await promoteAccount.json()).role, 'profesor');
  const demoteAccount = await fetch(`${origin}/api/admin/users/${account.user.id}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ role: 'alumno' })
  });
  assert.equal(demoteAccount.status, 200);
  assert.equal((await demoteAccount.json()).role, 'alumno');

  const createdAccountResponse = await request(origin, '/api/admin/users', {
    name: 'Cuenta Gestionada',
    email: 'gestionada@example.test',
    username: 'gestionada_demo',
    role: 'alumno',
    password: 'Cuenta-Segura-2026!'
  }, { Cookie: adminCookie });
  assert.equal(createdAccountResponse.status, 201);
  const managedUser = (await createdAccountResponse.json()).user;
  assert.equal(managedUser.emailVerified, true);
  const managedLogin = await request(origin, '/api/auth/login', {
    identifier: managedUser.username, password: 'Cuenta-Segura-2026!'
  });
  const managedCookie = managedLogin.headers.getSetCookie()[0].split(';')[0];
  assert.equal(managedLogin.status, 200);
  const closeSessions = await fetch(`${origin}/api/admin/users/${managedUser.id}/sessions`, {
    method: 'DELETE', headers: { Cookie: adminCookie }
  });
  assert.equal((await closeSessions.json()).closedSessions, 1);
  assert.equal((await fetch(`${origin}/api/auth/me`, { headers: { Cookie: managedCookie } })).status, 200);
  assert.equal((await (await fetch(`${origin}/api/auth/me`, { headers: { Cookie: managedCookie } })).json()).user, null);

  const managedRelogin = await request(origin, '/api/auth/login', {
    identifier: managedUser.username, password: 'Cuenta-Segura-2026!'
  });
  const managedCookieAfterReLogin = managedRelogin.headers.getSetCookie()[0].split(';')[0];
  const blocked = await fetch(`${origin}/api/admin/users/${managedUser.id}/access`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ blocked: true })
  });
  assert.equal(blocked.status, 200);
  assert.equal((await (await fetch(`${origin}/api/auth/me`, {
    headers: { Cookie: managedCookieAfterReLogin }
  })).json()).user, null);
  assert.equal((await request(origin, '/api/auth/login', {
    identifier: managedUser.username, password: 'Cuenta-Segura-2026!'
  })).status, 403);
  assert.equal((await fetch(`${origin}/api/admin/users/${managedUser.id}/access`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ blocked: false })
  })).status, 200);

  const softDelete = await fetch(`${origin}/api/admin/users/${managedUser.id}`, {
    method: 'DELETE', headers: { Cookie: adminCookie }
  });
  assert.equal(softDelete.status, 200);
  const deletedUser = await (await fetch(`${origin}/api/admin/users`, {
    headers: { Cookie: adminCookie }
  })).json();
  assert.ok(deletedUser.users.find(user => user.id === managedUser.id).deletedAt);
  assert.equal((await request(origin, '/api/auth/login', {
    identifier: managedUser.username, password: 'Cuenta-Segura-2026!'
  })).status, 401);
  assert.equal((await fetch(`${origin}/api/admin/users/${managedUser.id}/restore`, {
    method: 'POST', headers: { Cookie: adminCookie }
  })).status, 200);
  const restoredLogin = await request(origin, '/api/auth/login', {
    identifier: managedUser.username, password: 'Cuenta-Segura-2026!'
  });
  assert.equal(restoredLogin.status, 200);
  const restoredCookie = restoredLogin.headers.getSetCookie()[0].split(';')[0];
  const managedProgress = await fetch(`${origin}/api/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: restoredCookie },
    body: JSON.stringify({ xp: 75 })
  });
  assert.equal(managedProgress.status, 200);
  const permanentDelete = await fetch(`${origin}/api/admin/users/${managedUser.id}/permanent`, {
    method: 'DELETE',
    headers: { Cookie: adminCookie }
  });
  assert.equal(permanentDelete.status, 200);
  assert.equal((await permanentDelete.json()).permanentlyDeleted, true);
  assert.equal((await (await fetch(`${origin}/api/auth/me`, {
    headers: { Cookie: restoredCookie }
  })).json()).user, null);
  assert.equal((await request(origin, '/api/auth/login', {
    identifier: managedUser.username, password: 'Cuenta-Segura-2026!'
  })).status, 401);
  const permanentList = await (await fetch(`${origin}/api/admin/users`, {
    headers: { Cookie: adminCookie }
  })).json();
  assert.equal(permanentList.users.some(user => user.id === managedUser.id), false);
  const permanentDatabase = new DatabaseSync(path.join(tempDirectory, 'test.db'));
  try {
    assert.equal(permanentDatabase.prepare('SELECT COUNT(*) AS count FROM users WHERE id = ?').get(managedUser.id).count, 0);
    assert.equal(permanentDatabase.prepare('SELECT COUNT(*) AS count FROM progress WHERE user_id = ?').get(managedUser.id).count, 0);
    assert.equal(permanentDatabase.prepare('SELECT COUNT(*) AS count FROM sessions WHERE user_id = ?').get(managedUser.id).count, 0);
  } finally {
    permanentDatabase.close();
  }

  const selfDelete = await fetch(`${origin}/api/admin/users/${listed.currentUserId}`, {
    method: 'DELETE',
    headers: { Cookie: adminCookie }
  });
  assert.equal(selfDelete.status, 400);
  assert.equal((await fetch(`${origin}/api/admin/users/${listed.currentUserId}/permanent`, {
    method: 'DELETE', headers: { Cookie: adminCookie }
  })).status, 400);

  const logout = await fetch(`${origin}/api/auth/logout`, {
    method: 'POST',
    headers: { Cookie: studentCookie }
  });
  assert.equal(logout.status, 200);
  assert.equal((await fetch(`${origin}/api/progress`, {
    headers: { Cookie: studentCookie }
  })).status, 401);
  const relogin = await request(origin, '/api/auth/login', {
    identifier: 'alumno_demo',
    password: 'Nueva-Contraseña-segura-456'
  });
  assert.equal(relogin.status, 200);
  const reloginCookie = relogin.headers.getSetCookie()[0].split(';')[0];
  const reloginSession = await fetch(`${origin}/api/auth/me`, {
    headers: { Cookie: reloginCookie }
  });
  const reloginAccount = await reloginSession.json();
  assert.equal(reloginAccount.progress.xp, 225);
  assert.deepEqual(reloginAccount.progress.completedLessons, ['l1', 'l2']);
  assert.deepEqual(reloginAccount.progress.completedArcadeLevels, []);
  const replayLevelTwo = await fetch(`${origin}/api/progress/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: reloginCookie },
    body: JSON.stringify({ type: 'arcade', gameId: 'bubbles', level: 2 })
  });
  assert.equal(replayLevelTwo.status, 403);

  const deleted = await fetch(`${origin}/api/admin/users/${account.user.id}`, {
    method: 'DELETE',
    headers: { Cookie: adminCookie }
  });
  assert.equal(deleted.status, 200);

  const lastAdminDelete = await fetch(`${origin}/api/admin/users/${listed.currentUserId}`, {
    method: 'DELETE',
    headers: { Cookie: adminCookie }
  });
  assert.equal(lastAdminDelete.status, 400);
  await new Promise(resolve => setTimeout(resolve, 1200));
  const backupPath = path.join(tempDirectory, 'registro_dos.db');
  assert.ok(fs.statSync(backupPath).size > 0);
  const backupDatabase = new DatabaseSync(backupPath);
  assert.equal(backupDatabase.prepare('SELECT role FROM users WHERE username = ?').get('admin_test').role, 'superadmin');
  backupDatabase.close();
});

test('login has generic errors and rate limiting; private project files stay unavailable', async () => {
  const origin = await serverReady;
  assert.equal((await fetch(origin)).status, 200);
  assert.equal((await fetch(`${origin}/api/progress`)).status, 401);
  assert.equal((await request(origin, '/api/progress/complete', { type: 'arcade', gameId: 'bubbles', level: 1 })).status, 401);
  const genericErrors = [];
  for (const [index, identifier] of ['no-existe@example.test', 'admin_test'].entries()) {
    const wrongLogin = await request(origin, '/api/auth/login', {
      identifier,
      password: 'Contraseña-incorrecta-1'
    }, { 'X-Forwarded-For': `198.51.100.${10 + index}` });
    assert.equal(wrongLogin.status, 401);
    genericErrors.push((await wrongLogin.json()).error);
  }
  assert.deepEqual(genericErrors, ['Usuario o contraseña incorrectos.', 'Usuario o contraseña incorrectos.']);

  for (let attempt = 0; attempt < 5; attempt++) {
    const failed = await request(origin, '/api/auth/login', {
      identifier: 'limite@example.test',
      password: 'Contraseña-incorrecta-1'
    }, { 'X-Forwarded-For': '198.51.100.99' });
    assert.equal(failed.status, 401);
  }
  const throttled = await request(origin, '/api/auth/login', {
    identifier: 'limite@example.test',
    password: 'Contraseña-incorrecta-1'
  }, { 'X-Forwarded-For': '198.51.100.99' });
  assert.equal(throttled.status, 429);

  for (const url of [
    '/registro.db', '/server.js', '/package.json', '/package-lock.json',
    '/node_modules/express/package.json', '/test/server.test.js', '/libro-mi-jardinpdf.pdf'
  ]) {
    assert.equal((await fetch(`${origin}${url}`)).status, 404, `${url} must not be public`);
  }
  assert.equal((await fetch(`${origin}/script.js`)).status, 200);
  assert.equal((await fetch(`${origin}/session-protection.js`)).status, 200);
  assert.equal((await fetch(`${origin}/lesson-player.js`)).status, 200);
  assert.equal((await fetch(`${origin}/teacher-dashboard.js`)).status, 200);
  assert.equal((await fetch(`${origin}/custom-games.js`)).status, 200);
  assert.equal((await fetch(`${origin}/teacher-dashboard.js`)).status, 200);
  assert.equal((await fetch(`${origin}/custom-games.js`)).status, 200);
  assert.equal((await fetch(`${origin}/emoji-catalog.js`)).status, 200);
  assert.equal((await fetch(`${origin}/arcade-content.js`)).status, 200);
  assert.equal((await fetch(`${origin}/pedagogical-content.js`)).status, 200);
  assert.equal((await fetch(`${origin}/style.css`)).status, 200);
  const homepage = await (await fetch(origin)).text();
  assert.ok(homepage.indexOf('arcade-content.js') < homepage.indexOf('script.js'));
  assert.ok(homepage.indexOf('pedagogical-content.js') < homepage.indexOf('script.js'));
  assert.ok(homepage.indexOf('session-protection.js') < homepage.indexOf('script.js'));
  assert.match(homepage, />15:00</);
  assert.ok(homepage.indexOf('lesson-player.js') < homepage.indexOf('script.js'));
  assert.match(homepage, /id="emoji-picker-modal"/);
  assert.match(homepage, /id="custom-lesson-map-position"/);
  assert.match(homepage, /value="bridge">El puente de los bloques mágicos/);
});

test('professors and superadministrators can complete any lesson and arcade level', async () => {
  const origin = await serverReady;
  const registration = await request(origin, '/api/auth/register', {
    name: 'Profesora Demo',
    email: 'profesora@example.test',
    username: 'profesora_demo',
    role: 'profesor',
    password: 'Contraseña-segura-123'
  });
  assert.equal(registration.status, 202, JSON.stringify(await registration.json()));
  const code = mailCode(sentMail[sentMail.length - 1]);
  assert.equal((await request(origin, '/api/auth/verify-email', {
    email: 'profesora@example.test',
    code
  })).status, 200);
  const login = await request(origin, '/api/auth/login', {
    identifier: 'profesora_demo',
    password: 'Contraseña-segura-123'
  });
  assert.equal(login.status, 200);
  const teacherCookie = login.headers.getSetCookie()[0].split(';')[0];
  for (const body of [
    { type: 'lesson', id: 'b47' },
    { type: 'lesson', id: 'c-ma' },
    { type: 'arcade', gameId: 'fishing', level: 3 }
  ]) {
    const completion = await fetch(`${origin}/api/progress/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: teacherCookie },
      body: JSON.stringify(body)
    });
    assert.equal(completion.status, 200, JSON.stringify(await completion.json()));
  }
  const teacherProgress = await (await fetch(`${origin}/api/progress`, {
    headers: { Cookie: teacherCookie }
  })).json();
  assert.ok(teacherProgress.lessonResults.some(result =>
    result.lessonId === 'c-ma' && result.category === 'Lecturas'
  ));

  const studentRegistration = await request(origin, '/api/auth/register', {
    name: 'Alumno Personalizado',
    email: 'alumno-personalizado@example.test',
    username: 'alumno_personalizado',
    role: 'alumno',
    password: 'Contraseña-segura-123'
  }, { 'X-Forwarded-For': '198.51.100.220' });
  assert.equal(studentRegistration.status, 202);
  const studentCode = mailCode(sentMail[sentMail.length - 1]);
  assert.equal((await request(origin, '/api/auth/verify-email', {
    email: 'alumno-personalizado@example.test',
    code: studentCode
  }, { 'X-Forwarded-For': '198.51.100.220' })).status, 200);
  const studentLogin = await request(origin, '/api/auth/login', {
    identifier: 'alumno_personalizado',
    password: 'Contraseña-segura-123'
  });
  assert.equal(studentLogin.status, 200);
  const studentCookie = studentLogin.headers.getSetCookie()[0].split(';')[0];

  const studentsResponse = await fetch(`${origin}/api/teacher/students`, { headers: { Cookie: teacherCookie } });
  assert.equal(studentsResponse.status, 200);
  const students = await studentsResponse.json();
  const student = students.students.find(item => item.username === 'alumno_personalizado');
  assert.ok(student);
  const assigned = await fetch(`${origin}/api/teacher/lessons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: teacherCookie },
    body: JSON.stringify({
      studentId: student.id, title: 'Práctica de la vocal A', category: 'Vocales',
      subcategory: 'Vocales', description: 'Escucha y lee la vocal A.',
      target: 'A', words: ['avión', 'abeja', 'árbol'], mapPosition: 1,
      wordFilters: { level: 'intermediate', syllables: 'two', targetPosition: 'start', structure: 'simple' }
    })
  });
  assert.equal(assigned.status, 201);
  const customLesson = (await assigned.json()).lesson;
  assert.deepEqual(customLesson.emojis, ['✨', '✨', '✨']);
  assert.equal(customLesson.description, 'Escucha y lee la vocal A.');
  assert.equal(customLesson.subcategory, 'Vocales');
  assert.equal(customLesson.mapPosition, 1);
  assert.deepEqual(customLesson.wordFilters, {
    level: 'intermediate', syllables: 'two', targetPosition: 'start', structure: 'simple'
  });
  assert.equal((await fetch(`${origin}/api/teacher/students`, { headers: { Cookie: studentCookie } })).status, 403);
  assert.equal((await fetch(`${origin}/api/teacher/lessons`, { headers: { Cookie: studentCookie } })).status, 403);
  const customList = await fetch(`${origin}/api/lessons/custom`, { headers: { Cookie: studentCookie } });
  assert.deepEqual((await customList.json()).lessons.map(lesson => lesson.id), [customLesson.id]);
  const customBeforePrerequisite = await fetch(`${origin}/api/progress/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
    body: JSON.stringify({ type: 'lesson', id: customLesson.id })
  });
  assert.equal(customBeforePrerequisite.status, 403);
  assert.match((await customBeforePrerequisite.json()).error, /lección oficial/);
  const editCustomLesson = await fetch(`${origin}/api/teacher/lessons/${customLesson.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: teacherCookie },
    body: JSON.stringify({
      studentId: student.id, title: 'Práctica A editada',
      description: 'Descripción actualizada.', category: 'Vocales',
      subcategory: 'Vocales', target: 'A',
      words: ['avión', 'abeja', 'árbol'], emojis: customLesson.emojis, mapPosition: 1,
      theme: 'violet', wordFilters: { level: 'basic', syllables: 'two', targetPosition: 'start', structure: 'simple' }
    })
  });
  assert.equal(editCustomLesson.status, 200);
  const experienceResponse = await fetch(`${origin}/api/teacher/students/${student.id}/experience`, {
    headers: { Cookie: teacherCookie }
  });
  assert.equal(experienceResponse.status, 200);
  assert.equal((await experienceResponse.json()).lessons[0].description, 'Descripción actualizada.');

  const catalogEdit = await fetch(`${origin}/api/teacher/lessons/catalog/l1`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: teacherCookie },
    body: JSON.stringify({
      title: 'Vocal A editada', target: 'A', description: 'Abre la boca para decir A.',
      category: 'Vocales', subcategory: 'Vocales', examples: [
        { w: 'Avión', emoji: '✈️' }, { w: 'Abeja', emoji: '🐝' }, { w: 'Árbol', emoji: '🌳' }
      ],
      syllables: [], readingText: '', options: ['A', 'E', 'O'],
      wordFilters: { level: 'basic', syllables: 'any', targetPosition: 'any', structure: 'any' }
    })
  });
  assert.equal(catalogEdit.status, 200);
  const overridesResponse = await fetch(`${origin}/api/lessons/overrides`, { headers: { Cookie: studentCookie } });
  assert.equal((await overridesResponse.json()).overrides[0].title, 'Vocal A editada');

  for (const mistakes of [1, 0]) {
    const completion = await fetch(`${origin}/api/progress/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
      body: JSON.stringify({ type: 'lesson', id: 'l1', mistakes })
    });
    assert.equal(completion.status, 200);
    if (mistakes === 1) {
      const lessonAfterCustomPosition = await fetch(`${origin}/api/progress/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
        body: JSON.stringify({ type: 'lesson', id: 'l2' })
      });
      assert.equal(lessonAfterCustomPosition.status, 403);
    }
  }
  const customCompletion = await fetch(`${origin}/api/progress/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
    body: JSON.stringify({ type: 'lesson', id: customLesson.id, mistakes: 2 })
  });
  assert.equal(customCompletion.status, 200);

  const gameAssignment = await fetch(`${origin}/api/teacher/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: teacherCookie },
    body: JSON.stringify({
      studentId: student.id, title: 'Animales lectores', type: 'pairs', theme: 'blue',
      items: [{ word: 'gato', emoji: '🐱' }, { word: 'perro', emoji: '🐶' }, { word: 'pato', emoji: '🦆' }]
    })
  });
  assert.equal(gameAssignment.status, 201);
  const customGame = (await gameAssignment.json()).game;
  const bridgeAssignment = await fetch(`${origin}/api/teacher/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: teacherCookie },
    body: JSON.stringify({
      studentId: student.id, title: 'Puente mágico', type: 'bridge', theme: 'blue',
      items: [
        { word: 'gato', emoji: '🐱', syllable: 'ga' },
        { word: 'perro', emoji: '🐶', syllable: 'pe' },
        { word: 'pato', emoji: '🦆', syllable: 'pa' }
      ]
    })
  });
  assert.equal(bridgeAssignment.status, 201);
  const bridgeGame = (await bridgeAssignment.json()).game;
  assert.equal(bridgeGame.type, 'bridge');
  assert.equal(bridgeGame.items[0].syllable, 'ga');
  const invalidBridgeAssignment = await fetch(`${origin}/api/teacher/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: teacherCookie },
    body: JSON.stringify({
      studentId: student.id, title: 'Puente inválido', type: 'bridge',
      items: [
        { word: 'gato', emoji: '🐱', syllable: 'pe' },
        { word: 'perro', emoji: '🐶', syllable: 'pe' },
        { word: 'pato', emoji: '🦆', syllable: 'pa' }
      ]
    })
  });
  assert.equal(invalidBridgeAssignment.status, 400);
  const wholeWordBridgeAssignment = await fetch(`${origin}/api/teacher/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: teacherCookie },
    body: JSON.stringify({
      studentId: student.id, title: 'Puente sin espacio', type: 'bridge',
      items: [
        { word: 'gato', emoji: '🐱', syllable: 'gato' },
        { word: 'perro', emoji: '🐶', syllable: 'pe' },
        { word: 'pato', emoji: '🦆', syllable: 'pa' }
      ]
    })
  });
  assert.equal(wholeWordBridgeAssignment.status, 400);
  const noStudentLessons = await fetch(`${origin}/api/teacher/lessons`, { headers: { Cookie: teacherCookie } });
  assert.deepEqual((await noStudentLessons.json()).lessons, []);
  const createdLessons = await fetch(`${origin}/api/teacher/lessons?studentId=${student.id}`, { headers: { Cookie: teacherCookie } });
  assert.deepEqual((await createdLessons.json()).lessons.map(lesson => lesson.id), [customLesson.id]);
  const noStudentGames = await fetch(`${origin}/api/teacher/games`, { headers: { Cookie: teacherCookie } });
  assert.deepEqual((await noStudentGames.json()).games, []);
  const createdGames = await fetch(`${origin}/api/teacher/games?studentId=${student.id}`, { headers: { Cookie: teacherCookie } });
  const teacherGames = (await createdGames.json()).games;
  assert.deepEqual(new Set(teacherGames.map(game => game.id)), new Set([customGame.id, bridgeGame.id]));
  assert.equal(teacherGames.find(game => game.id === bridgeGame.id).type, 'bridge');
  assert.equal((await fetch(`${origin}/api/teacher/games`, { headers: { Cookie: studentCookie } })).status, 403);
  assert.equal((await fetch(`${origin}/api/teacher/lessons/${customLesson.id}`, {
    method: 'DELETE', headers: { Cookie: studentCookie }
  })).status, 403);
  const studentGamesResponse = await fetch(`${origin}/api/games/custom`, { headers: { Cookie: studentCookie } });
  const assignedGames = (await studentGamesResponse.json()).games;
  assert.deepEqual(new Set(assignedGames.map(game => game.id)), new Set([customGame.id, bridgeGame.id]));
  assert.equal(assignedGames.find(game => game.id === bridgeGame.id).items[1].syllable, 'pe');
  const teacherGamesResponse = await fetch(`${origin}/api/games/custom`, { headers: { Cookie: teacherCookie } });
  assert.deepEqual((await teacherGamesResponse.json()).games, []);
  const gameCompletion = await fetch(`${origin}/api/games/custom/${customGame.id}/complete`, {
    method: 'POST', headers: { Cookie: studentCookie }
  });
  assert.equal(gameCompletion.status, 200);

  const reportResponse = await fetch(`${origin}/api/teacher/students/${student.id}/progress`, {
    headers: { Cookie: teacherCookie }
  });
  assert.equal(reportResponse.status, 200);
  const report = await reportResponse.json();
  assert.deepEqual(report.sections.map(section => section.category), ['Vocales', 'Consonantes', 'Sílabas', 'Palabras', 'Lecturas']);
  const vowels = report.sections[0];
  assert.equal(vowels.attempts, 3);
  assert.equal(vowels.repetitions, 1);
  assert.equal(vowels.points, 60);
  assert.equal(vowels.weightedScore, 67);
  assert.equal(report.customLessons[0].id, customLesson.id);
  assert.equal(report.lessons.find(lesson => lesson.lessonId === 'l1').latestStars, 3);
  assert.equal(report.lessons.find(lesson => lesson.lessonId === 'l1').firstStars, 2);
  assert.equal(report.lessons.find(lesson => lesson.lessonId === 'l1').retryStars, 3);
  assert.equal(report.lessons.find(lesson => lesson.lessonId === customLesson.id).latestStars, 1);
  assert.equal(report.customLessons[0].mapPosition, 1);
  assert.equal(report.customGames.find(game => game.id === customGame.id).attempts, 1);

  const unauthorizedReset = await request(origin, '/api/progress/reset', {
    studentId: student.id, scope: 'all'
  }, { Cookie: studentCookie });
  assert.equal(unauthorizedReset.status, 403);
  const missingStudentReset = await request(origin, '/api/progress/reset', {
    scope: 'lesson', lessonId: 'l1'
  }, { Cookie: teacherCookie });
  assert.equal(missingStudentReset.status, 400);
  const resetCustomLesson = await request(origin, '/api/progress/reset', {
    studentId: student.id, scope: 'lesson', lessonId: customLesson.id
  }, { Cookie: teacherCookie });
  assert.equal(resetCustomLesson.status, 200);
  const afterLessonReset = await (await fetch(`${origin}/api/teacher/students/${student.id}/progress`, {
    headers: { Cookie: teacherCookie }
  })).json();
  assert.equal(afterLessonReset.lessons.some(lesson => lesson.lessonId === customLesson.id), false);
  assert.equal(afterLessonReset.lessons.find(lesson => lesson.lessonId === 'l1').attempts, 2);

  const resetVowels = await request(origin, '/api/progress/reset', {
    studentId: student.id, scope: 'section', category: 'Vocales'
  }, { Cookie: teacherCookie });
  assert.equal(resetVowels.status, 200);
  const afterSectionReset = await (await fetch(`${origin}/api/teacher/students/${student.id}/progress`, {
    headers: { Cookie: teacherCookie }
  })).json();
  assert.equal(afterSectionReset.lessons.some(lesson => lesson.lessonId === 'l1'), false);
  assert.equal(afterSectionReset.customGames.find(game => game.id === customGame.id).attempts, 1);

  const resetAll = await request(origin, '/api/progress/reset', {
    studentId: student.id, scope: 'all'
  }, { Cookie: teacherCookie });
  assert.equal(resetAll.status, 200);
  assert.equal((await resetAll.json()).progress.xp, 0);
  const afterAllReset = await (await fetch(`${origin}/api/teacher/students/${student.id}/progress`, {
    headers: { Cookie: teacherCookie }
  })).json();
  assert.equal(afterAllReset.customGames.find(game => game.id === customGame.id).attempts, 0);

  const syllableAssignment = await fetch(`${origin}/api/teacher/lessons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: teacherCookie },
    body: JSON.stringify({
      studentId: student.id, title: 'Refuerzo de sílaba MA', category: 'Sílabas',
      subcategory: 'Sílabas directas', target: 'MA',
      words: ['mamá', 'mapa', 'mano'], mapPosition: 0
    })
  });
  assert.equal(syllableAssignment.status, 201);
  const syllableLesson = (await syllableAssignment.json()).lesson;
  const lockedCustomLesson = await fetch(`${origin}/api/progress/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
    body: JSON.stringify({ type: 'lesson', id: syllableLesson.id })
  });
  assert.equal(lockedCustomLesson.status, 403);
  assert.match((await lockedCustomLesson.json()).error, /lección oficial/);

  const deleteLesson = await fetch(`${origin}/api/teacher/lessons/${customLesson.id}`, {
    method: 'DELETE', headers: { Cookie: teacherCookie }
  });
  assert.equal(deleteLesson.status, 200);
  assert.equal((await fetch(`${origin}/api/teacher/lessons/${syllableLesson.id}`, {
    method: 'DELETE', headers: { Cookie: teacherCookie }
  })).status, 200);
  const deleteGame = await fetch(`${origin}/api/teacher/games/${customGame.id}`, {
    method: 'DELETE', headers: { Cookie: teacherCookie }
  });
  assert.equal(deleteGame.status, 200);
  const deleteBridgeGame = await fetch(`${origin}/api/teacher/games/${bridgeGame.id}`, {
    method: 'DELETE', headers: { Cookie: teacherCookie }
  });
  assert.equal(deleteBridgeGame.status, 200);
  const deletedLessonList = await (await fetch(`${origin}/api/teacher/lessons`, {
    headers: { Cookie: teacherCookie }
  })).json();
  const deletedGameList = await (await fetch(`${origin}/api/teacher/games`, {
    headers: { Cookie: teacherCookie }
  })).json();
  assert.deepEqual(deletedLessonList.lessons, []);
  assert.deepEqual(deletedGameList.games, []);
});
