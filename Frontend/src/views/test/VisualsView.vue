<script setup>
import VisualsDemo from '@/components/test/VisualsDemo.vue'
</script>

<template>
  <div class="visuals-page container py-5">
    <h1 class="mb-3">Visuals — Style guide playground</h1>
    <p class="text-muted mb-4">Interactive preview of buttons, cards, colors and typography from the Charte Graphique.</p>
    <VisualsDemo />
  </div>
</template>

<style scoped>
.visuals-page {
  min-height: 60vh;
}
</style>
