<template>
  <BaseModal :show="show" :title="title" @close="$emit('cancel')">
    <p v-if="message" class="message">{{ message }}</p>
    <slot />

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
        <font-awesome-icon :icon="['fas', 'xmark']" /> Annuler
      </button>
      <button type="button" class="btn btn-primary" @click="$emit('confirm')">
        <font-awesome-icon :icon="['fas', 'arrow-right']" /> Continuer
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue'

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    default: '',
  },
})

defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.message {
  margin: 0;
  color: var(--color-light-secondary);
  line-height: 1.5;
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 12px 18px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-dark);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: var(--color-dark-secondary);
  color: var(--color-light);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn-secondary:hover {
  border-color: rgba(255, 255, 255, 0.25);
}
</style>
