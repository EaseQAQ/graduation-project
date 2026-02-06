import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';
import dotenv from 'dotenv';
dotenv.config();

// 认证中间件
const authenticate = async (req, res, next) => {
  try {
    // 获取Authorization头部
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '未提供有效令牌' });
    }
    
    // 提取令牌
    const token = authHeader.split(' ')[1];
    
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }
    
    // 将用户信息附加到请求对象
    req.user = user;
    next();
  } catch (error) {
    console.error('认证错误:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: '无效令牌' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '令牌已过期' });
    }
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 导出中间件 - ES模块格式
export default {
  authenticate
};