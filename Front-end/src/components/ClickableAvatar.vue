<template>
  <div class="clickable-avatar-container" @click="handleClick">
    <img 
      :src="avatarSrc" 
      :alt="alt"
      class="clickable-avatar"
      :class="{ 'clickable': clickable, [size]: true }"
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
    required: true
  },
  profilePictureUrl: {
    type: String,
    default: null
  },
  alt: {
    type: String,
    default: 'Avatar utilisateur'
  },
  clickable: {
    type: Boolean,
    default: true
  },
  tooltipText: {
    type: String,
    default: 'Voir le profil'
  },
  size: {
    type: String,
    default: 'medium' // small, medium, large
  }
})

const emit = defineEmits(['click'])

// Computed properties
const avatarSrc = computed(() => {
  if (props.profilePictureUrl) {
    return props.profilePictureUrl
  }
  // Avatar basé sur l'ID de l'utilisateur
  return `https://i.pravatar.cc/150?img=${(props.userId % 70) + 1}`
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

<style scoped>
.clickable-avatar-container {
  position: relative;
  display: inline-block;
}

.clickable-avatar {
  border-radius: 50%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.clickable-avatar.clickable {
  cursor: pointer;
}

.clickable-avatar.clickable:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Tailles */
.clickable-avatar.small {
  width: 32px;
  height: 32px;
}

.clickable-avatar.medium {
  width: 48px;
  height: 48px;
}

.clickable-avatar.large {
  width: 64px;
  height: 64px;
}

/* Tooltip */
.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
  margin-bottom: 8px;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.8);
}

.clickable-avatar-container:hover .tooltip {
  opacity: 1;
  visibility: visible;
}
</style> 