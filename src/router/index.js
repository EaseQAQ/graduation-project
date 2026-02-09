import { createRouter, createWebHistory } from 'vue-router';
import Homepage from '../components/Homepage.vue';
import CharacterGallery from '../components/CharacterGallery.vue';
import Favorites from '../views/Favorites.vue';
import Login from '../views/Login.vue';  
import Register from '../views/Register.vue';  

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Homepage
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: CharacterGallery
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: Favorites,
    meta: { requiresAuth: true }  // 添加认证要求
  },
  {  
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true }
  },
  {  
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guestOnly: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 添加路由守卫 - 保护需要认证的路由
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !isAuthenticated) {
    // 保存用户想要访问的路径，登录后重定向回去
    next({ path: '/login', query: { redirect: to.fullPath } });
  } 
  // 检查是否只允许访客访问
  else if (to.meta.guestOnly && isAuthenticated) {
    // 如果已登录用户访问登录/注册页面，重定向到首页
    next('/');
  } 
  else {
    next();
  }
});

// 全局后置钩子 - 页面切换时滚动到顶部
router.afterEach(() => {
  // 滚动到页面顶部
  window.scrollTo(0, 0);
});

export default router;