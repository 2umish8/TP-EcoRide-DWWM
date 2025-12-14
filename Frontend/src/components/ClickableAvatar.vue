<template>
  <div class="clickable-avatar-container" @click="handleClick">
    <img
      :src="avatarSrc"
      :alt="alt"
      class="clickable-avatar"
      :class="{ clickable: clickable, [size]: true }"
    />
    <div v-if="showTooltip" class="tooltip">
      {{ tooltipText }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  userId: {
    type: [Number, String],
    required: true,
  },
  profilePictureUrl: {
    type: String,
    default: null,
  },
  alt: {
    type: String,
    default: 'Avatar utilisateur',
  },
  clickable: {
    type: Boolean,
    default: true,
  },
  tooltipText: {
    type: String,
    default: 'Voir le profil',
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
  },
})

const emit = defineEmits(['click'])

// Computed properties
const avatarSrc = computed(() => {
  if (props.profilePictureUrl) {
    return props.profilePictureUrl
  }
  // Avatar basé sur l'ID de l'utilisateur
  return `https://i.pravatar.cc/150?img=${props.userId % 70}`
})

const showTooltip = computed(() => {
  return props.clickable && props.tooltipText
})

// Methods
const handleClick = () => {
  if (props.clickable) {
    emit('click', props.userId)
  }
}
</script>
