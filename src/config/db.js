import dotenv from 'dotenv';
dotenv.config();

import sqlite3Module from 'sqlite3';
const sqlite3 = sqlite3Module.verbose();
import pkg from 'pg';
const { Pool } = pkg;
import DBError from '../errors/dbError.js';

const env = process.env.NODE_ENV || 'development-sqlite';

let db;

if (env === 'development-sqlite') {
  db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
      throw new DBError(err.message);
    } else {
      console.log('Используется SQLite в памяти');
    }
  });
} else if (env === 'development' || env === 'production') {
  console.log('Используется PostgreSQL');
  db = new Pool({
    connectionString: process.env.POSTGRES_URI,
  });
  try {
    const client = await db.connect();
    console.log('Подключено к PostgreSQL');
    client.release();
  } catch (err) {
    throw new DBError(`Ошибка подключения к PostgreSQL: ${err.message}`);
  }
} else {
  throw new Error(`Unknown environment: ${env}`);
}

export default db;
