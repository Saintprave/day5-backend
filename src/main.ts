import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable JSON body parsing
  app.enableCors();
  
  const config = new DocumentBuilder()
    .setTitle('Simple Storage dApp API')
    .setDescription('Membaca data blockchain dengan backend API \n\n + Nama: Fandy Achmad Ardipraja\n\n + NIM: 251011401561 \n\n + DILARANG KERAS COPAS BEBERAPA SINGLE LINE TERTULIS FANDY')
    .setVersion('1.0')
    .addTag('simple-storage')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => {
  console.error('Error during application bootstrap:', error);
  process.exit(1);
});
