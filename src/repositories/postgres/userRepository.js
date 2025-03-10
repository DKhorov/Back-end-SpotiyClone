import BaseUserRepository from '../baseUserRepository.js';
import pkg from 'pg';
const { Pool } = pkg;
import UserError from '../../errors/userError.js';

class PostgresUserRepository extends BaseUserRepository {
  constructor(db) {
    super();
    this.db = db;

    // Создание таблицы, если она не существует
    this.db
      .query(
        `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        fullName TEXT NOT NULL,
        avatarUrl TEXT,
        passwordHash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'artist', 'admin')) DEFAULT 'user',
        resetPasswordToken TEXT,
        resetPasswordExpires BIGINT,
        createdAt BIGINT,
        updatedAt BIGINT
      )
    `,
      )
      .catch((err) => {
        throw new UserError(`Ошибка создания таблицы: ${err.message}`);
      });
  }

  async create(data) {
    const sql = `
      INSERT INTO users (email, fullName, avatarUrl, passwordHash, role, createdAt, updatedAt)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const now = Date.now();
    const values = [
      data.email,
      data.fullName,
      data.avatarUrl || null,
      data.passwordHash,
      data.role || 'user',
      now,
      now,
    ];

    try {
      const result = await this.db.query(sql, values);
      const row = result.rows[0];
      return {
        id: row.id,
        email: row.email,
        fullName: row.fullName,
        avatarUrl: row.avatarurl,
        role: row.role,
        createdAt: row.createdat,
        updatedAt: row.updatedat,
      };
    } catch (err) {
      throw new UserError(err.message);
    }
  }

  async delete(id) {
    const sql = 'DELETE FROM users WHERE id = $1';
    try {
      const result = await this.db.query(sql, [id]);
      return result.rowCount > 0;
    } catch (err) {
      throw new UserError(err.message);
    }
  }

  async update(id, data) {
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (data.fullName !== undefined) {
      updateFields.push(`fullName = $${paramIndex++}`);
      values.push(data.fullName);
    }
    if (data.avatarUrl !== undefined) {
      updateFields.push(`avatarUrl = $${paramIndex++}`);
      values.push(data.avatarUrl);
    }
    if (data.role !== undefined) {
      updateFields.push(`role = $${paramIndex++}`);
      values.push(data.role);
    }
    if (data.passwordHash !== undefined) {
      updateFields.push(`passwordHash = $${paramIndex++}`);
      values.push(data.passwordHash);
    }
    if (data.resetPasswordToken !== undefined) {
      updateFields.push(`resetPasswordToken = $${paramIndex++}`);
      values.push(data.resetPasswordToken);
    }
    if (data.resetPasswordExpires !== undefined) {
      updateFields.push(`resetPasswordExpires = $${paramIndex++}`);
      values.push(data.resetPasswordExpires ? data.resetPasswordExpires.getTime() : null);
    }

    updateFields.push(`updatedAt = $${paramIndex++}`);
    const now = Date.now();
    values.push(now);

    values.push(id); // ID в конец для WHERE
    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;

    try {
      const result = await this.db.query(sql, values);
      if (result.rowCount > 0) {
        return { id, ...data, updatedAt: now };
      }
      return null;
    } catch (err) {
      throw new UserError(err.message);
    }
  }

  async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = $1';
    try {
      const result = await this.db.query(sql, [id]);
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        fullName: row.fullname,
        email: row.email,
        avatarUrl: row.avatarurl,
        role: row.role,
      };
    } catch (err) {
      throw new UserError(err.message);
    }
  }

  async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = $1';
    try {
      const result = await this.db.query(sql, [email]);
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        fullName: row.fullname,
        email: row.email,
        avatarUrl: row.avatarurl,
        role: row.role,
        passwordHash: row.passwordhash,
        resetPasswordToken: row.resetpasswordtoken,
        resetPasswordExpires: row.resetpasswordexpires ? new Date(row.resetpasswordexpires) : null,
      };
    } catch (err) {
      throw new UserError(err.message);
    }
  }

  async findByResetToken(token) {
    const sql = 'SELECT * FROM users WHERE resetPasswordToken = $1';
    try {
      const result = await this.db.query(sql, [token]);
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        fullName: row.fullname,
        email: row.email,
        avatarUrl: row.avatarurl,
        role: row.role,
        passwordHash: row.passwordhash,
        resetPasswordToken: row.resetpasswordtoken,
        resetPasswordExpires: row.resetpasswordexpires ? new Date(row.resetpasswordexpires) : null,
      };
    } catch (err) {
      throw new UserError(err.message);
    }
  }

  async findAll() {
    const sql = 'SELECT * FROM users';
    try {
      const result = await this.db.query(sql);
      return result.rows.map((row) => ({
        id: row.id,
        fullName: row.fullname,
        email: row.email,
        avatarUrl: row.avatarurl,
        role: row.role,
        passwordHash: row.passwordhash,
        resetPasswordToken: row.resetpasswordtoken,
        resetPasswordExpires: row.resetpasswordexpires ? new Date(row.resetpasswordexpires) : null,
        createdAt: row.createdat,
        updatedAt: row.updatedat,
      }));
    } catch (err) {
      throw new UserError(err.message);
    }
  }
}

export default PostgresUserRepository;
