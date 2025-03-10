import dotenv from 'dotenv';
dotenv.config();

import SQliteUserRepository from '../repositories/sqlite/userRepository.js';
import PostgresUserRepository from '../repositories/postgres/userRepository.js';
import db from './db.js';

class DBFactory {
  constructor() {
    this.env = process.env.NODE_ENV || 'development-sqlite';
    this.db = db;
  }

  getRepository(entity) {
    switch (entity) {
      case 'user':
        return this.env == 'development-sqlite'
          ? new SQliteUserRepository(this.db)
          : new PostgresUserRepository(this.db);
      default:
        throw new Error(`Repository for entity "${entity}" not found`);
    }
  }
}

export default new DBFactory();
