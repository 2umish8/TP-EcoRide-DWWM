<template>
  <div class="arrows-section">
    <div class="arrow-down">
      <font-awesome-icon :icon="['fas', 'chevron-down']" class="arrow-icon" size="lg" />
    </div>
    <div class="footer-links">
      <slot />
    </div>
    <div class="arrow-down">
      <font-awesome-icon :icon="['fas', 'chevron-down']" class="arrow-icon" size="lg" />
    </div>
  </div>
</template>

<script setup></script>
