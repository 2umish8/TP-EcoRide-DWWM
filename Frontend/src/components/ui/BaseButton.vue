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
  gap: var(--spacing-sm);
  padding: 10px 20px;
  border-radius: var(--radius-button);

  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);

  text-decoration: none;
  white-space: nowrap;

  cursor: pointer;
  user-select: none;
  transition: var(--transition-standard);
  border: none;

  /* Default: primary button look centralized here */
  background-color: var(--color-primary);
  color: var(--color-dark);
  box-shadow: var(--shadow-button);
}

.base-btn[disabled] {
  cursor: not-allowed;
  opacity: 0.6;
  /* disabled primary appearance */
  background-color: var(--color-gray);
  color: var(--color-light);
}

.base-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-button-hover);
}

/* size helpers */
.base-btn.btn-sm {
  padding: 8px 16px;
  font-size: var(--font-size-sm);
}
.base-btn.btn-lg {
  padding: 16px 32px;
  font-size: var(--font-size-lg);
}
</style>
