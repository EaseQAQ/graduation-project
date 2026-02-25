import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

// 身份验证中间件 - 用于保护需要登录的API端点
const authMiddleware = {
  /**
   * 认证中间件 - 检查请求是否包含有效的JWT令牌
   * 
   * 功能流程：
   * 1. 检查请求头是否存在Authorization
   * 2. 验证令牌格式是否为Bearer token
   * 3. 解析并验证JWT令牌
   * 4. 根据令牌中的用户ID查找用户
   * 5. 将用户信息附加到请求对象
   * 6. 继续处理下一个中间件
   * 
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {Function} next - Express中间件函数
   */
  authenticate: async (req, res, next) => {
    try {
      // 从请求头获取认证令牌
      const authHeader = req.headers.authorization;
      
      // 检查是否存在认证头且格式正确
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: '未授权访问 - 缺少令牌' });
      }
      
      // 提取令牌部分（去掉"Bearer "前缀）
      const token = authHeader.split(' ')[1];
      
      // 验证JWT令牌 - 使用环境变量中的密钥
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'your-secret-key'
      );
      
      // 根据令牌中的用户ID查找用户
      const user = await UserModel.findById(decoded.id);
      
      // 检查用户是否存在
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }
      
      // 将用户信息附加到请求对象，供后续中间件使用
      req.user = user;
      
      // 继续处理下一个中间件
      next();
    } catch (error) {
      // 记录错误日志
      console.error('身份验证错误:', error);
      
      // 处理不同类型的令牌错误
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: '无效的令牌' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: '令牌已过期' });
      }
      
      // 返回服务器错误响应
      res.status(500).json({ message: '服务器错误', error: error.message });
    }
  }
};

export default authMiddleware;