<script setup>
import BaseButton from './BaseButton.vue'
const props = defineProps({
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
  to: { type: String, default: null },
})

const emit = defineEmits(['click'])
</script>

<template>
  <BaseButton
    :disabled="props.disabled"
    :type="props.type"
    :to="props.to"
    class="primary-btn"
    @click="emit('click')"
  >
    <slot />
  </BaseButton>
</template>

<style scoped>
.primary-btn {
  background: var(--main-color);
  color: var(--dark-color);
  border-radius: 8px;
  border: none;
  padding: 10px 16px;
  font-weight: 600;
}
.primary-btn:hover {
  filter: brightness(0.95);
  transform: translateY(-2px);
}
.primary-btn[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
