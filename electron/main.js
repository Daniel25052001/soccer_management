const { app, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { fork } = require('child_process');

// Forzar la creación temprana de la carpeta userData y el archivo de log para evitar errores de ruta
let userDataPath = '';
let logStream = null;

try {
    userDataPath = app.getPath('userData');
    if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true });
    }
    const logPath = path.join(userDataPath, 'backend.log');
    logStream = fs.createWriteStream(logPath, { flags: 'w' });
    logStream.write(`=== Inicio de sesión GolAdmin PWA - ${new Date().toISOString()} ===\n`);
} catch (e) {
    console.error('No se pudo inicializar el logger:', e);
}

// Capturar errores críticos de excepción
process.on('uncaughtException', (error) => {
    const errorMsg = `Error Crítico de Excepción: ${error.stack || error.message}\n`;
    if (logStream) logStream.write(errorMsg);
    dialog.showErrorBox('Error Crítico de Excepción', error.stack || error.message);
    app.quit();
});

let backendProcess = null;

// Función para iniciar el backend y esperar su confirmación por IPC (Proceso hijo)
function startBackend(backendMain, backendWorkingDir, normalizedDbPath) {
    return new Promise((resolve, reject) => {
        backendProcess = fork(backendMain, [], {
            cwd: backendWorkingDir,
            env: {
                ...process.env,
                ELECTRON_RUN_AS_NODE: '1',
                PORT: '3000',
                DATABASE_URL: `file:${normalizedDbPath}`
            },
            stdio: ['pipe', 'pipe', 'pipe', 'ipc']
        });

        backendProcess.stdout.on('data', (data) => {
            if (logStream) logStream.write(`[STDOUT]: ${data.toString()}`);
        });

        backendProcess.stderr.on('data', (data) => {
            if (logStream) logStream.write(`[STDERR]: ${data.toString()}`);
        });

        // Escuchar la señal IPC del backend
        backendProcess.on('message', (msg) => {
            if (msg === 'backend-ready') {
                if (logStream) logStream.write('Backend listo y confirmado vía IPC.\n');
                resolve();
            }
        });

        backendProcess.on('exit', (code) => {
            if (code !== 0 && code !== null) {
                reject(new Error(`El backend terminó con código ${code}`));
            }
        });

        backendProcess.on('error', (err) => {
            reject(err);
        });

        setTimeout(() => {
            reject(new Error('Timeout: El backend no envió la señal de listo.'));
        }, 15000);
    });
}

function createWindow() {
    const { BrowserWindow } = require('electron');
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true
        }
    });

    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
            mainWindow.webContents.toggleDevTools();
            event.preventDefault();
        }
    });

    mainWindow.webContents.on('context-menu', (event, params) => {
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Inspeccionar elemento',
                click: () => { mainWindow.webContents.inspectElement(params.x, params.y); }
            },
            { type: 'separator' },
            { role: 'reload', label: 'Recargar' },
            { role: 'toggleDevTools', label: 'Alternar Herramientas de Desarrollo' }
        ]);
        contextMenu.popup({ window: mainWindow });
    });

    const basePath = app.getAppPath();
    const indexPath = path.join(basePath, 'frontend/dist/index.html');
    mainWindow.loadFile(indexPath);
}

app.whenReady().then(async () => {
    try {
        const basePath = app.getAppPath();
        if (logStream) logStream.write(`App Path: ${basePath}\n`);
        if (logStream) logStream.write(`User Data Path: ${userDataPath}\n`);

        const dbPath = path.join(userDataPath, 'database.db');
        const initialDbInPrisma = path.join(basePath, 'backend/prisma/dev.db');
        const initialDbInRoot = path.join(basePath, 'backend/dev.db');
        const initialDbPath = fs.existsSync(initialDbInPrisma) ? initialDbInPrisma : initialDbInRoot;

        if (!fs.existsSync(dbPath) && fs.existsSync(initialDbPath)) {
            fs.copyFileSync(initialDbPath, dbPath);
            if (logStream) logStream.write(`Base de datos copiada desde ${initialDbPath} a ${dbPath}\n`);
        }

        const backendMain = path.join(basePath, 'backend/dist/main.js');

        if (fs.existsSync(backendMain)) {
            const normalizedDbPath = dbPath.replace(/\\/g, '/');
            const backendWorkingDir = path.join(basePath, 'backend');

            if (logStream) {
                logStream.write(`Lanzando backend desde: ${backendMain}\n`);
                logStream.write(`Directorio de trabajo (cwd): ${backendWorkingDir}\n`);
                logStream.write(`DATABASE_URL: file:${normalizedDbPath}\n`);
            }

            // Lanzar backend y esperar su confirmación IPC
            await startBackend(backendMain, backendWorkingDir, normalizedDbPath);
            if (logStream) logStream.write('Backend conectado exitosamente con el proceso principal de Electron.\n');
        } else {
            throw new Error(`No se encontró el backend en: ${backendMain}`);
        }

        createWindow();
    } catch (error) {
        const errDetails = error.stack || error.message;
        if (logStream) logStream.write(`[FATAL ERROR]: ${errDetails}\n`);
        dialog.showErrorBox('Error al Arrancar la App', errDetails);
        app.quit();
    }
});

app.on('window-all-closed', () => {
    if (backendProcess) backendProcess.kill();
    if (logStream) logStream.end();
    if (process.platform !== 'darwin') app.quit();
});