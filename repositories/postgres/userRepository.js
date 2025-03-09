import BaseUserRepository from "../baseUserRepository.js";
import pkg from "pg";
const { Pool } = pkg;
import UserError from "../../errors/userError.js";

class PostgresUserRepository extends BaseUserRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  // Метод для создания пользователя
  async create(data) {
    const sql = `
      INSERT INTO users (email, fullName, avatarUrl, passwordHash, role, createdAt, updatedAt)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, fullName, avatarUrl, role, createdAt, updatedAt
    `;
    const now = Date.now();
    const values = [
      data.email,
      data.fullName,
      data.avatarUrl || null,
      data.passwordHash,
      data.role || "user",
      now,
      now
    ];

    try {
      const result = await this.pool.query(sql, values);
      return result.rows[0];  // Возвращаем созданного пользователя
    } catch (err) {
      throw new UserError(err.message);
    }
  }

  // Метод для удаления пользователя
  async delete(id) {
    const sql = "DELETE FROM users WHERE id = $1";
    try {
      const result = await this.pool.query(sql, [id]);
      return result.rowCount > 0;  // Возвращаем true, если удаление прошло успешно
    } catch (err) {
      throw new UserError(err.message);
    }
  }

  // Метод для обновления данных пользователя
  async update(id, data) {
    const sql = `
      UPDATE users SET fullName = $1, avatarUrl = $2, role = $3, updatedAt = $4
      WHERE id = $5
      RETURNING id, fullName, avatarUrl, role, updatedAt
    `;
    const now = Date.now();
    const values = [data.fullName, data.avatarUrl, data.role, now, id];

    try {
      const result = await this.pool.query(sql, values);
      return result.rowCount > 0 ? result.rows[0] : null;
    } catch (err) {
      throw new UserError(err.message);
    }
  }

  // Метод для поиска пользователя по id
  async findById(id) {
    const sql = "SELECT * FROM users WHERE id = $1";
    try {
      const result = await this.pool.query(sql, [id]);
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          fullName: row.fullname,
          email: row.email,
          avatarUrl: row.avatarurl,
          role: row.role,
        };
      }
      return null;  // Если пользователь не найден
    } catch (err) {
      throw new UserError(err.message);
    }
  }

  // Метод для поиска пользователя по email
  async findByEmail(email) {
    const sql = "SELECT * FROM users WHERE email = $1";
    try {
      const result = await this.pool.query(sql, [email]);
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          fullName: row.fullname,
          email: row.email,
          avatarUrl: row.avatarurl,
          role: row.role,
          passwordHash: row.passwordhash
        };
      }
      return null;  // Если пользователь не найден
    } catch (err) {
      throw new UserError(err.message);
    }
  }
}

export default PostgresUserRepository;
