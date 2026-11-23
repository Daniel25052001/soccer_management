const path = require('path');
const fs = require('fs');

// Configurar directorios seguros para producción en Windows
const appDataPath = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');
const userDataPath = path.join(appDataPath, 'goladmin-desktop');

if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
}

const dbPath = path.join(userDataPath, 'database.db');
const initialDbPath = path.join(__dirname, 'backend/prisma/dev.db');

if (!fs.existsSync(dbPath) && fs.existsSync(initialDbPath)) {
    fs.copyFileSync(initialDbPath, dbPath);
}

// Inyectar la variable de entorno de Prisma antes de arrancar NestJS
process.env.DATABASE_URL = `file:${dbPath}`;
process.env.PORT = '3000';

// Requerir el backend compilado de NestJS
require('./backend/dist/main.js');