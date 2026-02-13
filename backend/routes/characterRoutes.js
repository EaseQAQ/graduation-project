import express from 'express';
const router = express.Router();
import characterController from '../controllers/characterController.js';
// No authentication middleware needed for public character data

// 获取角色列表
router.get('/characters', characterController.getCharacters);

export default router;