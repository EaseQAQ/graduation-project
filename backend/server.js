import { config } from './config.js';
// 初始化配置
config.init();

import express from 'express';
import cors from 'cors';
import favoriteRoutes from './routes/favoriteRoutes.js';
import authRoutes from './routes/authRoutes.js';
import pool from './db.js';

// 已在上方定义过 __dirname，用于获取当前文件目录路径

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

import helmet from 'helmet';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';

// 安全相关中间件
app.use(helmet()); // 设置安全相关的HTTP头，防止常见安全攻击
app.use(express.json({ limit: '10kb' })); // 限制请求体大小为10KB，防止大文件上传攻击

// CORS配置 - 跨域资源共享设置
app.use(cors({
  // 生产环境使用指定的前端域名，开发环境允许所有来源
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : true, 
  // 允许的HTTP方法
  methods: ['GET','POST','PUT','DELETE'],
  // 允许的请求头
  allowedHeaders: ['Content-Type', 'Authorization'],
  // 允许携带凭证（如cookies）
  credentials: true,
  // 预检请求结果缓存时间（24小时）
  maxAge: 86400 
}));

// 应用速率限制 - 防止请求洪水攻击
app.use(apiLimiter); // 通用API速率限制，每15分钟最多100次请求

// 使用共享数据库连接池

// 测试数据库连接 - 使用共享连接池
import db from './db.js'; // 导入数据库连接模块

// 启动服务器前测试数据库连接
async function startServer() {
  try {
    // 测试数据库连接
    await db.testDbConnection();
    console.log('✅ 数据库连接验证成功');
  } catch (error) {
    // 连接失败时终止进程
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
  
  // 启动服务器
  app.listen(PORT, () => {
    console.log(`🚀 后端服务器正在运行在 http://localhost:${PORT}`);
    console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();

// 提供角色数据API - 从数据库获取所有角色信息
app.get('/api/characters', async (req, res, next) => {
  try {
    // 执行数据库查询，获取所有角色数据
    const [rows] = await pool.query('SELECT * FROM characters');
    console.log(`✅ 成功获取 ${rows.length} 个角色数据`);
    // 返回角色数据列表
    res.json(rows);
  } catch (error) {
    // 将错误传递给统一的错误处理中间件
    next(error);
  }
});

// 认证相关API - 应用更严格的速率限制
// 限制认证接口的请求频率，防止暴力破解
app.use('/api/auth', authLimiter, authRoutes);

// 收藏相关API
app.use('/api/favorites', favoriteRoutes); // 挂载收藏路由

// 统一的错误处理中间件
app.use((err, req, res, next) => {
  // 记录错误详情
  console.error('❌ 服务器错误:', err);
  // 返回标准错误响应
  res.status(500).json({
    error: '内部服务器错误',
    message: err.message,
    // 仅在开发环境中返回堆栈跟踪
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 服务器启动已在startServer函数中处理，此处删除重复代码