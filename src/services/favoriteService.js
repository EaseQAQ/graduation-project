import { api } from './authService.js';

// 收藏服务 - 与后端收藏API交互
const favoriteService = {
  // 添加收藏
  addFavorite: async (characterId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('用户未登录');
      }
      
      const response = await api.post(
        '/favorites',
        { characterId }
      );
      
      return response.data;
    } catch (error) {
      console.error('添加收藏失败:', error);
      throw error;
    }
  },
  
  // 取消收藏
  removeFavorite: async (characterId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('用户未登录');
      }
      
      const response = await api.delete(
        `/favorites/${characterId}`
      );
      
      return response.data;
    } catch (error) {
      console.error('取消收藏失败:', error);
      throw error;
    }
  },
  
  // 获取用户收藏
  getFavorites: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('用户未登录');
      }
      
      const response = await api.get(
        '/favorites'
      );
      
      return response.data.favorites;
    } catch (error) {
      console.error('获取收藏失败:', error);
      throw error;
    }
  },
  
  // 检查是否已收藏
  isFavorite: async (characterId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('用户未登录');
      }
      
      const response = await api.get(
        `/favorites/${characterId}`
      );
      
      return response.data.isFavorite;
    } catch (error) {
      console.error('检查收藏状态失败:', error);
      throw error;
    }
  }
};

export default favoriteService;