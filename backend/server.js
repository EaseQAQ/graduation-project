import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import favoriteRoutes from './routes/favoriteRoutes.js';
import authRoutes from './routes/authRoutes.js';

// 加载环境变量 - 从.env文件中读取配置参数
dotenv.config();

// Debug: Check if environment variables are loaded
console.log('DB_USER from .env:', process.env.DB_USER);
console.log('DB_PASSWORD from .env:', process.env.DB_PASSWORD ? '***' : 'NOT SET');

// 定义 __dirname 用于ES模块 - 在ES模块中无法直接使用__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// 中间件配置 - 设置跨域和JSON解析
app.use(cors());
app.use(express.json());

// 数据库连接配置 - 连接到MySQL数据库
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'genshin_characters',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试数据库连接 - 确保数据库能够正常连接
async function testDbConnection() {
  try {
    const connection = await db.getConnection();
    console.log('Database connection successful');
    connection.release();
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

testDbConnection();

// 提供角色数据API - 从数据库获取所有角色信息
app.get('/api/characters', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM characters');
    console.log(`Successfully fetched ${rows.length} characters from database`);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching characters:', error.message);
    console.error('Error details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch character data',
      details: error.message,
      code: error.code
    });
  }
});

// 认证相关API
app.use('/api/auth', authRoutes);

// 收藏相关API
app.use('/api/favorites', favoriteRoutes);

// 启动服务器 - 启动Express服务器监听指定端口
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});