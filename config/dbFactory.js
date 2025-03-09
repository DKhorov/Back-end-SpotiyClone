import dotenv from 'dotenv';
dotenv.config();

import pkg from "pg";
const { Pool } = pkg;
import PostgresUserRepository from "../repositories/postgres/userRepository.js";

class DBFactory {
  constructor() {
    this.env = process.env.NODE_ENV || "development";
    
    this.pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      ssl: this.env === "production" ? { rejectUnauthorized: false } : false,
    });
    console.log(process.env.PSQL_URL)
    this.pool.connect()
      .then(() => console.log("Подключено к PostgreSQL"))
      .catch((err) => console.error("Ошибка подключения к PostgreSQL:", err));
  }

  getRepository(entity) {
    switch (entity) {
      case "user":
        return new PostgresUserRepository(this.pool);
      default:
        throw new Error(`Repository for entity "${entity}" not found`);
    }
  }
}

export default new DBFactory();
