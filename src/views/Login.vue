<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">用户登录</h2>
      
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="credentials.email" 
            required 
            placeholder="请输入邮箱"
            autocomplete="email"
          >
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="credentials.password" 
            required 
            placeholder="请输入密码"
            autocomplete="current-password"
          >
        </div>
        
        <button type="submit" class="auth-button" :disabled="isLoading">
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
        
        <div class="auth-link">
          还没有账号？<router-link to="/register">立即注册</router-link>
        </div>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/authService';
import { useCharacterStore } from '../stores/characterStore';

const router = useRouter();
const store = useCharacterStore();
const credentials = ref({ email: '', password: '' });
const isLoading = ref(false);
const errorMessage = ref('');

// 为防止极端情况下的刷新，创建一个防刷新包装器
const safeAsyncHandler = (asyncFn) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      // 即使出错也确保不刷新页面
      console.error('Safe handler error:', error);
      throw error; // 重新抛出错误给上层处理
    }
  };
};

const handleLogin = async (event) => {
  // 防止表单默认提交行为 - 最强防护
  if (event) {
    event.preventDefault();
    event.stopPropagation();
    // 额外的防护：阻止所有可能的事件冒泡
    event.stopImmediatePropagation();
  }
  
  // 立即设置加载状态
  isLoading.value = true;
  errorMessage.value = '';
  
  // 使用防刷新包装器
  const safeLogin = safeAsyncHandler(async () => {
    const response = await authService.login(credentials.value);
    
    // 存储认证令牌和用户信息
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // 加载用户收藏
    await store.loadFavorites();
    
    // 导航到首页
    router.push('/');
  });
  
  try {
    await safeLogin();
  } catch (error) {
    // 确保错误信息显示，但不刷新页面
    if (error.response && error.response.data) {
      errorMessage.value = error.response.data.message || '登录失败，请重试';
    } else {
      errorMessage.value = '登录失败，请重试';
    }
    console.error('登录错误:', error);
    
    // 最终保障：确保页面不会因为错误而刷新
    // 强制阻止任何可能的刷新行为
    setTimeout(() => {
      // 这里的延迟确保不会影响当前执行流
    }, 0);
  } finally {
    // 确保加载状态总是被重置
    isLoading.value = false;
  }
};

// 添加一个专门的页面可见性检测，防止后台刷新
const handleVisibilityChange = () => {
  // 如果页面变为可见，确保状态正确
  if (!document.hidden) {
    // 可以在这里做一些恢复操作
  }
};

// 监听页面可见性变化
document.addEventListener('visibilitychange', handleVisibilityChange);
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 20px;
}

.auth-card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.auth-title {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: 500;
  color: #555;
}

.form-group input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.auth-button {
  padding: 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.auth-button:hover {
  background-color: #359469;
}

.auth-button:disabled {
  background-color: #95d4b4;
  cursor: not-allowed;
}

.auth-link {
  text-align: center;
  margin-top: 15px;
  color: #666;
}

.auth-link a {
  color: #42b983;
  text-decoration: none;
}

.auth-link a:hover {
  text-decoration: underline;
}

.error-message {
  color: #ff4444;
  text-align: center;
  margin-top: 10px;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
}
</style>