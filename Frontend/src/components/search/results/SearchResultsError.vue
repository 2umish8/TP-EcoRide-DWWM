<template>
  <div class="state-container">
    <div class="error-state">
      <h3>Erreur</h3>
      <p>{{ message }}</p>
      <PrimaryButton @click="$emit('retry')">Réessayer</PrimaryButton>
    </div>
  </div>
</template>

<script setup>
import PrimaryButton from '@/components/ui/buttons/PrimaryButton.vue'

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
  background: var(--color-dark-secondary);
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  margin: 20px 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.error-state h3 {
  color: var(--color-error);
  margin-bottom: 10px;
}

.retry-btn {
  background: var(--color-primary);
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
  background: var(--color-primary);
  color: var(--color-light);
  transform: translateY(-1px);
}
</style>
