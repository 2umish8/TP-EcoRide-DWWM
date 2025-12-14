<template>
  <span v-bind="$attrs" :class="['text-secondary', $attrs.class]">
    <slot />
  </span>
</template>

<script setup>
// simple presentational wrapper for secondary-colored text
</script>

<!-- visual rules live in src/assets/css/_utilities.css as .text-secondary -->
