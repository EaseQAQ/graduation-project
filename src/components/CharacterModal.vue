<template>
  <div 
    class="modal-overlay" 
    @click="closeModal"
    v-if="character"
  >
    <div class="modal-content" @click.stop>
      <div class="modal-header">
<div class="character-image-container">
  <div class="character-image-large" @click="toggleImagePreview">
    <img 
      :src="character.image" 
      :alt="character.name"
      :class="{ 'preview-mode': isImagePreview }"
    />
  </div>
  <div v-if="isImagePreview" class="fullscreen-preview" @click="toggleImagePreview">
    <img :src="character.image" :alt="character.name" />
  </div>
</div>
        <div class="character-details">
          <h2>{{ character.name }}</h2>
          <div class="character-meta-large">
            <span 
              :class="['element-badge', elementClassMap[character.element]]"
              v-if="character.element"
            >{{ character.element }}</span>
            <span class="weapon-badge" v-if="character.weapon">{{ character.weapon }}</span>
            <span class="rarity-stars">{{ '★'.repeat(character.rarity) }}</span>
          </div>
          <p class="character-description">{{ character.description || '暂无描述' }}</p>
        </div>
      </div>

      <div class="modal-body">
        <div class="tabs">
          <button 
            v-for="(tab, index) in tabs" 
            :key="index"
            :class="{ active: activeTab === tab.name }"
            @click="activeTab = tab.name"
          >
            {{ tab.label }}
          </button>
        </div>
        
        <div class="tab-content">
          <!-- 基础信息标签页 -->
          <div v-show="activeTab === 'basic'" class="tab-pane">
            <h3>基础信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">地区：</span>
                <span class="info-value">{{ character.region || '未知' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">基础生命值：</span>
                <span class="info-value">{{ character.base_hp || 0 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">基础攻击力：</span>
                <span class="info-value">{{ character.base_atk || 0 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">基础防御力：</span>
                <span class="info-value">{{ character.base_def || 0 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">中文声优：</span>
                <span class="info-value">{{ character.voice_actor_cn || '未知' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">日文声优：</span>
                <span class="info-value">{{ character.voice_actor_jp || '未知' }}</span>
              </div>
            </div>
          </div>
          
          <!-- 技能标签页 -->
          <div v-show="activeTab === 'skills'" class="tab-pane">
            <h3>技能</h3>
            <div class="skills-container">
              <div class="skill-item">
                <h4>普通攻击</h4>
                <p>{{ character.normal_attack || '暂无数据' }}</p>
              </div>
              <div class="skill-item">
                <h4>元素战技</h4>
                <p>{{ character.elemental_skill || '暂无数据' }}</p>
              </div>
              <div class="skill-item">
                <h4>元素爆发</h4>
                <p>{{ character.elemental_burst || '暂无数据' }}</p>
              </div>
            </div>
          </div>
          
          <!-- 材料标签页 -->
          <div v-show="activeTab === 'materials'" class="tab-pane">
            <h3>突破材料</h3>
            <div v-if="processMaterials(character.ascension_materials).length === 0" class="no-materials">
              暂无突破材料数据
            </div>
            <ul class="materials-list" v-else>
              <li 
                v-for="(material, index) in processMaterials(character.ascension_materials)" 
                :key="index"
              >
                {{ material.trim() }}
              </li>
            </ul>

            <h3>天赋材料</h3>
            <div v-if="processMaterials(character.talent_materials).length === 0" class="no-materials">
              暂无天赋材料数据
            </div>
            <ul class="materials-list" v-else>
              <li 
                v-for="(material, index) in processMaterials(character.talent_materials)" 
                :key="index"
              >
                {{ material.trim() }}
              </li>
            </ul>
          </div>
          
          <!-- 角色故事标签页 -->
          <div v-show="activeTab === 'story'" class="tab-pane">
            <h3>角色故事</h3>
            <div class="story-content">
              {{ character.character_story || '暂无故事' }}
            </div>
          </div>
          
          <!-- 命之座标签页 -->
          <div v-show="activeTab === 'constellations'" class="tab-pane">
            <h3>命之座</h3>
            <ul class="constellations-list" v-if="processMaterials(character.constellations).length > 0">
              <li 
                v-for="(constellation, index) in processMaterials(character.constellations)" 
                :key="index"
              >
                <strong>{{ index + 1 }}. {{ constellation || '未知' }}</strong>
              </li>
            </ul>
            <p v-else>暂无命之座数据</p>
          </div>
          
          <!-- 被动天赋标签页 -->
          <div v-show="activeTab === 'passive'" class="tab-pane">
            <h3>被动天赋</h3>
            <ul class="passive-talents-list" v-if="processMaterials(character.passive_talents).length > 0">
              <li 
                v-for="(talent, index) in processMaterials(character.passive_talents)" 
                :key="index"
              >
                <strong>{{ talent || '未知天赋' }}</strong>
              </li>
            </ul>
            <p v-else>暂无被动天赋数据</p>
          </div>
        </div>
        
        <!-- 模态框底部操作按钮 -->
        <div class="modal-footer">
          <button @click="toggleFavorite" :class="['modal-btn', isFavorited ? 'favorited' : '']">
            {{ isFavorited ? '已收藏' : '收藏' }}
          </button>
          <button @click="closeModal" class="modal-btn close-btn">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '../stores/characterStore'

const props = defineProps({
  character: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])
const router = useRouter()
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

// 标签页配置
const tabs = [
  { name: 'basic', label: '基础信息' },
  { name: 'skills', label: '技能' },
  { name: 'materials', label: '材料' },
  { name: 'story', label: '角色故事' },
  { name: 'constellations', label: '命之座' },
  { name: 'passive', label: '被动天赋' }
]

// 当前激活的标签页
const activeTab = ref('basic')

// 处理材料数据 - 移除括号并分割
const processMaterials = (materials) => {
  if (!materials) return []
  
  // 移除字符串中的括号
  const removeBrackets = (str) => {
    return str.replace(/^\[|\]$/g, '').trim()
  }
  
  // 处理字符数组的特殊情况（每个元素是单个字符）
  if (Array.isArray(materials)) {
    // 检查是否所有元素都是单个字符
    const allSingleChars = materials.every(m => typeof m === 'string' && m.length === 1)
    if (allSingleChars) {
      // 合并字符数组为字符串后重新处理
      return processMaterials(materials.join(''))
    }
    // 常规数组处理：过滤空字符串并修剪每个元素，同时移除括号
    return materials
      .map(m => {
        const str = typeof m === 'string' ? m.trim() : String(m)
        return removeBrackets(str)
      })
      .filter(m => m.length > 0)
  }
  
  if (typeof materials === 'string') {
    let trimmed = materials.trim()
    // 移除字符串两端的括号
    trimmed = removeBrackets(trimmed)
    if (trimmed.length === 0) return []
    
    // 尝试按常见分隔符分割: 逗号、分号、中文逗号、中文分号、空格
    const splitMaterials = trimmed.split(/[,;，；\s]+/).filter(m => m && m.trim().length > 0)
    
    if (splitMaterials.length > 0) {
      return splitMaterials
    }
    
    // 如果没有分割出多个项，且字符串长度足够，视为单个材料名称
    if (trimmed.length >= 2) {
      return [trimmed]
    }
  }
  
  return []
}

// 检查用户是否已登录
const isAuthenticated = computed(() => {
  return !!localStorage.getItem('token')
})

// 检查当前角色是否已收藏（仅在登录状态下有效）
const isFavorited = computed(() => {
  return isAuthenticated.value && characterStore.isCharacterFavorite(props.character.id)
})

// 切换收藏状态
const toggleFavorite = async () => {
  if (!isAuthenticated.value) {
    // 用户未登录，跳转到登录页面
    // 确保在跳转前恢复页面滚动
    document.body.style.overflow = 'auto'
    emit('close')
    router.push('/login')
    return
  }
  
  try {
    await characterStore.toggleFavorite(props.character.id)
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
    alert('收藏操作失败，请重试')
  }
}

// 关闭模态框
const isImagePreview = ref(false)

const toggleImagePreview = () => {
  isImagePreview.value = !isImagePreview.value
}

const closeModal = () => {
  isImagePreview.value = false
  emit('close')
}
</script>

<style>
@import '../css/CharacterModal.css';
@import '../css/CharacterGallery.css';

</style>
