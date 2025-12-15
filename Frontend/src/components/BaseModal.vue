<template>
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <!-- Header with close button -->
      <div class="modal-header">
        <h3 class="modal-title">
          <slot name="header">{{ title }}</slot>
        </h3>
        <IconButton @click="$emit('close')" aria-label="Close modal">×</IconButton>
      </div>

      <!-- Body content -->
      <div class="modal-body">
        <slot></slot>
      </div>

      <!-- Footer actions (optional) -->
      <div v-if="$slots.footer" class="modal-footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import IconButton from '@/components/ui/IconButton.vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  closeOnOverlay: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['close'])

const handleOverlayClick = (e) => {
  // Only close on overlay click if property is enabled
  if (e.target === e.currentTarget) {
    if (props.closeOnOverlay) {
      emit('close')
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--color-dark);
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  color: var(--color-light);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.modal-close-btn {
  background: none;
  border: none;
  color: var(--color-light-secondary);
  font-size: 2rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: all 0.3s ease;
  line-height: 1;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: var(--color-light);
}

.modal-body {
  padding: 30px;
  flex: 1;
  overflow-y: auto;
}

.modal-footer {
  padding: 20px 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .modal-content {
    max-width: 90%;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 20px;
  }
}
</style>
