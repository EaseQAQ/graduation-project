<template>
  <!-- 
    收藏页面组件
    功能：显示用户收藏的角色列表
    结构：
    - 加载状态：显示加载动画和提示
    - 未登录提示：引导用户登录
    - 收藏列表：展示用户收藏的角色卡片
    - 空状态：提示用户去浏览角色
  -->
  <div class="favorites-page">
    <!-- 加载状态 - 数据加载中显示 -->
    <div v-if="store.isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载收藏数据...</p>
    </div>
    
    <!-- 用户未登录时的提示 - 引导用户登录 -->
    <div v-else-if="!isAuthenticated" class="auth-required">
      <h2>我的收藏</h2>
      <p>请先登录以查看您的收藏</p>
      <button @click="goToLogin" class="login-btn">前往登录</button>
    </div>
    
    <!-- 用户已登录时显示收藏内容 -->
    <div v-else>
      <div class="favorites-header">
        <h2 class="favorites-title">⭐ 我的收藏 ⭐</h2>
        <button class="home-button" @click="router.push('/gallery')">
          <span class="home-icon">🏠</span> 返回首页
        </button>
      </div>
      
      <!-- 收藏为空状态 - 提示用户去浏览角色 -->
      <div v-if="favorites.length === 0" class="empty-favorites">
        <p>您还没有收藏任何角色</p>
        <router-link to="/gallery" class="browse-link">去浏览角色</router-link>
      </div>
      
      <!-- 收藏列表 - 以网格布局展示角色卡片 -->
      <div v-else class="grid">
        <CharacterCard 
          v-for="id in favorites" 
          :key="id" 
          :character="getCharacterById(id)"
          @click="viewCharacterDetails(id)"
        />
      </div>
    </div>
    <CharacterModal 
        v-if="selectedCharacter" 
        :character="selectedCharacter"
        @close="closeModal"
      />
  </div>
</template>

<script setup lang="js">
/**
 * 收藏页面脚本
 * 功能：
 * - 加载和显示用户收藏的角色
 * - 处理登录状态和导航
 * - 管理数据加载和状态
 * 
 * 依赖：
 * - vue: 核心框架
 * - vue-router: 页面导航
 * - pinia: 状态管理
 * - CharacterCard: 角色卡片组件
 */
import { useCharacterStore } from '../stores/characterStore';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import CharacterCard from '../components/CharacterCard.vue';
import CharacterModal from '../components/CharacterModal.vue';

// 路由器实例 - 用于页面导航
const router = useRouter();
// 角色存储实例 - 用于访问全局状态
const store = useCharacterStore();
// 计算属性：获取用户收藏的角色ID列表
const favorites = computed(() => store.favorites);
// 当前选中的角色 - 用于模态框显示
const selectedCharacter = ref(null);

/**
 * 当前用户状态 - 从localStorage获取
 * 判断用户是否已登录
 */
const isAuthenticated = !!localStorage.getItem('token');

/**
 * 导航到登录页面 - 点击登录按钮时触发
 */
const goToLogin = () => {
  router.push('/login');
};

/**
 * 查看角色详情 - 点击角色卡片时触发
 * @param {number} id - 角色ID
 */
const viewCharacterDetails = (id) => {
  const character = store.characters.find(c => c.id === id);
  if (character) {
    selectedCharacter.value = character;
  }
};

const closeModal = () => {
  selectedCharacter.value = null;
};

/**
 * 根据ID获取角色信息
 * @param {number} id - 角色ID
 * @returns {Object} 角色对象
 */
const getCharacterById = (id) => {
  return store.characters.find(c => c.id === id);
};

/**
 * 导航到图鉴页面 - 点击返回按钮时触发
 */
const goToGallery = () => {
  router.push('/gallery');
};

/**
 * 监听 selectedCharacter 的变化，控制背景滚动
 */
watch(selectedCharacter, (newVal) => {
  if (newVal) {
    // 打开模态框时，禁用背景滚动
    document.body.style.overflow = 'hidden';
  } else {
    // 关闭模态框时，恢复背景滚动
    document.body.style.overflow = 'auto';
  }
});

/**
 * 组件挂载时执行 - 确保数据已加载
 * 功能：
 * - 如果角色数据为空，加载角色数据
 * - 如果用户已登录且收藏数据为空，加载收藏数据
 */
onMounted(async () => {
  if (store.characters.length === 0) {
    await store.loadCharacters();
  }
  
  // 如果收藏数据尚未加载，重新加载
  if (isAuthenticated && store.favorites.length === 0) {
    await store.loadFavorites();
  }
});
</script>
<style scoped>
@import '../css/Favorites.css';
</style>