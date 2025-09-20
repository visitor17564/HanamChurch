import * as mssql from 'mssql';
import * as dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USERNAME:', process.env.DB_USERNAME);

const config: mssql.config = {
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || '',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true,
    connectTimeout: 60000,
    requestTimeout: 60000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

export const pool = new mssql.ConnectionPool(config);

// Initialize connection pool
pool
  .connect()
  .then(async () => {
    console.log('MSSQL pool connected successfully');
    
    // 기본 스키마 설정
    try {
      const schemaRequest = pool.request();
      await schemaRequest.query(
        'ALTER USER [visitor-free] WITH DEFAULT_SCHEMA = [hanam-church-database]',
      );
      console.log('Default schema set to hanam-church-database');
    } catch (err) {
      console.log('Schema setting info:', err.message);
    }
    
    // 데이터베이스에 존재하는 테이블 확인
    try {
      const request = pool.request();
      const result = await request.query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE'
      `);
      console.log(
        'Available tables:',
        result.recordset.map((r) => r.TABLE_NAME),
      );
      
      // 스키마 정보도 확인
      const schemaResult = await request.query(`
        SELECT TABLE_SCHEMA, TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE'
      `);
      console.log('Tables with schema:', schemaResult.recordset);
    } catch (err) {
      console.error('Error checking tables:', err.message);
    }
  })
  .catch((err) => {
    console.error('MSSQL pool connection failed:', err);
  });
