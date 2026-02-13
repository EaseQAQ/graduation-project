// 直接导入模型
import FavoriteModel from '../models/favoriteModel.js';

// 添加收藏
const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { characterId } = req.body;
    
    if (!characterId) {
      return res.status(400).json({ message: '角色ID不能为空' });
    }
    
    const result = await FavoriteModel.addFavorite(userId, characterId);
    
    if (result) {
      res.status(200).json({ message: '收藏成功' });
    } else {
      res.status(400).json({ message: '收藏失败' });
    }
  } catch (error) {
    console.error('添加收藏错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 取消收藏
const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { characterId } = req.params;
    
    if (!characterId) {
      return res.status(400).json({ message: '角色ID不能为空' });
    }
    
    const result = await FavoriteModel.removeFavorite(userId, characterId);
    
    if (result) {
      res.status(200).json({ message: '取消收藏成功' });
    } else {
      res.status(400).json({ message: '取消收藏失败' });
    }
  } catch (error) {
    console.error('取消收藏错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取用户收藏
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await FavoriteModel.getUserFavorites(userId);
    
    res.status(200).json({ favorites });
  } catch (error) {
    console.error('获取收藏列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 检查是否已收藏
const isFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { characterId } = req.params;
    
    if (!characterId) {
      return res.status(400).json({ message: '角色ID不能为空' });
    }
    
    const isFavorite = await FavoriteModel.isFavorite(userId, characterId);
    
    res.status(200).json({ isFavorite });
  } catch (error) {
    console.error('检查收藏状态错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 导出控制器方法 - ES模块格式
export default {
  addFavorite,
  removeFavorite,
  getFavorites,
  isFavorite
};