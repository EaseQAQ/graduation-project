import express from 'express';
const router = express.Router();
import favoriteController from '../controllers/favoriteController.js';
import authMiddleware from '../middleware/authMiddleware.js';

// 应用身份验证中间件
router.use(authMiddleware.authenticate);

// 收藏相关路由
router.post('/', favoriteController.addFavorite);
router.delete('/:characterId', favoriteController.removeFavorite);
router.get('/', favoriteController.getFavorites);
router.get('/:characterId', favoriteController.isFavorite);

export default router;