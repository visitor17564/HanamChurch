// .env파일의 환경변수를 사용하기 위해 config.ts파일을 만들어줍니다.

const user = process.env.AZURE_SQL_USER;
const password = process.env.AZURE_SQL_PASSWORD;
const server = process.env.AZURE_SQL_SERVER;
const database = process.env.AZURE_SQL_DATABASE;
const port = parseInt(process.env.AZURE_SQL_PORT);
const type = process.env.AZURE_SQL_AUTHENTICATION_TYPE;

export const config = {
  user: 'visitor17564_kakao.com#EXT#@visitor17564kakao.onmicrosoft.com',
  password,
  server,
  port,
  database,
  authentication: {
    type: 'azure-active-directory-password',
  },
  options: {
    encrypt: true,
  },
};

export const config2 = {
  server,
  database,
  options: {
    trustedConnection: true, // Set to true if using Windows Authentication
    trustServerCertificate: true, // Set to true if using self-signed certificates
  },
  driver: 'msnodesqlv8', // Required if using Windows Authentication
};
