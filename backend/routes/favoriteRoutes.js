import express from 'express';
const router = express.Router();
import favoriteController from '../controllers/favoriteController.js';
import authMiddleware from '../middleware/authMiddleware.js';

// 应用身份验证中间件 - 确保所有收藏相关操作都需要登录
router.use(authMiddleware.authenticate);

// 收藏相关路由 - 处理用户收藏角色的操作
// POST /api/favorites - 添加收藏
router.post('/', favoriteController.addFavorite);
// DELETE /api/favorites/:characterId - 取消收藏
router.delete('/:characterId', favoriteController.removeFavorite);
// GET /api/favorites - 获取用户所有收藏的角色
router.get('/', favoriteController.getFavorites);
// GET /api/favorites/:characterId - 检查某个角色是否已收藏
router.get('/:characterId', favoriteController.isFavorite);

export default router;