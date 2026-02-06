<template>
  <!-- 
    角色图鉴组件
    功能：展示所有原神角色，提供筛选功能和详情查看
    结构：
    - 标题区域：显示"原神角色图鉴"标题
    - 认证提示：未登录用户显示登录提示
    - 筛选区域：已登录用户显示多条件筛选功能
    - 角色网格：展示所有角色卡片
    - 详情模态框：点击角色卡片时显示详细信息
    - 加载状态和错误处理
  -->
  <div class="character-gallery">
    <h1 class="gallery-title">原神角色图鉴</h1>
    
    <!-- 加载状态 -->
    <div v-if="characterStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>正在加载角色数据...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="characterStore.error" class="error-state">
      <p class="error-message">{{ characterStore.error }}</p>
      <button @click="characterStore.loadCharacters" class="retry-btn">重试加载</button>
    </div>
    
    <!-- 认证提示区域 - 未登录用户显示 -->
    <div v-else-if="!isAuthenticated" class="auth-required">
      <div class="auth-content">
        <h2>欢迎访问原神角色图鉴</h2>
        <p>请先登录以使用收藏功能和查看更多详细信息</p>
        <button @click="goToLogin" class="login-btn">前往登录</button>
      </div>
    </div>
    
    <!-- 筛选区域 - 已登录用户显示 -->
    <div v-else>
      <!-- 搜索和筛选控制面板 -->
      <div class="filters-panel">
        <div class="filters-header">
          <h3>筛选角色</h3>
          <button @click="resetFilters" class="reset-filters">重置筛选</button>
        </div>
        
        <!-- 搜索框 -->
        <div class="search-group">
          <label for="search-input">关键词搜索:</label>
          <input 
            id="search-input"
            type="text"
            v-model="searchKeyword"
            placeholder="输入角色名、元素或技能关键词..."
            class="search-input"
          />
        </div>
        
        <!-- 多条件筛选功能 - 提供元素、地区、武器、星级四种筛选条件 -->
        <div class="filters-container">
          <div class="filter-group">
            <label for="element-filter">元素:</label>
            <select id="element-filter" v-model="selectedElement">
              <option value="">全部元素</option>
              <option class="Anemo" value="风元素">风</option>
              <option class="Pyro" value="火元素">火</option>
              <option class="Electro" value="雷元素">雷</option>
              <option class="Geo" value="岩元素">岩</option>
              <option class="Cryo" value="冰元素">冰</option>
              <option class="Hydro" value="水元素">水</option>
              <option class="Dendro" value="草元素">草</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="region-filter">地区:</label>
            <select id="region-filter" v-model="selectedRegion">
              <option value="">全部地区</option>
              <option class="Mondstadt" value="蒙德">蒙德</option>
              <option class="Liyue" value="璃月">璃月</option>
              <option class="Inazuma" value="稻妻">稻妻</option>
              <option class="Sumeru" value="须弥">须弥</option>
              <option class="Fontaine" value="枫丹">枫丹</option>
              <option class="Natlan" value="纳塔">纳塔</option>
              <option class="Nordkale" value="挪德卡莱">挪德卡莱</option>
              <option class="OtherCountries" value="其他国家">其他国家</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="weapon-filter">武器类型:</label>
            <select id="weapon-filter" v-model="selectedWeapon">
              <option value="">全部武器</option>
              <option value="单手剑">单手剑</option>
              <option value="双手剑">双手剑</option>
              <option value="长柄武器">长柄武器</option>
              <option value="弓">弓</option>
              <option value="法器">法器</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="rarity-filter">星级:</label>
            <select id="rarity-filter" v-model="selectedRarity">
              <option value="">全部星级</option>
              <option value="5">5星</option>
              <option value="4">4星</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- 筛选结果统计 -->
      <div class="results-summary">
        <p>共找到 <span class="highlight">{{ filteredCharacters.length }}</span> 个角色</p>
        <button @click="goToFavorites" class="favorites-btn">查看我的收藏 ({{ characterStore.favorites.length }})</button>
        <!-- 退出登录按钮 -->
        <button v-if="isAuthenticated" @click="logout" class="logout-btn">退出登录</button>
      </div>
    </div>
    
    <!-- 角色网格区域 - 显示所有符合筛选条件的角色卡片 -->
    <div class="characters-grid" v-if="!characterStore.isLoading && !characterStore.error">
      <CharacterCard 
        v-for="character in filteredCharacters" 
        :key="character.id"
        :character="character"
        @click="(char) => showCharacterModal(char)"
        @favorite="toggleFavorite"
      />
    </div>
    
    <!-- 空结果提示 -->
    <div v-if="!characterStore.isLoading && !characterStore.error && filteredCharacters.length === 0" class="no-results">
      <p>没有找到符合条件的角色，请尝试调整筛选条件</p>
    </div>
    
    <!-- 角色详情模态框 - 点击角色卡片时显示 -->
    <CharacterModal 
      v-if="selectedCharacter" 
      :character="selectedCharacter"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
