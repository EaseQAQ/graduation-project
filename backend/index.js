const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const UserModel = require('./models/userModel');
require('dotenv').config();

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 配置中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 初始化数据库表
async function initializeDatabase() {
  try {
    await UserModel.createTable();
    console.log('数据库表初始化完成');
  } catch (error) {
    console.error('数据库初始化错误:', error);
    process.exit(1);
  }
}

// 挂载路由
app.use('/api/auth', authRoutes);

// 健康检查路由
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: '服务器正常运行' });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('全局错误:', err);
  
  // 处理不同类型的错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      success: false, 
      message: '数据验证失败', 
      error: err.message 
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      success: false, 
      message: '未授权访问', 
      error: err.message 
    });
  }
  
  // 默认错误响应
  res.status(500).json({ 
    success: false, 
    message: '服务器内部错误', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: '请求的资源不存在' 
  });
});

// 启动服务器
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('服务器启动错误:', error);
    process.exit(1);
  }
}

// 启动应用
startServer();