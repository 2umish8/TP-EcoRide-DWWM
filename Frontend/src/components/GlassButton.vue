<template>
  <router-link
    :to="to"
    :class="[
      'eco-button',
      variant === 'inscription' ? 'eco-button--inscription' : 'eco-button--connexion',
    ]"
  >
    <slot></slot>
  </router-link>
</template>

<script setup>
defineProps({
  to: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: 'connexion', // 'connexion' ou 'inscription'
    validator: (value) => ['connexion', 'inscription'].includes(value),
  },
})
</script>

<style scoped>
/* Only keep variants specific to this component; base styles live in _buttons.css */
.eco-button--connexion {
  /* local overrides if necessary */
}

.eco-button--inscription {
  /* local overrides if necessary */
}

/* Focus for a11y: keep local focus rule if different from base */
.eco-button:focus-visible {
  outline: 2px solid #f5deb3;
  outline-offset: 2px;
}
</style>
