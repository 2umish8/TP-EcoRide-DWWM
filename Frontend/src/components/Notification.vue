<template>
  <Transition name="notification">
    <div v-if="notification" class="notification" :class="`notification--${notification.type}`">
      <div class="notification-icon">
        <font-awesome-icon
          v-if="notification.type === 'success'"
          :icon="['fas', 'circle-check']"
          size="lg"
        />
        <font-awesome-icon
          v-else-if="notification.type === 'error'"
          :icon="['fas', 'xmark']"
          size="lg"
        />
        <font-awesome-icon
          v-else-if="notification.type === 'warning'"
          :icon="['fas', 'triangle-exclamation']"
          size="lg"
        />
        <font-awesome-icon v-else :icon="['fas', 'circle-exclamation']" size="lg" />
      </div>
      <div class="notification-message">{{ notification.message }}</div>
    </div>
  </Transition>
</template>

<script setup>
defineOptions({
  name: 'NotificationAlert',
})

defineProps({
  notification: {
    type: Object,
    default: null,
  },
})
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 2px solid;
  border-radius: 8px;
  padding: 16px;
  min-width: 300px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 9999;
}

.notification--success {
  border-color: #8fbc8f;
}

.notification--error {
  border-color: #ff6b6b;
}

.notification--warning {
  border-color: #fbbf24;
}

.notification--info {
  border-color: #87ceeb;
}

.notification-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
}

.notification--success .notification-icon {
  color: #8fbc8f;
  background-color: rgba(143, 188, 143, 0.2);
}

.notification--error .notification-icon {
  color: #ff6b6b;
  background-color: rgba(255, 107, 107, 0.2);
}

.notification--warning .notification-icon {
  color: #fbbf24;
  background-color: rgba(251, 191, 36, 0.2);
}

.notification--info .notification-icon {
  color: #87ceeb;
  background-color: rgba(135, 206, 235, 0.2);
}

.notification-message {
  color: #f5f5f5;
  font-size: 0.95rem;
  line-height: 1.4;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

@media (max-width: 480px) {
  .notification {
    left: 10px;
    right: 10px;
    min-width: unset;
  }
}
</style>
