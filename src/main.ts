import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do CORS
  app.enableCors({
    origin: (origin, callback) => {
        const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://salamanager.endrioalberton.com.br'];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, origin);
        } else {
            callback(new Error('Não permitido pelo CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
});

  // Adiciona o prefixo /api em todas as rotas
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('API de Gerenciamento de Salas')
    .setDescription('API para gerenciamento de salas de aula')
    .setVersion('1.0')
    .addTag('classrooms')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap(); 
