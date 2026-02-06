import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
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

// 收藏模型
const FavoriteModel = {
  // 创建收藏表
  createTable: async () => {
    const connection = await pool.getConnection();
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS favorites (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          character_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_character (user_id, character_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('Favorites table created or already exists');
    } catch (error) {
      console.error('Error creating favorites table:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // 添加收藏
  addFavorite: async (userId, characterId) => {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO favorites (user_id, character_id) VALUES (?, ?)',
        [userId, characterId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // 取消收藏
  removeFavorite: async (userId, characterId) => {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM favorites WHERE user_id = ? AND character_id = ?',
        [userId, characterId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // 检查是否已收藏
  isFavorite: async (userId, characterId) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM favorites WHERE user_id = ? AND character_id = ?',
        [userId, characterId]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking favorite:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // 获取用户所有收藏
  getUserFavorites: async (userId) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT character_id FROM favorites WHERE user_id = ?',
        [userId]
      );
      return rows.map(row => row.character_id);
    } catch (error) {
      console.error('Error getting user favorites:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
};

// 导出模型对象
export { FavoriteModel as default };