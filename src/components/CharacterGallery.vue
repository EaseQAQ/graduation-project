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

</style>