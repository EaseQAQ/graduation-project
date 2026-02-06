import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';
import dotenv from 'dotenv';

// 注册新用户
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: '用户已存在' });
    }
    
    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // 创建用户
    const userId = await UserModel.register(username, email, passwordHash);
    
    // 生成JWT令牌
    const token = jwt.sign(
      { id: userId, email: email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ 
      message: '注册成功',
      token,
      user: { id: userId, username, email }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 检查用户是否存在
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '密码错误' });
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      message: '登录成功',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取当前用户信息
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 导出控制器方法 - 放置在所有函数定义之后
export default {
  register,
  login,
  getCurrentUser
};