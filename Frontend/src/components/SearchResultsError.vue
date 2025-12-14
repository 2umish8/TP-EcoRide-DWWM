<template>
  <div class="state-container">
    <div class="error-state">
      <h3>Erreur</h3>
      <p>{{ message }}</p>
      <button @click="$emit('retry')" class="retry-btn">Réessayer</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    required: true,
  },
})

defineEmits(['retry'])
</script>

<style scoped>
.state-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
}

.error-state {
  background: #2a2a2a;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  margin: 20px 0;
  border: 1px solid #444;
}

.error-state h3 {
  color: #ef4444;
  margin-bottom: 10px;
}

.retry-btn {
  background: #34d399;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 15px;
  font-weight: 600;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #3b82f6;
  color: #fff;
  transform: translateY(-1px);
}
</style>
