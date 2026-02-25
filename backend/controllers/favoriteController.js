// 直接导入模型
import FavoriteModel from '../models/favoriteModel.js';
import errorHandler from '../middleware/errorHandler.js';

// 添加收藏 - 处理用户添加角色收藏的请求
const addFavorite = async (req, res) => {
  try {
    // 从请求中获取当前登录用户的ID
    const userId = req.user.id;
    // 从请求体中获取角色ID
    const { characterId } = req.body;
    
    // 验证角色ID是否提供
    if (!characterId) {
      return res.status(400).json({ message: '角色ID不能为空' });
    }
    
    // 调用模型方法添加收藏
    const result = await FavoriteModel.addFavorite(userId, characterId);
    
    // 根据结果返回相应响应
    if (result) {
      res.status(200).json({ message: '收藏成功' });
    } else {
      res.status(400).json({ message: '收藏失败' });
    }
  } catch (error) {
    // 使用统一错误处理中间件
    errorHandler(error, req, res, null);
  }
};

// 取消收藏 - 处理用户取消角色收藏的请求
const removeFavorite = async (req, res) => {
  try {
    // 从请求中获取当前登录用户的ID
    const userId = req.user.id;
    // 从请求参数中获取角色ID
    const { characterId } = req.params;
    
    // 验证角色ID是否提供
    if (!characterId) {
      return res.status(400).json({ message: '角色ID不能为空' });
    }
    
    // 调用模型方法取消收藏
    const result = await FavoriteModel.removeFavorite(userId, characterId);
    
    // 根据结果返回相应响应
    if (result) {
      res.status(200).json({ message: '取消收藏成功' });
    } else {
      res.status(400).json({ message: '取消收藏失败' });
    }
  } catch (error) {
    // 使用统一错误处理中间件
    errorHandler(error, req, res, null);
  }
};

// 获取用户收藏 - 处理获取用户所有收藏的角色列表的请求
const getFavorites = async (req, res) => {
  try {
    // 从请求中获取当前登录用户的ID
    const userId = req.user.id;
    // 调用模型方法获取用户的收藏列表
    const favorites = await FavoriteModel.getUserFavorites(userId);
    
    // 返回收藏列表
    res.status(200).json({ favorites });
  } catch (error) {
    // 使用统一错误处理中间件
    errorHandler(error, req, res, null);
  }
};

// 检查是否已收藏 - 处理检查某个角色是否已被收藏的请求
const isFavorite = async (req, res) => {
  try {
    // 从请求中获取当前登录用户的ID
    const userId = req.user.id;
    // 从请求参数中获取角色ID
    const { characterId } = req.params;
    
    // 验证角色ID是否提供
    if (!characterId) {
      return res.status(400).json({ message: '角色ID不能为空' });
    }
    
    // 调用模型方法检查是否已收藏
    const isFavorite = await FavoriteModel.isFavorite(userId, characterId);
    
    // 返回收藏状态
    res.status(200).json({ isFavorite });
  } catch (error) {
    // 使用统一错误处理中间件
    errorHandler(error, req, res, null);
  }
};

// 导出控制器方法 - ES模块格式
export default {
  addFavorite,
  removeFavorite,
  getFavorites,
  isFavorite
};