<template>
  <RouterLink
    v-if="to && !disabled"
    :to="to"
    :class="['base-btn', sizeClass]"
    v-bind="attrs"
    @click="onClick"
  >
    <slot />
  </RouterLink>

  <button
    v-else
    :type="type"
    :disabled="disabled"
    :class="['base-btn', sizeClass]"
    v-bind="attrs"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { computed } from 'vue'
import { useAttrs } from 'vue'

defineOptions({ name: 'BaseButton' })

const props = defineProps({
  to: { type: [String, Object], required: false },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  size: { type: String, default: 'md' },
})
const emit = defineEmits(['click'])
const attrs = useAttrs()

const sizeClass = computed(() => (props.size && props.size !== 'md' ? `btn-${props.size}` : ''))

const onClick = (e) => {
  if (props.disabled) {
    e?.preventDefault?.()
    e?.stopPropagation?.()
    return
  }
  emit('click', e)
}
</script>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 50px;
  border: none;

  font-size: 1rem;
  font-weight: 600;
  font-family: var(--font-family);

  text-decoration: none;
  white-space: nowrap;

  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;

  background-color: var(--color-primary);
  color: var(--color-dark);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.base-btn[disabled] {
  cursor: not-allowed;
  opacity: 0.6;
  background-color: var(--color-gray);
  color: var(--color-light);
}

.base-btn:hover:not([disabled]) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.base-btn.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.base-btn.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}
</style>
