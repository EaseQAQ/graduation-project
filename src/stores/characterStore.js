import { defineStore } from 'pinia';
import axios from 'axios';
import favoriteService from '../services/favoriteService';

export const useCharacterStore = defineStore('characters', {
  state: () => ({
    characters: [],
    selectedIds: [],
    favorites: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async loadCharacters() {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await axios.get('http://localhost:3001/api/characters');
        this.characters = res.data;
      } catch (err) {
        console.error('Failed to load characters:', err);
        this.error = err.response?.data?.message || err.message || '加载角色数据失败';
        // Fallback to local JSON if API fails
        try {
          const localRes = await fetch('/data/temp_characters.json');
          if (localRes.ok) {
            this.characters = await localRes.json();
          }
        } catch (fallbackErr) {
          console.error('Failed to load local characters:', fallbackErr);
          this.error = this.error || '无法加载本地角色数据';
        }
      } finally {
        this.isLoading = false;
      }
    },
    
    // 加载用户收藏
    async loadFavorites() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // 如果用户未登录，使用本地存储的收藏
          this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
          return;
        }
        
        // 如果用户已登录，从服务器加载收藏
        const favorites = await favoriteService.getFavorites();
        this.favorites = favorites;
        localStorage.setItem('favorites', JSON.stringify(favorites));
      } catch (error) {
        console.error('Failed to load favorites:', error);
        // 加载失败时使用本地存储的收藏
        this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      }
    },
    async loadCharacterById(id) {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await axios.get(`http://localhost:3001/api/characters/${id}`);
        return res.data;
      } catch (err) {
        console.error(`Failed to load character ${id}:`, err);
        this.error = err.response?.data?.message || err.message || '加载角色详情失败';
        return null;
      } finally {
        this.isLoading = false;
      }
    },
    async toggleFavorite(id) {
      try {
        const token = localStorage.getItem('token');
        
        if (this.favorites.includes(id)) {
          // 取消收藏
          if (token) {
            await favoriteService.removeFavorite(id);
          }
          this.favorites = this.favorites.filter(item => item !== id);
        } else {
          // 添加收藏
          if (token) {
            await favoriteService.addFavorite(id);
          }
          this.favorites.push(id);
        }
        
        // 更新本地存储
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
        // 如果操作失败，恢复原来的收藏状态
        throw error;
      }
    },
    // 添加新的方法：获取收藏的角色
    getFavoriteCharacters() {
      return this.characters.filter(character => this.favorites.includes(character.id));
    },
    // 添加新的方法：检查角色是否已收藏
    isCharacterFavorite(id) {
      return this.favorites.includes(id);
    }
  },
});