import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import favoriteRoutes from './routes/favoriteRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { pool } from './db.js'; // 使用共享数据库连接

// 加载环境变量 - 从.env文件中读取配置参数
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; // 使用统一的PORT变量

// 中间件配置 - 设置跨域和JSON解析
app.use(cors());
app.use(express.json());

// 认证相关API
app.use('/api/auth', authRoutes);

// 收藏相关API
app.use('/api/favorites', favoriteRoutes);

// 健康检查路由
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: '服务器正常运行' });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: '请求的资源不存在' 
  });
});

// 测试数据库连接
async function testDbConnection() {
  try {
    const [result] = await pool.execute('SELECT 1');
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

// 启动服务器 - 启动Express服务器监听指定端口
async function startServer() {
  await testDbConnection();
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

// 启动应用
startServer();