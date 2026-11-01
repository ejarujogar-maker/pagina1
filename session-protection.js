const SESSION_IDLE_LIMIT_MS = 3 * 60 * 1000;
const STUDENT_SESSION_LIMIT_MS = 60 * 60 * 1000;
const STUDENT_BREAK_LIMIT_MS = 15 * 60 * 1000;
const STUDENT_SESSION_STORAGE_PREFIX = 'lecturaclub_student_session_';

let sessionProtectionInterval = null;
let sessionProtectionActivityAt = Date.now();
let sessionProtectionLogoutPending = false;
let sessionProtectionRetryAt = 0;
let activeStudentSessionKey = null;
let activeStudentSession = null;
let studentBreakVisible = false;
let sessionRemoteCheckInterval = null;
let sessionRemoteCheckPending = false;

// Recupera la sesi?n del alumno desde sessionStorage con validaci?n b?sica.
function readStudentSession(key) {
  try {
    const stored = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (stored && Number.isFinite(stored.startedAt) &&
        (stored.breakUntil === null || Number.isFinite(stored.breakUntil))) {
      return stored;
    }
  } catch (error) {
    console.error('No se pudo recuperar el temporizador de descanso:', error);
  }
  return { startedAt: Date.now(), breakUntil: null };
}

// Guarda la sesi?n activa del estudiante para restaurarla al recargar la p?gina.
function saveStudentSession() {
  if (!activeStudentSessionKey || !activeStudentSession) return;
  try {
    sessionStorage.setItem(activeStudentSessionKey, JSON.stringify(activeStudentSession));
  } catch (error) {
    console.error('No se pudo guardar el temporizador de descanso:', error);
  }
}

// Muestra u oculta el bloqueo del descanso y bloquea el resto de la pantalla.
function setRestLockVisible(visible) {
  const lock = document.getElementById('student-rest-lock');
  if (!lock || studentBreakVisible === visible) return;
  studentBreakVisible = visible;
  lock.classList.toggle('hidden', !visible);
  lock.classList.toggle('flex', visible);
  if (visible) {
    // Bloquea el contenido restante para mantener el descanso como foco visible.
    document.body.querySelectorAll(':scope > :not(#student-rest-lock)').forEach(element => {
      element.inert = true;
    });
    lock.focus();
  } else {
    document.body.querySelectorAll(':scope > :not(#student-rest-lock)').forEach(element => {
      element.inert = false;
    });
  }
}

// Actualiza la cuenta regresiva del descanso para que el alumno vea el tiempo restante.
function updateRestLockCountdown(now) {
  const countdown = document.getElementById('student-rest-countdown');
  if (!countdown || !activeStudentSession?.breakUntil) return;
  const remainingSeconds = Math.max(0, Math.ceil((activeStudentSession.breakUntil - now) / 1000));
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = String(remainingSeconds % 60).padStart(2, '0');
  countdown.textContent = `${minutes}:${seconds}`;
}

// Inicia el descanso del estudiante y bloquea la vista mientras termina el tiempo.
function beginStudentBreak(now) {
  activeStudentSession.breakUntil = now + STUDENT_BREAK_LIMIT_MS;
  saveStudentSession();
  setRestLockVisible(true);
  updateRestLockCountdown(now);
}

// Comprueba si la sesi?n expir? o si debe activar el bloqueo del descanso del alumno.
function checkSessionProtection() {
  if (!appState.currentUser) return;
  const now = Date.now();
  if (appState.currentUser.role === 'alumno' && activeStudentSession) {
    if (activeStudentSession.breakUntil) {
      if (activeStudentSession.breakUntil > now) {
        setRestLockVisible(true);
        updateRestLockCountdown(now);
        return;
      }
      activeStudentSession = { startedAt: now, breakUntil: null };
      saveStudentSession();
      sessionProtectionActivityAt = now;
      setRestLockVisible(false);
    }
  }
  if (studentBreakVisible) return;
  if (now - sessionProtectionActivityAt >= SESSION_IDLE_LIMIT_MS) {
    if (sessionProtectionLogoutPending || now < sessionProtectionRetryAt) return;
    sessionProtectionLogoutPending = true;
    handleLogout('idle').then(loggedOut => {
      sessionProtectionLogoutPending = false;
      if (!loggedOut) sessionProtectionRetryAt = Date.now() + 30 * 1000;
    });
    return;
  }
  if (appState.currentUser.role === 'alumno' && activeStudentSession &&
      now - activeStudentSession.startedAt >= STUDENT_SESSION_LIMIT_MS) {
    beginStudentBreak(now);
  }
}

// Consulta el estado remoto de la sesi?n para cerrar la sesi?n si fue invalidada.
async function checkRemoteSession() {
  if (!appState.currentUser || sessionRemoteCheckPending) return;
  sessionRemoteCheckPending = true;
  try {
    const response = await fetch('/api/auth/me');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (!result.user || result.user.id !== appState.currentUser.id) {
      const loggedOut = await handleLogout('remote');
      if (loggedOut) owlSpeak('Tu sesión fue cerrada por el administrador o venció. Inicia sesión para continuar.');
    }
  } catch (error) {
    console.error('No se pudo comprobar el estado remoto de la sesión:', error);
  } finally {
    sessionRemoteCheckPending = false;
  }
}

// Configura los temporizadores de inactividad y descanso al iniciar sesi?n o cambiar de usuario.
function initializeSessionProtection() {
  clearInterval(sessionProtectionInterval);
  sessionProtectionInterval = null;
  activeStudentSessionKey = null;
  activeStudentSession = null;
  setRestLockVisible(false);
  sessionProtectionLogoutPending = false;
  sessionProtectionRetryAt = 0;
  sessionProtectionActivityAt = Date.now();
  if (!appState.currentUser) return;

  if (appState.currentUser.role === 'alumno') {
    activeStudentSessionKey = `${STUDENT_SESSION_STORAGE_PREFIX}${appState.currentUser.id}`;
    activeStudentSession = readStudentSession(activeStudentSessionKey);
    saveStudentSession();
  }
  sessionProtectionInterval = setInterval(checkSessionProtection, 1000);
  clearInterval(sessionRemoteCheckInterval);
  sessionRemoteCheckInterval = appState.currentUser ? setInterval(checkRemoteSession, 20000) : null;
  checkSessionProtection();
}

// Detiene todos los temporizadores cuando el usuario cierra sesi?n o cambia de contexto.
function stopSessionProtection() {
  clearInterval(sessionProtectionInterval);
  clearInterval(sessionRemoteCheckInterval);
  sessionProtectionInterval = null;
  sessionRemoteCheckInterval = null;
  activeStudentSessionKey = null;
  activeStudentSession = null;
  sessionProtectionLogoutPending = false;
  setRestLockVisible(false);
}

// Reinicia el contador de inactividad cuando detecta interacci?n del usuario.
function recordSessionActivity() {
  if (!appState.currentUser || studentBreakVisible) return;
  sessionProtectionActivityAt = Date.now();
}

// Registra los eventos que indican que el usuario sigue activo en la p?gina.
['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart', 'wheel',
  'click', 'input', 'change', 'focusin', 'dragstart', 'drop'].forEach(eventName => {
  document.addEventListener(eventName, () => {
    recordSessionActivity();
  }, { passive: true });
});

// Vuelve a validar la sesi?n cuando la pesta?a vuelve a estar visible.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) checkSessionProtection();
});
