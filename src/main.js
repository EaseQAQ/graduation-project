import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { createRouter, createWebHistory } from "vue-router";
import router from "./router/index.js";
import { createPinia } from "pinia";
import { useCharacterStore } from "./stores/characterStore";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const appInstance = app.mount("#app");

// 延迟加载用户收藏，确保路由系统已准备就绪
router.isReady().then(() => {
  const characterStore = useCharacterStore();
  characterStore.loadFavorites();
});