/**
 * 角色图鉴组件脚本
 * 功能：
 * - 加载和展示所有原神角色数据
 * - 提供多条件筛选功能
 * - 实现角色详情查看模态框
 * - 管理用户认证状态
 * - 处理加载状态和错误情况
 * 
 * 依赖：
 * - vue: 核心框架
 * - vue-router: 页面导航
 * - pinia: 状态管理
 */
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCharacterStore } from '../stores/characterStore';
import CharacterCard from './CharacterCard.vue';
import CharacterModal from './CharacterModal.vue';

// 路由器实例 - 用于页面导航
const router = useRouter();

// Pinia store实例
const characterStore = useCharacterStore();

/**
 * 当前激活的标签页
 */
const activeTab = ref('basic');

/**
 * 筛选状态 - 存储用户选择的筛选条件
 * 包括元素、地区、星级、武器四种筛选条件
 */
const selectedElement = ref('');
const selectedRegion = ref('');
const selectedRarity = ref('');
const selectedWeapon = ref('');

/**
 * 当前选中角色 - 用于显示角色详情模态框
 * 存储当前被选中的角色对象
 */
const selectedCharacter = ref(null);

/**
 * 用户认证状态 - 从localStorage获取
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
 * 导航到收藏页面 - 点击收藏按钮时触发
 */
const goToFavorites = () => {
  router.push('/favorites');
};

/**
 * 重置筛选条件
 */
const resetFilters = () => {
  selectedElement.value = '';
  selectedRegion.value = '';
  selectedRarity.value = '';
  selectedWeapon.value = '';
};

/**
 * 搜索关键词 - 用于模糊搜索
 */
const searchKeyword = ref('');

/**
 * 计算属性：根据筛选条件和搜索关键词过滤角色
 * 动态计算符合当前筛选条件和搜索关键词的角色列表
 * @returns {Array} 符合条件的角色数组
 */
const filteredCharacters = computed(() => {
  return characterStore.characters.filter(char => {
    // 元素、地区、星级、武器筛选
    const matchesElement = !selectedElement.value || char.element === selectedElement.value;
    const matchesRegion = !selectedRegion.value || char.region === selectedRegion.value;
    const matchesRarity = !selectedRarity.value || char.rarity.toString() === selectedRarity.value;
    const matchesWeapon = !selectedWeapon.value || char.weapon === selectedWeapon.value;
    
    // 关键词模糊搜索
    const matchesSearch = !searchKeyword.value || 
      (char.name && char.name.toLowerCase().includes(searchKeyword.value.toLowerCase())) ||
      (char.element && char.element.toLowerCase().includes(searchKeyword.value.toLowerCase())) ||
      (char.weapon && char.weapon.toLowerCase().includes(searchKeyword.value.toLowerCase())) ||
      (char.normal_attack && char.normal_attack.toLowerCase().includes(searchKeyword.value.toLowerCase())) ||
      (char.elemental_skill && char.elemental_skill.toLowerCase().includes(searchKeyword.value.toLowerCase())) ||
      (char.elemental_burst && char.elemental_burst.toLowerCase().includes(searchKeyword.value.toLowerCase())) ||
      (char.region && char.region.toLowerCase().includes(searchKeyword.value.toLowerCase())) ||
      (char.voice_actor_cn && char.voice_actor_cn.toLowerCase().includes(searchKeyword.value.toLowerCase())) ||
      (char.voice_actor_jp && char.voice_actor_jp.toLowerCase().includes(searchKeyword.value.toLowerCase()));
    
    return matchesElement && matchesRegion && matchesRarity && matchesWeapon && matchesSearch;
  });
});

/**
 * 显示角色详情模态框 - 点击角色卡片时触发
 * @param {Object} character - 被点击的角色对象
 */
const showCharacterModal = (character) => {
  selectedCharacter.value = character;
  activeTab.value = 'basic'; // 重置到基本信息标签页
};

/**
 * 关闭模态框 - 点击关闭按钮或模态框外部时触发
 */
const closeModal = () => {
  selectedCharacter.value = null;
};

/**
 * 退出登录方法
 */
const logout = () => {
  // 清除本地存储的令牌和用户信息
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('favorites');
  
  // 重置状态管理器中的收藏列表
  characterStore.favorites = [];
  
  // 跳转到首页
  router.push('/');
};

/**
 * 组件挂载时加载数据 - 在组件首次渲染时自动调用
 * 确保页面加载时就有角色数据显示
 */
