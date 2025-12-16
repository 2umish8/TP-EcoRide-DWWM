<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const currentUser = computed(() => authStore.currentUser)
const isOpen = ref(false)
const userMenuElement = ref(null)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}

const handleClickOutside = (event) => {
  if (userMenuElement.value && !userMenuElement.value.contains(event.target)) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const logout = async () => {
  await authStore.logout()
  window.location.href = '/'
}
</script>

<template>
  <div class="user-menu" ref="userMenuElement">
    <button class="user-menu-toggle" @click="toggleMenu">
      <font-awesome-icon :icon="['fas', 'user']" class="user-icon" />
      <span class="user-name">{{
        currentUser?.pseudo || currentUser?.prenom || 'Utilisateur'
      }}</span>
      <font-awesome-icon :icon="['fas', 'chevron-down']" class="chevron-icon" />
    </button>

    <ul class="user-menu-dropdown" v-show="isOpen">
      <li>
        <RouterLink class="dropdown-item" to="/profile" @click="closeMenu">
          <font-awesome-icon :icon="['fas', 'user']" class="dropdown-icon" />
          Mon profil
        </RouterLink>
      </li>
      <li>
        <RouterLink class="dropdown-item" to="/credits" @click="closeMenu">
          <font-awesome-icon :icon="['fas', 'coins']" class="dropdown-icon" />
          Mes crédits
        </RouterLink>
      </li>
      <li class="dropdown-divider"></li>
      <li>
        <a class="dropdown-item" href="#" @click.prevent="logout">
          <font-awesome-icon :icon="['fas', 'user-xmark']" class="dropdown-icon" />
          Déconnexion
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.user-menu {
  position: relative;
}

.user-menu-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0.5rem;
  font-size: 0.9rem;
}

.user-menu-toggle:hover {
  opacity: 0.8;
}

.user-menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--color-dark);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  list-style: none;
  margin: 0.5rem 0 0 0;
  padding: 0;
  min-width: 180px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.user-menu-dropdown li {
  display: flex;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--color-light-secondary);
  text-decoration: none;
  width: 100%;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background: var(--color-dark-secondary);
}

.dropdown-icon {
  flex-shrink: 0;
  width: 16px;
}

.dropdown-divider {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 0.5rem 0;
}

.user-name {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-icon {
  width: 18px;
}

.chevron-icon {
  font-size: 0.75rem;
  transition: transform 0.3s;
}

/* Tablet (768px - 1024px) */
@media (max-width: 1024px) {
  .user-name {
    max-width: 60px;
  }
}

/* Mobile (< 768px) */
@media (max-width: 767px) {
  .user-menu-toggle {
    width: 100%;
    justify-content: space-between;
    padding: 0.75rem;
    font-size: 0.95rem;
  }

  .user-name {
    max-width: 100px;
  }

  .user-menu-dropdown {
    position: static;
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    background: transparent;
    margin: 0.5rem 0 0 0;
    padding: 0.5rem 0;
    min-width: auto;
    box-shadow: none;
  }

  .dropdown-item {
    padding: 0.75rem 1.5rem;
  }
}

/* Very small phones (< 360px) */
@media (max-width: 359px) {
  .user-name {
    display: none;
  }

  .user-menu-toggle {
    padding: 0.5rem;
  }

  .dropdown-item {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
}
</style>
