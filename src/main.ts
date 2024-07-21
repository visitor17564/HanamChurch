import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { msQuery } from './mssql';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true, //여기에 url을 넣어도된다.
    credentials: true,
  });

  let result = await msQuery('select 1');
  console.log(result);

  await app.listen(3000);
}
bootstrap();
