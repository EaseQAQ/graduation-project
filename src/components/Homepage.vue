<template>
  <!-- 
    首页组件
    功能：展示应用首页，包含登录/注册入口、用户欢迎信息和角色图鉴导航
    结构：
    - 英雄区（Hero Section）：包含标题、副标题、用户操作区和导航按钮
    - 用户欢迎区：已登录用户显示欢迎信息和退出按钮
    - 认证操作区：未登录用户显示登录/注册按钮
  -->
  <div class="homepage">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">图鉴系统</h1>
        <p class="hero-subtitle">探索<img src="/images/genshin.png" alt="Genshin Impact" class="logo-img">中的所有角色</p>
        
        <!-- 用户欢迎区域 - 已登录用户显示 -->
        <div v-if="isAuthenticated" class="user-welcome">
          <span class="welcome-message">欢迎回来，{{ currentUser.username }}！</span>
          <button @click="logout" class="logout-btn">退出登录</button>
        </div>
        
        <!-- 认证操作区域 - 未登录用户显示 -->
        <div v-else class="auth-actions">
          <button @click="goToLogin" class="auth-btn login-btn">登录</button>
          <button @click="goToRegister" class="auth-btn register-btn">注册</button>
        </div>
        
        <!-- 导航按钮 - 进入角色图鉴 -->
        <button @click="goToGallery" class="nav-btn">进入角色图鉴</button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 首页组件脚本
 * 功能：
 * - 处理页面导航逻辑
 * - 管理用户认证状态
 * - 实现登录/注册/退出功能
 * 
 * 依赖：
 * - vue-router：用于页面导航
 * - @/data/characters：角色数据（备用）
 */
import { ref } from 'vue';
import { useRouter } from 'vue-router';


// 路由器实例 - 用于页面导航
const router = useRouter();

/**
 * 用户认证状态 - 从localStorage获取
 * 判断用户是否已登录
 */
const isAuthenticated = !!localStorage.getItem('token');
const currentUser = ref(JSON.parse(localStorage.getItem('user')) || {});

/**
 * 导航到角色图鉴页面
 * 功能：点击按钮时跳转到角色图鉴页面
 */
const goToGallery = () => {
  router.push('/gallery');
};

/**
 * 导航到登录页面
 * 功能：点击登录按钮时触发
 */
const goToLogin = () => {
  router.push('/login');
};

/**
 * 导航到注册页面
 * 功能：点击注册按钮时触发
 */
const goToRegister = () => {
  router.push('/register');
};

/**
 * 退出登录功能
 * 功能：清除本地存储的用户信息和令牌，重定向到首页
 */
const logout = () => {
  // 清除所有相关的本地存储数据
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('favorites');
  
  // 使用路由器导航到首页（不刷新页面）
  router.push('/');
};
</script>

<style lang="css" scoped>
/* 导入首页专用样式 */
@import '../css/Homepage.css';

</style>