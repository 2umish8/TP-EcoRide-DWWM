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
    class="nav-btn"
    @click="emit('click')"
  >
    <slot />
  </BaseButton>
</template>

<style scoped>
.nav-btn {
  padding: 8px 12px;
  font-size: var(--font-size-sm);
  background: transparent;
  color: var(--light-color);
  border: none;
}
.nav-btn:hover {
  background: rgba(255, 255, 255, 0.04);
  transform: translateY(-2px);
}
.nav-btn[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
