import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import { IoAdapter } from '@nestjs/platform-socket.io';
// import * as http from 'http';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalGuards();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Image Generated')
    .setDescription('The Image Generate API description')
    .addBearerAuth()
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(5000);
  Logger.log(`Application listening on port 5000`);

  // const httpServer = http.createServer(app.getHttpAdapter().getInstance());
  // app.useWebSocketAdapter(new IoAdapter(httpServer));
}
bootstrap();
