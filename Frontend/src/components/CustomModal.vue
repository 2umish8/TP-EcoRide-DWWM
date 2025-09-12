<template>
  <div v-if="isVisible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header" :class="`modal-header--${type}`">
        <h3 class="modal-title">
          <span class="modal-icon" :class="`modal-icon--${type}`">
            <svg v-if="type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg
              v-else-if="type === 'error'"
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
              v-else-if="type === 'confirm'"
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
          </span>
          {{ title }}
        </h3>
        <button v-if="!hideCloseButton" @click="close" class="close-button">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <p>{{ message }}</p>
      </div>

      <div class="modal-footer">
        <button v-if="type === 'confirm'" @click="handleCancel" class="btn btn-secondary">
          {{ cancelText }}
        </button>
        <button
          @click="handleConfirm"
          class="btn"
          :class="
            type === 'alert' ? 'btn-primary' : type === 'error' ? 'btn-danger' : 'btn-success'
          "
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'alert', // 'alert', 'confirm', 'error', 'success'
      validator: (value) => ['alert', 'confirm', 'error', 'success'].includes(value),
    },
    title: {
      type: String,
      default: 'Information',
    },
    message: {
      type: String,
      required: true,
    },
    confirmText: {
      type: String,
      default: 'OK',
    },
    cancelText: {
      type: String,
      default: 'Annuler',
    },
    hideCloseButton: {
      type: Boolean,
      default: false,
    },
    closeOnOverlay: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['confirm', 'cancel', 'close'],
  methods: {
    handleConfirm() {
      this.$emit('confirm')
      this.close()
    },
    handleCancel() {
      this.$emit('cancel')
      this.close()
    },
    close() {
      this.$emit('close')
    },
    handleOverlayClick() {
      if (this.closeOnOverlay) {
        this.close()
      }
    },
  },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
  border: 1px solid rgba(52, 211, 153, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 0 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
  position: relative;
}

.modal-header--success {
  border-bottom-color: rgba(143, 188, 143, 0.3);
}

.modal-header--success::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #8fbc8f, #7fb87f);
  border-radius: 12px 12px 0 0;
}

.modal-header--error {
  border-bottom-color: rgba(255, 107, 107, 0.3);
}

.modal-header--error::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b, #ff5252);
  border-radius: 12px 12px 0 0;
}

.modal-header--confirm {
  border-bottom-color: rgba(52, 211, 153, 0.3);
}

.modal-header--confirm::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #34d399, #22c55e);
  border-radius: 12px 12px 0 0;
}

.modal-header--alert {
  border-bottom-color: rgba(135, 206, 235, 0.3);
}

.modal-header--alert::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #87ceeb, #6bb6dd);
  border-radius: 12px 12px 0 0;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #f5f5f5;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
}

.modal-icon--success {
  color: #8fbc8f;
  background-color: rgba(143, 188, 143, 0.2);
}

.modal-icon--error {
  color: #ff6b6b;
  background-color: rgba(255, 107, 107, 0.2);
}

.modal-icon--confirm {
  color: #34d399;
  background-color: rgba(52, 211, 153, 0.2);
}

.modal-icon--alert {
  color: #87ceeb;
  background-color: rgba(135, 206, 235, 0.2);
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #f5f5f5;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #34d399;
}

.modal-body {
  padding: 0 24px 20px 24px;
}

.modal-body p {
  margin: 0;
  line-height: 1.5;
  color: #d1d5db;
  font-size: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 80px;
}

.btn-primary {
  background-color: #34d399;
  color: white;
}

.btn-primary:hover {
  background-color: #22c55e;
}

.btn-success {
  background-color: #8fbc8f;
  color: white;
}

.btn-success:hover {
  background-color: #7fb87f;
}

.btn-danger {
  background-color: #ff6b6b;
  color: white;
}

.btn-danger:hover {
  background-color: #ff5252;
}

.btn-secondary {
  background-color: #4b5563;
  color: #f5f5f5;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary:hover {
  background-color: #374151;
  border-color: rgba(255, 255, 255, 0.2);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Style pour mobile */
@media (max-width: 480px) {
  .modal-content {
    width: 95%;
    margin: 10px;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 16px;
    padding-right: 16px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
