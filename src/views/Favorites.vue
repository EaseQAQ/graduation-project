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
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
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
  background: linear-gradient(135deg, #fff9f0 0%, #ffedd5 100%);
  background-image: url('@/assets/favorites-bg-pattern.png');
  background-size: 300px;
  background-blend-mode: overlay;
}

.favorites-page h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 25px;
  position: relative;
  display: inline-block;
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
  padding: 60px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 28px;
  box-shadow: 0 12px 40px rgba(212, 156, 94, 0.15);
  max-width: 600px;
  margin: 50px auto;
  border: 2px dashed #c87d90;
  transition: all 0.3s ease;
  position: relative;
}

.empty-favorites::before {
  content: '💖';
  font-size: 3rem;
  display: block;
  margin-bottom: 20px;
  animation: pulse 1.5s ease infinite;
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

/* 页面头部样式 */
.favorites-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
  position: relative;
}

.favorites-title {
  font-size: 2.6rem;
  color: #5d2a18;
  margin-bottom: 25px;
  text-shadow: 3px 3px 6px rgba(0,0,0,0.15);
  position: relative;
  padding: 0 25px;
  letter-spacing: 1px;
}

.home-button {
  padding: 14px 28px;
  background: linear-gradient(to right, #d49c5e, #c87d90);
  color: white;
  border: none;
  border-radius: 60px;
  font-weight: 600;
  font-size: 1.1rem;
  box-shadow: 0 6px 20px rgba(212, 156, 94, 0.25);
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.home-icon {
  font-size: 1.2em;
  transition: transform 0.3s ease;
}

.home-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(246, 173, 85, 0.4);
  background: linear-gradient(to right, #f687b3, #f6ad55);
}

.home-button:hover .home-icon {
  transform: scale(1.2);
}

/* 关闭按钮样式 - 与登录/注册页面一致 */
.close-button {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: #667eea;
  color: white;
  transform: scale(1.1);
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 10px 5px;
}

.gallery-btn .icon {
  font-size: 1.2em;
  transition: transform 0.3s ease;
}

.login-btn:hover, .gallery-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
  background: linear-gradient(45deg, #2980b9, #3498db);
}

.gallery-btn:hover .icon {
  transform: translateX(-3px);
}

/* 角色网格布局 - 独特收藏样式 */
.grid {
  display: grid;
  gap: clamp(15px, 4vw, 20px);
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 35px;
  margin: 35px 0;
  padding: 30px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  box-shadow: 
    0 8px 35px rgba(212, 156, 94, 0.12),
    0 12px 20px rgba(0,0,0,0.07);
  border: 1px solid rgba(212, 156, 94, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  backdrop-filter: blur(8px);
}

.grid:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 12px 35px rgba(246, 173, 85, 0.15),
    0 15px 20px rgba(0,0,0,0.08);
}

/* 添加页面进入动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}

.favorites-page > * {
  animation: fadeIn 0.6s ease forwards;
}
</style>