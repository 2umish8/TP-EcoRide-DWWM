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
