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
    next('/login');
  } 
  // 检查是否只允许访客访问
  else if (to.meta.guestOnly && isAuthenticated) {
    next('/');
  } 
  else {
    next();
  }
});

export default router;