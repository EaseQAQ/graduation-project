import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 创建数据库连接
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 用户模型
const UserModel = {
  // 创建用户表（首次运行时执行）
  createTable: async () => {
    const connection = await pool.getConnection();
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          email VARCHAR(100) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('Users table created or already exists');
    } catch (error) {
      console.error('Error creating users table:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // 注册新用户
  register: async (username, email, passwordHash) => {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, passwordHash]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // 根据邮箱查找用户
  findByEmail: async (email) => {
    // Debug: Check environment variables when this method is called
    console.log('DB_USER in findByEmail:', process.env.DB_USER);
    console.log('DB_PASSWORD in findByEmail:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
    
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // 根据ID查找用户
  findById: async (id) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
};

export default UserModel;