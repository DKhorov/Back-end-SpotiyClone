import BaseUserRepository from '../baseUserRepository.js';
import sqlite3 from 'sqlite3';
import UserError from '../../errors/userError.js';

class SQliteUserRepository extends BaseUserRepository {
  constructor(db) {
    super();
    this.db = db;
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        fullName TEXT NOT NULL,
        avatarUrl TEXT,
        passwordHash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'artist', 'admin')) DEFAULT 'user',
        resetPasswordToken TEXT,
        resetPasswordExpires INTEGER,
        createdAt INTEGER, -- Для timestamps
        updatedAt INTEGER  -- Для timestamps
      )
    `);
  }

  async create(data) {
    const sql =
      'INSERT INTO users (email, fullName, avatarUrl, passwordHash, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const now = Date.now();
    return new Promise((resolve, reject) => {
      this.db.run(
        sql,
        [
          data.email,
          data.fullName,
          data.avatarUrl || null,
          data.passwordHash,
          data.role || 'user',
          now,
          now,
        ],
        function (err) {
          if (err) {
            reject(new UserError(err.message));
          } else {
            resolve({
              id: this.lastID,
              email: data.email,
              fullName: data.fullName,
              avatarUrl: data.avatarUrl || null,
              role: data.role,
              createdAt: now,
              updatedAt: now,
            });
          }
        },
      );
    });
  }

  async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    return new Promise((resolve, reject) => {
      this.db.run(sql, [id], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  async update(id, data) {
    // Создаем динамический SQL запрос на основе переданных данных
    const updateFields = [];
    const values = [];

    if (data.fullName !== undefined) {
      updateFields.push('fullName = ?');
      values.push(data.fullName);
    }

    if (data.avatarUrl !== undefined) {
      updateFields.push('avatarUrl = ?');
      values.push(data.avatarUrl);
    }

    if (data.role !== undefined) {
      updateFields.push('role = ?');
      values.push(data.role);
    }

    if (data.passwordHash !== undefined) {
      updateFields.push('passwordHash = ?');
      values.push(data.passwordHash);
    }

    if (data.resetPasswordToken !== undefined) {
      updateFields.push('resetPasswordToken = ?');
      values.push(data.resetPasswordToken);
    }

    if (data.resetPasswordExpires !== undefined) {
      updateFields.push('resetPasswordExpires = ?');
      values.push(data.resetPasswordExpires ? data.resetPasswordExpires.getTime() : null);
    }

    // Добавляем обновление времени
    updateFields.push('updatedAt = ?');
    const now = Date.now();
    values.push(now);

    // Добавляем id в конец массива значений
    values.push(id);

    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;

    return new Promise((resolve, reject) => {
      this.db.run(sql, values, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0 ? { id, ...data } : null);
        }
      });
    });
  }

  async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    return new Promise((resolve, reject) => {
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: row.id,
            fullName: row.fullName,
            email: row.email,
            avatarUrl: row.avatarUrl,
            role: row.role,
          });
        }
      });
    });
  }

  async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    return new Promise((resolve, reject) => {
      this.db.get(sql, [email], (err, row) => {
        if (err) {
          reject(new UserError(err.message));
        } else if (!row) {
          resolve(null);
        } else {
          resolve({
            id: row.id,
            fullName: row.fullName,
            email: row.email,
            avatarUrl: row.avatarUrl,
            role: row.role,
            passwordHash: row.passwordHash,
            resetPasswordToken: row.resetPasswordToken,
            resetPasswordExpires: row.resetPasswordExpires
              ? new Date(row.resetPasswordExpires)
              : null,
          });
        }
      });
    });
  }

  async findByResetToken(token) {
    const sql = 'SELECT * FROM users WHERE resetPasswordToken = ?';
    return new Promise((resolve, reject) => {
      this.db.get(sql, [token], (err, row) => {
        if (err) {
          reject(new UserError(err.message));
        } else if (!row) {
          resolve(null);
        } else {
          resolve({
            id: row.id,
            fullName: row.fullName,
            email: row.email,
            avatarUrl: row.avatarUrl,
            role: row.role,
            passwordHash: row.passwordHash,
            resetPasswordToken: row.resetPasswordToken,
            resetPasswordExpires: row.resetPasswordExpires
              ? new Date(row.resetPasswordExpires)
              : null,
          });
        }
      });
    });
  }

  async findAll() {
    const sql =
      'SELECT id, email, fullName, avatarUrl, role, passwordHash, resetPasswordToken, resetPasswordExpires, createdAt, updatedAt FROM users';
    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(new UserError(err.message));
        } else {
          resolve(
            rows.map((row) => ({
              id: row.id,
              fullName: row.fullName,
              email: row.email,
              avatarUrl: row.avatarUrl,
              role: row.role,
              passwordHash: row.passwordHash,
              resetPasswordToken: row.resetPasswordToken,
              resetPasswordExpires: row.resetPasswordExpires
                ? new Date(row.resetPasswordExpires)
                : null,
              createdAt: row.createdAt,
              updatedAt: row.updatedAt,
            })),
          );
        }
      });
    });
  }
}

export default SQliteUserRepository;
