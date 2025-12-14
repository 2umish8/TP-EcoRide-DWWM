<template>
  <font-awesome-icon :icon="mappedIcon" :class="iconClass" :style="sizeStyle" />
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: [String, Number],
    default: 18,
  },
  iconClass: {
    type: String,
    default: 'custom-icon',
  },
})

const mappedIcon = computed(() => {
  switch (props.name) {
    case 'user-edit':
      return ['fas', 'user-edit']
    case 'coins':
      return ['fas', 'coins']
    case 'sign-out':
      return ['fas', 'sign-out-alt']
    default:
      return ['fas', 'question-circle']
  }
})

const sizeStyle = computed(() => {
  const val = typeof props.size === 'number' ? props.size + 'px' : props.size
  return { fontSize: val }
})
</script>

<style scoped>
.custom-icon {
  display: inline-block;
  vertical-align: middle;
}
</style>





