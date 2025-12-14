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
