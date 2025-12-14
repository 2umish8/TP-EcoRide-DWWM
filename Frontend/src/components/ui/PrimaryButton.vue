<template>
  <BaseButton v-bind="$attrs" :size="props.size" :class="computedClass">
    <slot />
  </BaseButton>
</template>

<script setup>
import BaseButton from './BaseButton.vue'
const props = defineProps({ size: { type: String, default: 'md' } })
const computedClass = props.size && props.size !== 'md' ? `btn-${props.size}` : ''
</script>
