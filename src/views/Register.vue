<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">用户注册</h2>
      <button class="close-button" @click="router.push('/')">&times;</button>
      
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="userData.username" 
            required 
            placeholder="请输入用户名"
            minlength="3"
            maxlength="20"
          >
        </div>
        
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="userData.email" 
            required 
            placeholder="请输入邮箱"
          >
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="userData.password" 
            required 
            placeholder="请输入密码"
            minlength="6"
          >
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            required 
            placeholder="请确认密码"
          >
        </div>
        
        <button type="submit" class="auth-button" :disabled="isLoading || !isFormValid">
          {{ isLoading ? '注册中...' : '注册' }}
        </button>
        
        <div class="auth-link">
          已有账号？<router-link to="/login">立即登录</router-link>
        </div>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/authService';
import { useCharacterStore } from '../stores/characterStore';

const router = useRouter();
const store = useCharacterStore();
const userData = ref({ username: '', email: '', password: '' });
const confirmPassword = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

// 表单验证
const isFormValid = computed(() => {
  return (
    userData.value.username.trim() !== '' &&
    userData.value.email.trim() !== '' &&
    userData.value.password.trim() !== '' &&
    confirmPassword.value.trim() !== '' &&
    userData.value.password === confirmPassword.value &&
    userData.value.password.length >= 6
  );
});

const handleRegister = async () => {
  if (!isFormValid.value) return;
  
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    const response = await authService.register(userData.value);
    
    // 存储令牌和用户信息
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // 加载用户收藏
    await store.loadFavorites();
    
    // 跳转到首页
    router.push('/');
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '注册失败，请重试';
    console.error('注册错误:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
@import '../css/AuthShared.css';
</style>