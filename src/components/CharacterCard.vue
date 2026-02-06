<template>
  <div 
    class="character-card"
    @click="handleClick"
  >
    <div class="character-image">
      <img :src="character.image" :alt="character.name" />
      <div class="character-overlay">
        <span class="rarity-stars">{{ '★'.repeat(character.rarity) }}</span>
        <button 
          class="favorite-btn" 
          @click.stop="toggleFavorite"
          :class="{ active: isFavorite }"
        >
          {{ isFavorite ? '★' : '☆' }}
        </button>
      </div>
    </div>
    <div class="character-info">
      <h3 class="character-name">{{ character.name }}</h3>
      <div class="character-meta">
        <span 
          :class="['element-badge', elementClassMap[character.element]]"
          v-if="character.element"
        >{{ character.element }}</span>
        <span class="weapon-badge" v-if="character.weapon">{{ character.weapon }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useCharacterStore } from '../stores/characterStore'

const props = defineProps({
  character: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'favorite'])

const characterStore = useCharacterStore()

// 元素样式映射 - 将元素名称映射到对应的CSS类名
const elementClassMap = {
  '风元素': 'Anemo',
  '火元素': 'Pyro',
  '雷元素': 'Electro',
  '岩元素': 'Geo',
  '冰元素': 'Cryo',
  '水元素': 'Hydro',
  '草元素': 'Dendro'
}

// 计算属性：检查角色是否已收藏
const isFavorite = computed(() => {
  return characterStore.isCharacterFavorite(props.character.id)
})

// 处理点击事件
const handleClick = () => {
  emit('click', props.character)
}

// 切换收藏状态
const toggleFavorite = async () => {
  try {
    await characterStore.toggleFavorite(props.character.id)
    emit('favorite', props.character.id)
  } catch (error) {
    console.error('切换收藏状态失败:', error)
    alert('操作失败，请稍后重试')
  }
}
</script>

<style scoped>
@import '../css/CharacterGallery.css';

/* 基础卡片样式 - 限制最大宽度 */
.character-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  max-width: 280px; /* 限制卡片最大宽度 */
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  background: white;
}

/* 卡片悬停效果 */
.character-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

/* 图片区域 - 固定比例 */
.character-image {
  position: relative;
  height: 180px; /* 固定图片高度 */
  overflow: hidden;
}

.character-image img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保持图片比例 */
  transition: transform 0.3s ease;
}

.character-card:hover .character-image img {
  transform: scale(1.05);
}

/* 信息区域 - 紧凑布局 */
.character-info {
  padding: 15px;
}

.character-name {
  font-size: 1.2rem;
  margin: 0 0 8px 0;
  color: #333;
}

.character-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* 元素和武器徽章 - 更紧凑的样式 */
.element-badge, .weapon-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

/* 覆盖CharacterGallery.css中的样式 */
.character-card {
  margin: 0;
}

/* 星级和收藏按钮位置调整 */
.character-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
}

.rarity-stars {
  color: #ffd700;
  font-size: 1rem;
  text-shadow: 0 0 5px rgba(0,0,0,0.5);
}

.favorite-btn {
  background: rgba(0,0,0,0.5);
  border: none;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.favorite-btn.active {
  background: rgba(255, 215, 0, 0.8);
  color: white;
}
</style>