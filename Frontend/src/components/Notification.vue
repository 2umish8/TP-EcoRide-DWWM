<template>
  <Transition name="notification">
    <div v-if="notification" class="notification" :class="`notification--${notification.type}`">
      <div class="notification-icon">
        <svg
          v-if="notification.type === 'success'"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg
          v-else-if="notification.type === 'error'"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg
          v-else-if="notification.type === 'warning'"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div class="notification-message">{{ notification.message }}</div>
    </div>
  </Transition>
</template>

<script setup>
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
