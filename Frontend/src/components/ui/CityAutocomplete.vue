<template>
  <AutoCompleteInput
    :model-value="modelValue"
    :placeholder="placeholder"
    :suggestions="allSuggestions"
    :storage-key="storageKey"
    :max-recent="maxRecent"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup>
import { computed } from 'vue'
import AutoCompleteInput from './AutoCompleteInput.vue'
import FR_CITIES, { POPULAR_CITIES } from '@/data/fr-cities'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  storageKey: { type: String, default: 'recentCities' },
  maxRecent: { type: Number, default: 5 },
})
defineEmits(['update:modelValue'])

function loadRecents() {
  try {
    const raw = localStorage.getItem(props.storageKey) || '[]'
    return JSON.parse(raw)
  } catch {
    return []
  }
}

const allSuggestions = computed(() => {
  const query_lower = props.modelValue.trim().toLowerCase()
  if (!query_lower) {
    // On empty query, show 2 last recents + 3 populars not in recents
    const recents = loadRecents() || []
    const firstRecents = recents.slice(0, 2)
    const popular = POPULAR_CITIES.filter((city) => !firstRecents.includes(city)).slice(0, 3)
    return [...firstRecents, ...popular]
  }
  // filter allCities by substring
  return FR_CITIES.filter((city) => city.toLowerCase().includes(query_lower))
})
</script>
