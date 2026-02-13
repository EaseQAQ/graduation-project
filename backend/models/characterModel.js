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

// 角色模型
const CharacterModel = {
  // 创建角色表
  createTable: async () => {
    const connection = await pool.getConnection();
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS characters (
          id int NOT NULL AUTO_INCREMENT,
          name varchar(255) NOT NULL,
          element varchar(50) NOT NULL,
          weapon varchar(50) NOT NULL,
          rarity int NOT NULL,
          region varchar(50) NOT NULL,
          description text,
          image varchar(255) DEFAULT NULL,
          normal_attack varchar(255) DEFAULT NULL,
          elemental_skill varchar(255) DEFAULT NULL,
          elemental_burst varchar(255) DEFAULT NULL,
          ascension_materials text,
          talent_materials text,
          base_hp int NOT NULL,
          base_atk int NOT NULL,
          base_def int NOT NULL,
          character_story text,
          constellations text,
          passive_talents text,
          voice_actor_cn varchar(255) DEFAULT NULL,
          voice_actor_jp varchar(255) DEFAULT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('Characters table created or already exists');
    } catch (error) {
      console.error('Error creating characters table:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // 获取所有角色
  getAll: async () => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM characters ORDER BY name');
      return rows;
    } catch (error) {
      console.error('Error getting all characters:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // 根据ID获取角色
  getById: async (id) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM characters WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error getting character by id:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // 添加新角色
  addCharacter: async (name, element, rarity, description, imageUrl) => {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO characters (name, element, rarity, description, image_url) VALUES (?, ?, ?, ?, ?)',
        [name, element, rarity, description, imageUrl]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error adding character:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // 更新角色
  updateCharacter: async (id, name, element, rarity, description, imageUrl) => {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'UPDATE characters SET name = ?, element = ?, rarity = ?, description = ?, image_url = ? WHERE id = ?',
        [name, element, rarity, description, imageUrl, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating character:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // 删除角色
  deleteCharacter: async (id) => {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM characters WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting character:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
};

export default CharacterModel;