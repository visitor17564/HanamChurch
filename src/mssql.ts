import { config } from './config';
import mysql from 'mysql2/promise';

export const pool = mysql.createPool(config);
console.log('pool created');
