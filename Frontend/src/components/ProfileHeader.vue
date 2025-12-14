<template>
  <div class="profile-header">
    <h1 class="profile-title">Mon Profil</h1>
    <div v-if="user" class="user-info">
      <div class="user-avatar">
        <img
          v-if="user.profile_picture_url"
          :src="user.profile_picture_url"
          :alt="user.pseudo"
          class="avatar-img"
        />
        <div v-else class="avatar-placeholder">
          {{ user.pseudo.charAt(0).toUpperCase() }}
        </div>
      </div>
      <div class="user-details">
        <h2 class="user-name">{{ user.pseudo }}</h2>
        <p class="user-email">{{ user.email }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  user: {
    type: Object,
    default: null,
  },
})
</script>

<style scoped>
.profile-header {
  background: var(--color-dark);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.profile-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-light);
  margin-bottom: 20px;
  margin-top: 0;
  text-align: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--color-primary);
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: white;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-light);
  margin-bottom: 5px;
  margin-top: 0;
}

.user-email {
  color: var(--color-light-secondary);
  font-size: 1rem;
  margin: 0;
}

@media (max-width: 768px) {
  .profile-title {
    font-size: 2rem;
  }

  .user-info {
    flex-direction: column;
    text-align: center;
  }

  .user-details {
    text-align: center;
  }
}
</style>
