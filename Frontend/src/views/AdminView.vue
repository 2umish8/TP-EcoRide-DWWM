<template>
  <div class="admin-view">
    <h1>Gestion des comptes</h1>

    <!-- Formulaire création employé -->
    <section class="admin-section">
      <h2>Créer un compte employé</h2>
      <form @submit.prevent="handleCreateEmployee" class="admin-form">
        <input v-model="newEmployee.pseudo" type="text" placeholder="Pseudo" required />
        <input v-model="newEmployee.email" type="email" placeholder="Email" required />
        <input v-model="newEmployee.password" type="password" placeholder="Mot de passe" required />
        <button type="submit">Créer l'employé</button>
      </form>
      <div v-if="employeeCreationMsg" class="admin-msg">{{ employeeCreationMsg }}</div>
    </section>

    <!-- Liste des utilisateurs -->
    <section class="admin-section">
      <h2>Utilisateurs</h2>
      <input
        v-model="search"
        @input="fetchUsers"
        placeholder="Rechercher..."
        class="admin-search"
      />
      <table class="admin-table">
        <thead>
          <tr>
            <th>Pseudo</th>
            <th>Email</th>
            <th>Rôles</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.pseudo }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.roles }}</td>
            <td>
              <span :class="user.suspended ? 'suspended' : 'active'">
                {{ user.suspended ? 'Suspendu' : 'Actif' }}
              </span>
            </td>
            <td>
              <button @click="toggleSuspension(user)" :disabled="user.id === currentAdminId">
                {{ user.suspended ? 'Réactiver' : 'Suspendre' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="users.length === 0">Aucun utilisateur trouvé.</div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const users = ref([])
const search = ref('')
const newEmployee = ref({ pseudo: '', email: '', password: '' })
const employeeCreationMsg = ref('')
const authStore = useAuthStore()
const currentAdminId = authStore.currentUser?.id

async function fetchUsers() {
  let url = '/api/admin/users'
  if (search.value) url += `?search=${encodeURIComponent(search.value)}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${authStore.token}` },
  })
  if (res.ok) {
    const data = await res.json()
    users.value = data.users || []
  } else {
    users.value = []
  }
}

async function toggleSuspension(user) {
  const res = await fetch(`/api/admin/users/${user.id}/suspension`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authStore.token}`,
    },
    body: JSON.stringify({ suspended: !user.suspended }),
  })
  if (res.ok) {
    await fetchUsers()
  }
}

async function handleCreateEmployee() {
  employeeCreationMsg.value = ''
  // 1. Créer le compte via l'API register
  const res = await fetch('/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authStore.token}` },
    body: JSON.stringify(newEmployee.value),
  })
  if (!res.ok) {
    const err = await res.json()
    employeeCreationMsg.value = err.message || 'Erreur lors de la création.'
    return
  }
  const { user } = await res.json()
  // 2. Assigner le rôle employe
  const resRole = await fetch(`/api/admin/users/${user.id}/roles`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authStore.token}` },
    body: JSON.stringify({ roles: ['employe'] }),
  })
  if (resRole.ok) {
    employeeCreationMsg.value = 'Employé créé avec succès !'
    newEmployee.value = { pseudo: '', email: '', password: '' }
    await fetchUsers()
  } else {
    employeeCreationMsg.value = 'Employé créé, mais erreur lors de l’attribution du rôle.'
  }
}

onMounted(fetchUsers)
</script>

