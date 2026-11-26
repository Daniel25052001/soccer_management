const { app, dialog, Menu, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const net = require('net');
const { fork, execSync } = require('child_process');

let userDataPath = '';
let logStream = null;
let backendProcess = null;
let mainWindow = null;

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

function writeLog(message) {
    if (logStream && !logStream.destroyed && !logStream.writableEnded) {
        logStream.write(message);
    }
}

function findFreePort(host = '127.0.0.1') {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.unref();
        server.on('error', reject);
        server.listen(0, host, () => {
            const address = server.address();
            const port = typeof address === 'object' && address ? address.port : null;
            server.close((closeErr) => {
                if (closeErr) return reject(closeErr);
                if (!port) return reject(new Error('No se pudo obtener un puerto libre.'));
                resolve(port);
            });
        });
    });
}

function killBackendProcess() {
    if (!backendProcess || backendProcess.killed) return;
    const pid = backendProcess.pid;
    try {
        if (process.platform === 'win32' && pid) {
            execSync(`taskkill /F /T /PID ${pid}`, { stdio: 'ignore' });
        } else {
            backendProcess.kill('SIGTERM');
        }
    } catch (_) {
        try {
            backendProcess.kill();
        } catch (_) { }
    } finally {
        backendProcess = null;
    }
}

process.on('uncaughtException', (error) => {
    const errorMsg = `Error Crítico de Excepción: ${error.stack || error.message}\n`;
    writeLog(errorMsg);
    dialog.showErrorBox('Error Crítico de Excepción', error.stack || error.message);
    killBackendProcess();
    app.quit();
});

function startBackend(backendMain, backendWorkingDir, normalizedDbPath, port) {
    return new Promise((resolve, reject) => {
        let settled = false;
        let recentStderr = '';

        const timer = setTimeout(() => {
            if (settled) return;
            settled = true;
            killBackendProcess();
            const detail = recentStderr.trim() ? `\nDetalle:\n${recentStderr.trim()}` : '';
            reject(new Error(`Timeout: El backend no envió la señal de listo en el puerto ${port}.${detail}`));
        }, 25000);

        const finishResolve = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve();
        };

        const finishReject = (err) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            reject(err);
        };

        backendProcess = fork(backendMain, [], {
            cwd: backendWorkingDir,
            env: {
                ...process.env,
                ELECTRON_RUN_AS_NODE: '1',
                PORT: String(port),
                DATABASE_URL: `file:${normalizedDbPath}`,
            },
            stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        });

        backendProcess.stdout.on('data', (data) => {
            writeLog(`[STDOUT]: ${data.toString()}`);
        });

        backendProcess.stderr.on('data', (data) => {
            const text = data.toString();
            recentStderr = (recentStderr + text).slice(-1500);
            writeLog(`[STDERR]: ${text}`);
        });

        backendProcess.on('message', (msg) => {
            if (msg === 'backend-ready') {
                writeLog(`Backend listo y confirmado vía IPC en el puerto ${port}.\n`);
                finishResolve();
            }
        });

        backendProcess.on('exit', (code) => {
            if (code !== 0 && code !== null) {
                finishReject(new Error(`El backend terminó con código ${code}`));
            }
        });

        backendProcess.on('error', (err) => {
            finishReject(err);
        });
    });
}

function createWindow(apiPort) {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true,
        },
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
                click: () => {
                    mainWindow.webContents.inspectElement(params.x, params.y);
                },
            },
            { type: 'separator' },
            { role: 'reload', label: 'Recargar' },
            { role: 'toggleDevTools', label: 'Alternar Herramientas de Desarrollo' },
        ]);
        contextMenu.popup({ window: mainWindow });
    });

    const basePath = app.getAppPath();
    const indexPath = path.join(basePath, 'frontend/dist/index.html');
    mainWindow.loadFile(indexPath, { query: { apiPort: String(apiPort) } });
}

app.whenReady().then(async () => {
    try {
        const basePath = app.getAppPath();
        writeLog(`App Path: ${basePath}\n`);
        writeLog(`User Data Path: ${userDataPath}\n`);

        const dbPath = path.join(userDataPath, 'database.db');
        const initialDbInPrisma = path.join(basePath, 'backend/prisma/dev.db');
        const initialDbInRoot = path.join(basePath, 'backend/dev.db');
        const initialDbPath = fs.existsSync(initialDbInPrisma) ? initialDbInPrisma : initialDbInRoot;

        if (!fs.existsSync(dbPath) && fs.existsSync(initialDbPath)) {
            fs.copyFileSync(initialDbPath, dbPath);
            writeLog(`Base de datos copiada desde ${initialDbPath} a ${dbPath}\n`);
        }

        const backendMain = path.join(basePath, 'backend/dist/main.js');

        if (!fs.existsSync(backendMain)) {
            throw new Error(`No se encontró el backend en: ${backendMain}`);
        }

        const apiPort = await findFreePort('127.0.0.1');
        const normalizedDbPath = dbPath.replace(/\\/g, '/');
        const backendWorkingDir = path.join(basePath, 'backend');

        writeLog(`Puerto dinámico asignado: ${apiPort}\n`);
        writeLog(`Lanzando backend desde: ${backendMain}\n`);
        writeLog(`Directorio de trabajo (cwd): ${backendWorkingDir}\n`);
        writeLog(`DATABASE_URL: file:${normalizedDbPath}\n`);

        await startBackend(backendMain, backendWorkingDir, normalizedDbPath, apiPort);
        writeLog('Backend conectado exitosamente con el proceso principal de Electron.\n');

        createWindow(apiPort);
    } catch (error) {
        const errDetails = error.stack || error.message;
        writeLog(`[FATAL ERROR]: ${errDetails}\n`);
        dialog.showErrorBox('Error al Arrancar la App', errDetails);
        killBackendProcess();
        app.quit();
    }
});

app.on('window-all-closed', () => {
    killBackendProcess();
    if (logStream && !logStream.writableEnded) {
        logStream.end();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});