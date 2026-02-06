<script setup>
import { RouterView } from 'vue-router';
import CharacterGallery from './components/CharacterGallery.vue';
import Homepage from './components/Homepage.vue';
</script>

<template>
  <div class="app-container">
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>

.app-main {
  flex: 1;
}
</style>