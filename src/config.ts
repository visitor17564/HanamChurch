import dotenv from 'dotenv';
dotenv.config();

// .env파일의 환경변수를 사용하기 위해 config.ts파일을 만들어줍니다.
const user = process.env.AZURE_SQL_USER;
const password = process.env.AZURE_SQL_PASSWORD;
const host = process.env.AZURE_SQL_HOST;
const database = process.env.AZURE_SQL_DATABASE;
const port = parseInt(process.env.AZURE_SQL_PORT);

export const config = {
  host,
  user,
  password,
  database,
  port,
};
