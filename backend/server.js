import { config } from './config.js';
// 初始化配置 - 确保在所有模块之前调用
config.init();

import express from 'express';
import cors from 'cors';
import favoriteRoutes from './routes/favoriteRoutes.js';
import authRoutes from './routes/authRoutes.js';
import characterRoutes from './routes/characterRoutes.js';

const app = express();
// 使用配置中心的值，而不是直接访问process.env
const PORT = config.get('BACKEND_PORT');

import helmet from 'helmet';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';

// 安全相关中间件
app.use(helmet()); // 设置安全相关的HTTP头，防止常见安全攻击
app.use(express.json({ limit: '10kb' })); // 限制请求体大小为10KB，防止大文件上传攻击

// CORS配置 - 跨域资源共享设置
app.use(cors({
  // 生产环境使用指定的前端域名，开发环境允许所有来源
  origin: config.get('NODE_ENV') === 'production' 
    ? config.get('CLIENT_URL') 
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

// 角色数据API - 使用专用路由文件
app.use('/api/characters', characterRoutes);

// 认证相关API - 应用更严格的速率限制
// 限制认证接口的请求频率，防止暴力破解
app.use('/api/auth', authLimiter, authRoutes);

// 收藏相关API
app.use('/api/favorites', favoriteRoutes); // 挂载收藏路由

// 错误处理中间件 - 必须放在所有路由之后
import errorHandler from './middleware/errorHandler.js';
app.use((err, req, res, next) => {
  // 确保所有错误都经过统一处理
  errorHandler(err, req, res, next);
});

// 404 处理中间件 - 放在最后
app.use((req, res) => {
  errorHandler(
    { 
      name: 'NotFoundError', 
      message: `路由 ${req.method} ${req.path} 不存在` 
    }, 
    req, 
    res, 
    next
  );
});

// 服务器启动已在startServer函数中处理，此处删除重复代码