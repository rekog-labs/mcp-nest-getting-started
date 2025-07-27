import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('[main.ts] Entering bootstrap');
  const app = await NestFactory.create(AppModule);
  console.log('[main.ts] Nest app created');
  await app.listen(process.env.PORT ?? 3000);
  console.log('[main.ts] App is listening on port', process.env.PORT ?? 3000);
  console.log('[main.ts] Exiting bootstrap');
}
console.log('[main.ts] Calling bootstrap');
void bootstrap();
console.log('[main.ts] bootstrap called');
