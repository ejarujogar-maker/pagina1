# Leópolis

## Requisitos

- Node.js 22.13 o posterior (incluye `node:sqlite`).
- npm.

## Iniciar en local

```powershell
npm install
npm start
```

Abre `http://localhost:3000`. La base SQLite se crea como `registro.db` en la carpeta del proyecto y sus rutas y archivos auxiliares no se publican. El servidor actualiza automáticamente una copia consistente en `registro_dos.db` al iniciar, después de cambios y cada cinco minutos. `DATABASE_BACKUP_PATH` permite elegir otra ubicación para la copia. No abras `index.html` directamente: el inicio de sesión y el guardado de progreso requieren el servidor.

Para activar el registro verificado y la recuperación por correo, copia `.env.example` como `.env` (`Copy-Item .env.example .env` en PowerShell) y completa los datos de una cuenta SMTP. `npm start` carga ese archivo automáticamente. Sin credenciales SMTP configuradas, no se permiten nuevos registros: así no se crean cuentas sin confirmar. La plantilla deja las contraseñas SMTP y los datos del superadministrador vacíos intencionalmente.

### Correo gratuito desde tu computadora: Gmail

Para una aplicación pequeña puedes probar con una cuenta Gmail remitente, sin comprar un dominio:

1. Activa la verificación en dos pasos de esa cuenta de Google.
2. Genera una contraseña de aplicación en [Contraseñas de aplicación de Google](https://myaccount.google.com/apppasswords). Si Google no ofrece esta opción, no uses la contraseña normal de tu cuenta.
3. En `.env`, configura `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, y utiliza la dirección Gmail completa tanto en `SMTP_USER` como en `SMTP_FROM`. Guarda la contraseña de aplicación en `SMTP_PASSWORD`.
4. Reinicia `npm start`.

La contraseña de aplicación se mantiene solo en `.env`, que está excluido de Git. Google documenta SMTP con TLS en el puerto 587 y requiere verificación en dos pasos para crear contraseñas de aplicación. Para cuentas personales con poco volumen es una opción sin coste adicional; el envío y sus límites dependen de Google. Para más volumen, usa un proveedor transaccional y su dominio remitente verificado.

El registro comprueba que el dominio tenga un servicio de correo (registros MX) y envía un código de seis dígitos de un solo uso que caduca en 10 minutos. Se escribe junto con el correo en la página para activar la cuenta; los intentos fallidos y el reenvío tienen límites temporales. Solo después de verificar el correo se puede iniciar sesión.

Las cuentas nuevas verificadas pueden ser de alumno o profesor. Por seguridad, el formulario público no permite crear superadministradores. El acceso inicial al panel de superadministrador se crea al iniciar la aplicación con `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_USERNAME` definidos en `.env`:

```powershell
$env:ADMIN_EMAIL = "admin@ejemplo.com"
$env:ADMIN_PASSWORD = "una-frase-secreta-de-al-menos-12-caracteres"
$env:ADMIN_NAME = "Administración"
$env:ADMIN_USERNAME = "admin"
npm start
```

El usuario administrador se crea solo si ese correo aún no existe y queda marcado como verificado. Para entrar, inicia sesión usando su correo o nombre de usuario y la contraseña configurados; el botón **Usuarios** permite crear cuentas, cambiar roles, bloquear y desbloquear el acceso, cerrar sesiones activas, y eliminar o restaurar cuentas sin borrar sus datos. No puedes cambiar el rol del superadministrador desde ese panel, eliminar tu propia cuenta ni eliminar el último superadministrador. Guarda las credenciales fuera del repositorio.

La página y el mapa de lecciones se pueden consultar sin cuenta. Los minijuegos requieren iniciar sesión. Los alumnos desbloquean las lecciones y desafíos de repaso en orden y comienzan con el nivel 1 de cada minijuego; al completar un nivel se abre el siguiente. Profesores y superadministradores pueden abrir cualquier lección y desafío de repaso aunque no hayan completado los anteriores. Las instrucciones de cada paso y los desafíos se leen en voz alta mientras la opción de voz esté activada. El servidor valida cada avance y no acepta listas de progreso modificadas desde el navegador.

Las lecciones registran cada intento, errores, estrellas obtenidas en el primer intento y en los reintentos, mejor resultado y puntos por sección. Un error reduce una estrella (hasta cero); el reporte conserva también el ranking de las lecciones más repetidas. Los alumnos ven una barra visual sin porcentajes; el profesor y el superadministrador pueden consultar el detalle en **Avances**.

El panel **Avances** permite a profesores y superadministradores elegir un alumno, asignarle una lección con descripción, palabras, emojis y ubicación pedagógica, y consultar su reporte. Los emojis se eligen en un catálogo visual por categorías con búsqueda; la posición de cada lección puede configurarse antes de una lección del mapa o al final. Consonantes y sílabas tienen tres subsecciones; palabras ofrece filtros por dificultad, número de sílabas, posición del sonido y estructura. El profesor y el superadministrador también pueden editar las lecciones existentes del catálogo y las lecciones asignadas. Las lecciones personalizadas aparecen en el mapa del alumno y sus intentos se guardan en SQLite. El recorrido colorea en verde el tramo completado y coloca al Mono Sabio sobre el próximo módulo.

En los módulos de creación, quien enseña puede probar lecciones y juegos sin guardar resultados, editar el contenido y abrir temporalmente la vista de un alumno. Además de rompecabezas y memoria de parejas, se puede crear **El puente de los bloques mágicos**: cada reto anuncia una palabra y el alumno elige o arrastra al puente su sílaba objetivo. El modo de alumno es de solo prueba: su progreso temporal no modifica la cuenta real. El panel docente y el superadministrador pueden gestionar el contenido de lecciones existente.

Cada fase de una lección requiere completar correctamente su actividad antes de avanzar. Los avisos de bloqueo se leen en voz alta aunque el control general de voz esté apagado.

Tras 3 minutos sin actividad, la sesión iniciada se cierra automáticamente y se solicita iniciar sesión de nuevo. Después de una hora desde el inicio de sesión, la cuenta de alumno queda bloqueada durante 15 minutos con un aviso para descansar la vista y salir a pasear; al terminar la pausa puede continuar. El temporizador de descanso se conserva al recargar la página en la misma pestaña.

La interfaz usa el esquema visual infantil de `guia_de_colores_para_aprendizaje_infantil.txt`: azul claro para lectura y concentración, morado para acciones, naranja para desafíos y recompensas, y verde para progreso y respuestas correctas. Las letras y opciones de práctica se muestran en tamaño grande.

El Arcade contiene diez minijuegos con tres niveles. Sus bancos de letras, sílabas y palabras están en `arcade-content.js`; cada partida extrae opciones al azar sin repetir distractores ni perder la respuesta correcta. Las palabras se forman con sílabas seleccionadas de listas didácticas para cada nivel. Las pruebas de estos bancos están en `test/arcade-content.test.js`.

En el registro, el nombre completo debe tener al menos 8 caracteres y admite letras (incluidas letras acentuadas), espacios, apóstrofes y guiones, pero no números. El nombre de usuario debe tener entre 4 y 30 caracteres. La contraseña para crear una cuenta y para restablecerla debe tener entre 10 y 128 caracteres, con al menos una mayúscula, una minúscula, un número y un carácter especial. El formulario permite elegir entre alumno y profesor; cada cuenta de profesor tiene acceso completo a lecciones y minijuegos.

## Recuperación de contraseña

El SMTP configurado para verificar los correos también envía las recuperaciones. El token se genera aleatoriamente, se almacena como hash, vence a los 30 minutos y cierra las sesiones existentes al cambiar la contraseña.

```powershell
$env:BASE_URL = "https://lecturaclub.ejemplo.com"
$env:SMTP_HOST = "smtp.ejemplo.com"
$env:SMTP_PORT = "587"
$env:SMTP_USER = "usuario-smtp"
$env:SMTP_PASSWORD = "secreto-smtp"
$env:SMTP_FROM = "Leópolis <no-reply@ejemplo.com>"
```

La plantilla `.env.example` contiene los nombres de variables. No guardes contraseñas SMTP en el repositorio.

## Despliegue en servidor

Ejecuta `npm start` detrás de un proxy inverso (por ejemplo, Caddy o Nginx) con un certificado HTTPS válido. En producción, establece `NODE_ENV=production`, configura `BASE_URL` con `https://` y `TRUST_PROXY=1` solo cuando el servidor esté detrás de exactamente un proxy inverso confiable. El servidor redirige solicitudes HTTP a HTTPS y marca la cookie de sesión como `Secure`, `HttpOnly` y `SameSite=Lax`.

También configura `REQUEST_HASH_SECRET` con al menos 32 caracteres aleatorios (por ejemplo, generados con `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`). No publiques este valor ni las credenciales SMTP o de administrador.

Conserva el volumen de `registro.db` al redeplegar y haz copias de seguridad consistentes de SQLite. En una plataforma con almacenamiento efímero, configura `DATABASE_PATH` para apuntar a un volumen persistente fuera del directorio público. No expongas directamente el puerto de la aplicación a Internet cuando el proxy TLS sea el encargado de HTTPS.

Las contraseñas se derivan con scrypt; el servidor guarda solo el hash y la sal, no una contraseña cifrada que luego pueda descifrarse. Al iniciar sesión desde otro dispositivo, el servidor compara la contraseña que escribes con ese hash; cada dispositivo crea su propia sesión. Para que funcione, todos los dispositivos deben acceder a la misma aplicación alojada y a su base de datos. Las sesiones son tokens aleatorios guardados como hashes en SQLite. El progreso, los intentos fallidos, las verificaciones y las recuperaciones también se gestionan en la base de datos.

El superadministrador y el profesor tienen acceso completo a las lecciones y minijuegos. Quien visita la página sin iniciar sesión puede avanzar por las lecciones en orden, pero no puede acceder al Arcade de minijuegos. Las cuentas de alumno también siguen el desbloqueo secuencial.

En la configuración local, `DATABASE_PATH=registro.db` hace que las cuentas y el progreso se guarden en el archivo `registro.db` de la carpeta del proyecto, incluso si el servidor se inicia desde otro directorio. Un valor absoluto de `DATABASE_PATH` sigue permitiendo usar un volumen persistente externo. Todos los navegadores deben abrir la misma dirección de la aplicación para consultar esa misma base; cada navegador inicia su propia sesión con la cuenta.

## URL pública

Para publicar la aplicación hace falta desplegarla en una cuenta de hosting y configurar un dominio o utilizar el subdominio que ofrece el hosting. `BASE_URL` debe coincidir exactamente con la URL HTTPS pública para que los enlaces de verificación y recuperación funcionen. La aplicación está preparada para un servidor Node.js con un volumen persistente; no es posible generar una URL pública antes de elegir y configurar ese hosting.
# pagina1
