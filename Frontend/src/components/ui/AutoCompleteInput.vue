<template>
  <div class="autocomplete-input" ref="root">
    <BaseInput
      :model-value="query"
      :placeholder="placeholder"
      :size="size"
      :variant="variant"
      @update:model-value="onQueryChange"
      @focus="openDropdown"
      @blur="onBlur"
      @keydown.down.prevent="onArrowDown"
      @keydown.up.prevent="onArrowUp"
      @keydown.enter.prevent="onEnter"
      @keydown.esc.prevent="closeDropdown"
      :aria-expanded="open.toString()"
      :aria-controls="listId"
      role="combobox"
      autocomplete="off"
      v-bind="$attrs"
    />

    <ul
      v-show="open && suggestions.length"
      :id="listId"
      class="suggestions"
      role="listbox"
      @mousedown.prevent
    >
      <li
        v-for="(suggestion, index) in suggestions"
        :key="suggestion"
        :class="['suggestion', { highlighted: index === highlightedIndex }]"
        role="option"
        :aria-selected="(index === highlightedIndex).toString()"
        @mousedown.prevent="select(suggestion)"
        @mousemove="highlightedIndex = index"
      >
        {{ suggestion }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import BaseInput from './BaseInput.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  suggestions: { type: Array, default: () => [] },
  size: { type: String, default: 'md' },
  variant: { type: String, default: 'default' },
  storageKey: { type: String, default: null },
  maxRecent: { type: Number, default: 5 },
})
const emit = defineEmits(['update:modelValue', 'blur'])

const root = ref(null)
const query = ref(props.modelValue)
const open = ref(false)
const highlightedIndex = ref(-1)
const listId = `autocomplete-${Math.random().toString(36).slice(2, 8)}`

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== query.value) query.value = newValue || ''
  },
)

function loadRecents() {
  if (!props.storageKey) return []
  try {
    const raw = localStorage.getItem(props.storageKey) || '[]'
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveRecent(item) {
  if (!item || !props.storageKey) return
  const list = loadRecents().filter((recentCity) => recentCity !== item)
  list.unshift(item)
  const trimmed = list.slice(0, props.maxRecent)
  localStorage.setItem(props.storageKey, JSON.stringify(trimmed))
}

const filteredSuggestions = computed(() => {
  const query_lower = query.value.trim().toLowerCase()
  if (!query_lower) return props.suggestions
  return props.suggestions
    .filter((suggestion) => suggestion.toLowerCase().includes(query_lower))
    .slice(0, 8)
})

function openDropdown() {
  open.value = true
  highlightedIndex.value = -1
}

function closeDropdown() {
  open.value = false
  highlightedIndex.value = -1
}

function onQueryChange(value) {
  query.value = value
  open.value = true
  highlightedIndex.value = -1
  emit('update:modelValue', value)
}

function onBlur() {
  closeDropdown()
  emit('blur')
}

function select(item) {
  emit('update:modelValue', item)
  query.value = item
  if (props.storageKey) saveRecent(item)
  closeDropdown()
}

function onArrowDown() {
  if (!open.value) openDropdown()
  highlightedIndex.value = Math.min(
    highlightedIndex.value + 1,
    filteredSuggestions.value.length - 1,
  )
}

function onArrowUp() {
  highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
}

function onEnter() {
  if (highlightedIndex.value >= 0 && filteredSuggestions.value[highlightedIndex.value]) {
    select(filteredSuggestions.value[highlightedIndex.value])
  } else if (query.value.trim()) {
    select(query.value.trim())
  }
}

function onClickOutside(event) {
  if (!root.value) return
  if (!root.value.contains(event.target)) closeDropdown()
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.autocomplete-input {
  position: relative;
  flex: 1;
}

.suggestions {
  position: absolute;
  z-index: 40;
  left: 0;
  right: 0;
  margin-top: 6px;
  background: var(--color-dark);
  color: var(--color-light);
  border-radius: 8px;
  max-height: 220px;
  overflow: auto;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
  padding: 6px 0;
  list-style: none;
}

.suggestion {
  padding: 8px 12px;
  cursor: pointer;
}

.suggestion.highlighted {
  background: rgba(255, 255, 255, 0.06);
}
</style>
