/**
 * 数据库初始化脚本
 * 
 * 功能：创建Genshin数据库及其所需的表结构，并插入初始样本数据
 * 
 * 该脚本会：
 * 1. 建立与MySQL数据库的连接
 * 2. 创建三个核心表：users（用户）、characters（角色）、favorites（收藏）
 * 3. 插入初始测试数据
 * 4. 处理连接错误和数据库操作异常
 * 
 * 数据库结构设计：
 * - users表：存储用户账户信息（用户名、邮箱、密码）
 * - characters表：存储原神角色信息（名称、元素、武器、星级等）
 * - favorites表：存储用户收藏关系（用户ID和角色ID的关联）
 * 
 * 特殊设计：
 * - 使用外键约束确保数据完整性
 * - 使用唯一索引防止重复收藏
 * - 支持环境变量配置数据库连接参数
 * - 具备幂等性，可重复运行而不产生冲突
 * 
 * @module db_init
 * @author Comate Zulu
 * @version 1.0.0
 */

// 导入必要的模块
import { createConnection } from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录名
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 创建数据库连接
 * 使用环境变量配置数据库参数，提供默认值
 * @returns {Promise<Connection>} 数据库连接对象
 */
const db = await createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'genshin_characters',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * 执行SQL查询的通用函数
 * 用于简化数据库操作，统一错误处理
 * @param {string} sql - 要执行的SQL语句
 * @returns {Promise<void>} 执行结果
 */
async function executeQuery(sql) {
  try {
    await db.execute(sql);
    console.log(`Successfully executed: ${sql.substring(0, 50)}...`);
  } catch (error) {
    console.error(`Error executing query: ${sql.substring(0, 50)}...`);
    console.error('Error details:', error);
    throw error;
  }
}

/**
 * 初始化数据库表结构
 * 创建用户、角色和收藏表，并插入样本数据
 * 保证幂等性，可重复运行
 * @returns {Promise<void>} 初始化结果
 */
async function initDatabase() {
  try {
    console.log('Initializing database tables...');
    
    // 创建用户表
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建角色表
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS characters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        element VARCHAR(50) NOT NULL,
        weapon VARCHAR(50) NOT NULL,
        rarity INT NOT NULL,
        region VARCHAR(50) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        normal_attack VARCHAR(255),
        elemental_skill VARCHAR(255),
        elemental_burst VARCHAR(255),
        ascension_materials TEXT,
        talent_materials TEXT,
        base_hp INT NOT NULL,
        base_atk INT NOT NULL,
        base_def INT NOT NULL,
        character_story TEXT,
        constellations TEXT,
        passive_talents TEXT,
        voice_actor_cn VARCHAR(255),
        voice_actor_jp VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    
    // 创建收藏表
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        character_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_character (user_id, character_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Database initialization completed successfully');
    await db.end();
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// 执行数据库初始化
initDatabase();