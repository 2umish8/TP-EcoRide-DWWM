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
    class="secondary-btn"
    @click="emit('click')"
  >
    <slot />
  </BaseButton>
</template>

<style scoped>
.secondary-btn {
  background: transparent;
  color: var(--main-color);
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 10px 16px;
  border-radius: 8px;
}
.secondary-btn:hover {
  background: var(--main-color);
  color: var(--dark-color);
  filter: brightness(0.98);
}
.secondary-btn[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
