import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Habilitar CORS tanto para desarrollo (Vite) como para producción (Electron file://)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 2. Prefijo global de la API
  app.setGlobalPrefix('api');

  // 3. Habilitar hooks de cierre limpio para liberar SQLite al cerrar la ventana
  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port, '127.0.0.1');

  // 4. Notificar al proceso principal de Electron mediante IPC que el servidor está listo
  if (process.send) {
    process.send('backend-ready');
  }
}
bootstrap();