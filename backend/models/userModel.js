import pool from '../db.js';

// 用户模型 - 管理用户数据的CRUD操作
const UserModel = {
  /**
   * 创建用户表 - 如果表不存在则创建
   * 
   * 功能特点：
   * - 使用条件创建（CREATE TABLE IF NOT EXISTS）
   * - 设置主键和唯一约束
   * - 添加时间戳字段记录创建和更新时间
   * - 支持自动更新更新时间
   * - 使用完整Unicode字符集（utf8mb4）
   */
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
      console.log('✅ 用户表创建成功或已存在');
    } catch (error) {
      console.error('❌ 创建用户表错误:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * 注册新用户 - 向数据库中插入新用户记录
   * 
   * @param {string} username - 用户名
   * @param {string} email - 邮箱地址
   * @param {string} passwordHash - 密码哈希值
   * @returns {number} - 新插入记录的自增ID
   * @throws {Error} - 当插入失败时抛出错误
   */
  register: async (username, email, passwordHash) => {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, passwordHash]
      );
      console.log(`✅ 成功注册用户: ${username}, ID: ${result.insertId}`);
      return result.insertId;
    } catch (error) {
      console.error('❌ 注册用户错误:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * 根据邮箱查找用户 - 通过邮箱地址查询用户信息
   * 
   * @param {string} email - 邮箱地址
   * @returns {Object|null} - 找到的用户对象，未找到时返回null
   * @throws {Error} - 当查询失败时抛出错误
   */
  findByEmail: async (email) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      if (rows.length > 0) {
        console.log(`✅ 成功找到邮箱 ${email} 的用户`);
        return rows[0];
      } else {
        console.log(`🔍 未找到邮箱 ${email} 的用户`);
        return null;
      }
    } catch (error) {
      console.error('❌ 根据邮箱查找用户错误:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * 根据ID查找用户 - 通过用户ID查询用户信息
   * 
   * @param {number} id - 用户的唯一标识符
   * @returns {Object|null} - 找到的用户对象，未找到时返回null
   * @throws {Error} - 当查询失败时抛出错误
   */
  findById: async (id) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      
      if (rows.length > 0) {
        console.log(`✅ 成功找到用户ID ${id} 的信息`);
        return rows[0];
      } else {
        console.log(`🔍 未找到用户ID ${id} 的信息`);
        return null;
      }
    } catch (error) {
      console.error('❌ 根据ID查找用户错误:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
};

export default UserModel;