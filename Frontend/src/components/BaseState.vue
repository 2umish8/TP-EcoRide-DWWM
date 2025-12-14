<template>
  <div class="state-container">
    <div class="state-icon">
      <slot name="icon" />
    </div>
    <h3 class="state-title">
      <slot name="title" />
    </h3>
    <p class="state-message">
      <slot name="message" />
    </p>
    <slot name="actions" />
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'empty',
    validator: (value) => ['empty', 'error', 'loading'].includes(value),
  },
})
</script>

<style scoped>
.state-container {
  text-align: center;
  padding: 3rem 2rem;
  background: var(--color-dark-secondary);
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  color: var(--color-light-secondary);
}

.state-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.state-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-light);
  margin-bottom: 0.5rem;
}

.state-message {
  font-size: 1rem;
  color: var(--color-gray);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}
</style>
