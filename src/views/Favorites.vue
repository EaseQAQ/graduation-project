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
      <h2>我的收藏</h2>
      
      <!-- 返回图鉴按钮 -->
      <button @click="goToGallery" class="gallery-btn">返回图鉴</button>
      
      <!-- 收藏为空状态 - 提示用户去浏览角色 -->
      <div v-if="favorites.length === 0" class="empty-favorites">
        <p>您还没有收藏任何角色</p>
        <router-link to="/gallery" class="browse-link">去浏览角色</router-link>
      </div>
      
      <!-- 收藏列表 - 以网格布局展示角色卡片 -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <CharacterCard 
          v-for="id in favorites" 
          :key="id" 
          :character="getCharacterById(id)"
          @click="viewCharacterDetails(id)"
        />
      </div>
      
      <!-- 角色详情模态框 -->
      <CharacterModal 
        v-if="selectedCharacter" 
        :character="selectedCharacter"
        @close="closeModal"
      />
    </div>
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
import { computed, onMounted, ref } from 'vue';
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
/**
 * 收藏页面样式
 * 设计原则：
 * - 精美的渐变背景和卡片设计
 * - 平滑的过渡动画和悬停效果
 * - 现代化的按钮和交互元素
 * - 响应式布局，适配所有设备
 */
.favorites-page {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
}

.favorites-page h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 25px;
  position: relative;
  display: inline-block;
}

.favorites-page h2::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transform: scaleX(0.5);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.favorites-page h2:hover::after {
  transform: scaleX(1);
}

/* 加载状态样式 - 带更精美的动画 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: rgba(255,255,255,0.8);
  border-radius: 12px;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(52, 152, 219, 0.2);
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1.2s ease-in-out infinite;
  position: relative;
}

.loading-spinner::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 4px solid rgba(52, 152, 219, 0.1);
  border-radius: 50%;
}

.loading-container p {
  margin-top: 20px;
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空收藏状态样式 - 使用精美的卡片设计 */
.empty-favorites {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  max-width: 600px;
  margin: 30px auto;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.empty-favorites:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0,0,0,0.12);
}

.empty-favorites p {
  font-size: 1.2rem;
  color: #34495e;
  margin-bottom: 20px;
}

/* 更精美的按钮样式，带渐变效果和悬停动画 */
.browse-link {
  display: inline-block;
  padding: 12px 28px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  text-decoration: none;
  border-radius: 30px;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.browse-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  background: linear-gradient(45deg, #764ba2, #667eea);
}

/* 认证提示区域 - 增加视觉吸引力 */
.auth-required {
  text-align: center;
  padding: 50px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  max-width: 600px;
  margin: 40px auto;
}

.auth-required h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 15px;
}

.auth-required p {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 25px;
}

/* 按钮样式升级 */
.login-btn, .gallery-btn {
  padding: 12px 28px;
  background: linear-gradient(45deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 1rem;
  display: inline-block;
  margin: 10px 5px;
}

.login-btn:hover, .gallery-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
  background: linear-gradient(45deg, #2980b9, #3498db);
}

/* 角色网格布局增强 */
.grid {
  display: grid;
  gap: 25px;
  margin-top: 20px;
}

/* 添加页面进入动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.favorites-page > * {
  animation: fadeIn 0.6s ease forwards;
}
</style>