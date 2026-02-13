import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import favoriteService from '../services/favoriteService.js'
import axios from 'axios'

export const useCharacterStore = defineStore('character', () => {
  const favorites = ref([])
  const characters = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // 检查角色是否被收藏
  const isCharacterFavorite = computed(() => (characterId) => {
    return favorites.value.includes(characterId)
  })

  // 加载所有角色数据
  async function loadCharacters() {
    try {
      isLoading.value = true
      const response = await axios.get('http://localhost:3001/api/characters')
      characters.value = response.data
      error.value = null
    } catch (err) {
      error.value = err.message
      console.error('Failed to load characters:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 加载收藏列表
  async function loadFavorites() {
    try {
      const response = await favoriteService.getFavorites()
      favorites.value = Array.isArray(response) ? response : []
    } catch (error) {
      console.error('Failed to load favorites:', error)
      favorites.value = []
    }
  }

  // 切换收藏状态
  function toggleFavorite(characterId) {
    const index = favorites.value.indexOf(characterId)
    if (index === -1) {
      favorites.value.push(characterId)
    } else {
      favorites.value.splice(index, 1)
    }
  }

  return { 
    favorites,
    characters,
    isLoading,
    error,
    isCharacterFavorite,
    loadCharacters,
    loadFavorites,
    toggleFavorite
  }
})