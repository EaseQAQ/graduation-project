import express from 'express';
import UserModel from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
const router = express.Router();

// 注册新用户 - 处理用户注册请求
router.post('/register', async (req, res) => {
  try {
    // 从请求体中获取用户信息
    const { username, email, password } = req.body;
    
    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({ message: '所有字段都是必填的' });
    }
    
    // 验证密码强度（至少6个字符）
    if (password.length < 6) {
      return res.status(400).json({ message: '密码至少需要6个字符' });
    }
    
    // 检查邮箱是否已被注册
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }
    
    // 密码加密 - 使用bcrypt生成盐值并哈希密码
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // 在数据库中创建新用户
    const userId = await UserModel.register(username, email, passwordHash);
    
    // 生成JWT令牌 - 有效期1天
    const token = jwt.sign(
      { id: userId },
      config.get('JWT_SECRET'),
      { expiresIn: '1d' }
    );
    
    // 返回注册成功响应
    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: userId,
        username,
        email
      }
    });
  } catch (error) {
    // 记录错误日志
    console.error('注册错误:', error);
    // 返回服务器错误响应
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 用户登录 - 处理用户登录请求
router.post('/login', async (req, res) => {
  try {
    // 从请求体中获取登录信息
    const { email, password } = req.body;
    
    // 验证必填字段
    if (!email || !password) {
      return res.status(400).json({ message: '邮箱和密码都是必填的' });
    }
    
    // 根据邮箱查找用户
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: '邮箱或密码不正确' });
    }
    
    // 验证密码 - 使用bcrypt比较输入密码和存储的哈希值
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '邮箱或密码不正确' });
    }
    
    // 生成JWT令牌 - 有效期1天
    const token = jwt.sign(
      { id: user.id },
      config.get('JWT_SECRET'),
      { expiresIn: '1d' }
    );
    
    // 返回登录成功响应
    res.status(200).json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    // 记录错误日志
    console.error('登录错误:', error);
    // 返回服务器错误响应
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取当前用户信息 - 处理获取当前登录用户信息的请求
router.get('/me', async (req, res) => {
  try {
    // 从请求头获取认证令牌
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '未授权访问' });
    }
    
    // 提取令牌部分
    const token = authHeader.split(' ')[1];
    
    // 验证JWT令牌
    const decoded = jwt.verify(token, config.get('JWT_SECRET'));
    
    // 根据令牌中的用户ID查找用户
    const user = await UserModel.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 返回用户信息
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    // 记录错误日志
    console.error('获取用户信息错误:', error);
    
    // 处理令牌验证错误
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: '无效的令牌' });
    }
    
    // 返回服务器错误响应
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

export default router;