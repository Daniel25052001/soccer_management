import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Habilitar CORS para permitir peticiones desde Vite (puerto 5173)
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // 2. Si usas prefijo global, asegúrate de que coincida con el frontend
  app.setGlobalPrefix('api');

  await app.listen(3000);
}
bootstrap();