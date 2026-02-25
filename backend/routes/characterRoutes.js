import express from 'express';
const router = express.Router();
import characterController from '../controllers/characterController.js';
import authMiddleware from '../middleware/authMiddleware.js';

// 角色相关路由 - 处理角色数据的获取
// GET /api/characters - 获取所有角色
router.get('/', characterController.getCharacters);

// GET /api/characters/:id - 根据ID获取单个角色
router.get('/:id', characterController.getCharacterById);

export default router;