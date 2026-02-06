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

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('全局错误:', err);
  res.status(500).json({ message: '服务器错误', error: err.message });
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
  }
}

// 启动应用
startServer();