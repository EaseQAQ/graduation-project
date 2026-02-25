import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

// 身份验证中间件
const authMiddleware = {
  authenticate: async (req, res, next) => {
    try {
      // 从请求头获取令牌
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: '未授权访问 - 缺少令牌' });
      }
      
      const token = authHeader.split(' ')[1];
      
      // 验证令牌
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // 查找用户
      const user = await UserModel.findById(decoded.id);
      
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }
      
      // 将用户信息附加到请求对象
      req.user = user;
      
      // 继续处理下一个中间件
      next();
    } catch (error) {
      console.error('身份验证错误:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: '无效的令牌' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: '令牌已过期' });
      }
      res.status(500).json({ message: '服务器错误', error: error.message });
    }
  }
};

export default authMiddleware;