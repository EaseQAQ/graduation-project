import express from 'express';
const router = express.Router();
import authController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

// 注册新用户
router.post('/register', authController.register);

// 用户登录
router.post('/login', authController.login);

// 获取当前用户信息（需要认证）
router.get('/me', authMiddleware.authenticate, authController.getCurrentUser);

export default router;