onMounted(() => {
  // 加载角色数据和收藏数据
  characterStore.loadCharacters();
  if (isAuthenticated) {
    characterStore.loadFavorites();
  }
});
</script>
<style lang="css" scoped>
/* 导入角色图鉴专用样式 */
@import '../css/CharacterGallery.css';

/* 新增的现代化美化样式 */
.character-gallery {
  padding: 30px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  min-height: calc(100vh - 60px);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.gallery-title {
  text-align: center;
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 30px;
  position: relative;
  padding-bottom: 15px;
  font-weight: 700;
}

.gallery-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
}

/* 筛选面板增强 */
.filters-panel {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.filters-panel::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  transform: rotate(45deg);
  z-index: -1;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.filters-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
  position: relative;
  padding-right: 20px;
}

.filters-header h3::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: linear-gradient(to bottom, #667eea, #764ba2);
  border-radius: 2px;
}

.reset-filters {
  padding: 10px 20px;
  background: linear-gradient(45deg, #95a5a6, #7f8c8d);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.reset-filters:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  background: linear-gradient(45deg, #7f8c8d, #95a5a6);
}

/* 搜索框美化 */
.search-group {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 15px 20px;
  margin-bottom: 20px;
  border: 1px solid rgba(212, 165, 119, 0.3);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.search-group:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-color: rgba(212, 165, 119, 0.5);
}

.search-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
  white-space: nowrap;
}

.search-input {
  flex-grow: 1;
  padding: 12px 20px;
  border: 2px solid #e1e5eb;
  border-radius: 12px;
  font-size: 1rem;
  color: #2c3e50;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  outline: none;
}

.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

/* 筛选容器优化 */
.filters-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  margin-bottom: 10px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

.filter-group select {
  padding: 12px 15px;
  border: 2px solid #e1e5eb;
  border-radius: 12px;
  background-color: white;
  font-size: 1rem;
  color: #2c3e50;
  transition: all 0.3s ease;
  outline: none;
}

.filter-group select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 结果统计增强 */
.results-summary {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.highlight {
  font-weight: 700;
  color: #667eea;
  font-size: 1.2rem;
}

.favorites-btn {
  padding: 12px 25px;
  background: linear-gradient(45deg, #f39c12, #e67e22);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
}

.favorites-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(243, 156, 18, 0.4);
  background: linear-gradient(45deg, #e67e22, #f39c12);
}

.logout-btn {
  padding: 12px 25px;
  background: linear-gradient(45deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
}

.logout-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
  background: linear-gradient(45deg, #c0392b, #e74c3c);
}

/* 认证提示增强 */
.auth-required {
  text-align: center;
  padding: 50px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.auth-required::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  transform: rotate(45deg);
  z-index: -1;
}

.auth-content h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 2rem;
}

.auth-content p {
  color: #7f8c8d;
  margin-bottom: 30px;
  font-size: 1.1rem;
  line-height: 1.6;
}

.login-btn {
  padding: 15px 30px;
  background: linear-gradient(45deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 1.1rem;
  display: inline-block;
}

.login-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
  background: linear-gradient(45deg, #2980b9, #3498db);
}

/* 加载状态美化 */
.loading-state {
  text-align: center;
  padding: 50px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.loading-state::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  transform: rotate(45deg);
  z-index: -1;
}

.spinner {
  border: 5px solid rgba(52, 152, 219, 0.2);
  border-top: 5px solid #3498db;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1.2s ease-in-out infinite;
  margin: 0 auto 25px;
  position: relative;
}

.spinner::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 4px solid rgba(52, 152, 219, 0.1);
  border-radius: 50%;
}

.loading-state p {
  font-size: 1.2rem;
  color: #2c3e50;
  font-weight: 500;
}

/* 错误状态美化 */
.error-state {
  text-align: center;
  padding: 50px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.error-state::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  transform: rotate(45deg);
  z-index: -1;
}

.error-message {
  margin-bottom: 25px;
  font-size: 1.2rem;
  color: #e74c3c;
  font-weight: 500;
}

.retry-btn {
  padding: 15px 30px;
  background: linear-gradient(45deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
}

.retry-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(231, 76, 60, 0.4);
  background: linear-gradient(45deg, #c0392b, #e74c3c);
}

/* 空结果提示 */
.no-results {
  text-align: center;
  padding: 50px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  margin: 30px 0;
}

.no-results::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  transform: rotate(45deg);
  z-index: -1;
}

/* 添加页面进入动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.character-gallery > * {
  animation: fadeIn 0.6s ease forwards;
}

/* 添加一些装饰性元素 */
.character-gallery::after {
  content: '';
  position: absolute;
  top: 20px;
  right: 20px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  opacity: 0.1;
  z-index: -1;
}
</style>