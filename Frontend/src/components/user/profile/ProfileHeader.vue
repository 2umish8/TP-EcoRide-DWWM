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
        <div class="user-roles">
          <span v-if="isPassenger" class="role-badge role-passenger">
            <font-awesome-icon :icon="['fas', 'car']" class="role-icon" />
            Passager
          </span>
          <span v-if="isDriver" class="role-badge role-driver">
            <font-awesome-icon :icon="['fas', 'truck']" class="role-icon" />
            Chauffeur
          </span>
        </div>
      </div>
    </div>

    <!-- Become Driver Button -->
    <div v-if="user && !isDriver" class="become-driver-section">
      <PrimaryButton @click="navigateToBecomeDriver" class="become-driver-button">
        <font-awesome-icon :icon="['fas', 'steering-wheel']" class="button-icon" />
        Devenir chauffeur
      </PrimaryButton>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'
import { useRouter } from 'vue-router'
import PrimaryButton from '@/components/ui/buttons/PrimaryButton.vue'

const router = useRouter()

const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
})

const isPassenger = computed(() => {
  return props.user?.roles?.includes('passager') || false
})

const isDriver = computed(() => {
  return props.user?.roles?.includes('chauffeur') || false
})

const navigateToBecomeDriver = () => {
  router.push({ name: 'BecomeDriver' })
}
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
  margin: 0 0 10px 0;
}

.user-roles {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.role-icon {
  font-size: 0.85rem;
}

.role-passenger {
  background: rgba(143, 218, 179, 0.2);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.role-driver {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid #4caf50;
}

.become-driver-section {
  margin-top: 25px;
  padding-top: 25px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
}

.become-driver-button {
  display: flex;
  align-items: center;
  gap: 10px;
}

.button-icon {
  font-size: 1rem;
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

  .user-roles {
    justify-content: center;
  }
}
</style>
