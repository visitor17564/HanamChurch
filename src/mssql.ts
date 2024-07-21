import { config } from './config';
import { config2 } from './config';
import * as mssql from 'mssql/msnodesqlv8';

export async function msQuery(query: string) {
  const pool = new mssql.ConnectionPool(config2);
  await pool.connect(); //DB 연결
  const result = await pool.query(query); //query 실행
  await pool.close(); //연결 해제

  return result;
}
