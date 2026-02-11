<template>
  <div 
    class="character-card"
    @click="handleClick"
  >
    <div class="character-image">
      <img 
        :src="character.image" 
        :alt="character.name" 
        loading="lazy" 
        @load="onImgLoad"
        :class="{ 'loaded': imgLoaded }"
      />
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

const emit = defineEmits(['click', 'favorite', 'img-loaded'])

const imgLoaded = ref(false)
const onImgLoad = () => {
  imgLoaded.value = true
  emit('img-loaded')
}

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
@import '../css/CharacterCard.css';
</style>