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
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.auth-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 450px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.auth-card::before {
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

.auth-title {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
  font-size: 2rem;
  position: relative;
  padding-bottom: 15px;
}

.auth-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #34495e;
  font-size: 1rem;
}

.form-group input {
  padding: 15px;
  border: 2px solid #e1e5eb;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #f8fafc;
  outline: none;
}

.form-group input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

.auth-button {
  padding: 16px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
  margin-top: 10px;
}

.auth-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  background: linear-gradient(45deg, #764ba2, #667eea);
}

.auth-button:disabled {
  background: linear-gradient(45deg, #bdc3c7, #95a5a6);
  transform: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: not-allowed;
}

.auth-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: 0.5s;
}

.auth-button:hover::after {
  left: 100%;
}

.auth-link {
  text-align: center;
  margin-top: 20px;
  color: #7f8c8d;
  font-size: 0.95rem;
}

.auth-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.auth-link a:hover {
  color: #764ba2;
  text-decoration: underline;
}

.error-message {
  color: #e74c3c;
  text-align: center;
  margin-top: 15px;
  padding: 15px;
  background: linear-gradient(45deg, #ffebee, #fadbd8);
  border-radius: 12px;
  border-left: 4px solid #e74c3c;
  animation: fadeIn 0.3s ease;
}

/* 添加输入框动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 添加页面进入动画 */
@keyframes slideIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.auth-container {
  animation: slideIn 0.6s ease forwards;
}

/* 添加一些装饰性元素 */
.auth-card::after {
  content: '';
  position: absolute;
  top: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  opacity: 0.1;
  z-index: -1;
}

/* 退出按钮样式 */
.close-button {
  position: absolute;
  top: 25px;
  right: 25px;
  width: 50px;
  height: 50px;
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
</style>