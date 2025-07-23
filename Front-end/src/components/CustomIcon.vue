<template>
  <svg :width="size" :height="size" :class="iconClass" viewBox="0 0 24 24" fill="currentColor">
    <!-- Icon User Edit -->
    <path
      v-if="name === 'user-edit'"
      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm7.5-2.5l1.41-1.41L19.5 8.67l-1.41 1.41-1.41-1.41L15.27 10l1.41 1.41L18.09 13l1.41-1.41z"
    />

    <!-- Icon Coins -->
    <path
      v-else-if="name === 'coins'"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
    />

    <!-- Icon Sign Out -->
    <path
      v-else-if="name === 'sign-out'"
      d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
    />

    <!-- Default icon -->
    <circle v-else cx="12" cy="12" r="10" />
  </svg>
</template>

<script setup>
defineProps({
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
</script>

<style scoped>
.custom-icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
