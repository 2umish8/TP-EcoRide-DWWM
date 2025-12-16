<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="['icon-btn', sizeClass, { danger: danger }]"
    v-bind="$attrs"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({ name: 'IconButton' })

const props = defineProps({
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  size: { type: String, default: 'md' },
  danger: { type: Boolean, default: false },
})
const emit = defineEmits(['click'])

const sizeClass = computed(() => (props.size && props.size !== 'md' ? `btn-${props.size}` : ''))

const onClick = (event) => {
  if (props.disabled) {
    event?.preventDefault?.()
    event?.stopPropagation?.()
    return
  }
  emit('click', event)
}
</script>

<style scoped>
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  border: none;
  background-color: transparent;
  color: var(--color-light);
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
}

.icon-btn:hover:not([disabled]) {
  background-color: rgba(143, 218, 179, 0.2);
  transform: scale(1.1);
}

.icon-btn[disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}

.icon-btn.danger {
  color: var(--color-error);
}

.icon-btn.danger:hover:not([disabled]) {
  background-color: rgba(205, 101, 112, 0.2);
}

.icon-btn.btn-sm {
  padding: 0.375rem;
  font-size: 0.875rem;
}

.icon-btn.btn-lg {
  padding: 0.75rem;
  font-size: 1.25rem;
}
</style>
