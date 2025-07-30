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
import { useAuthStore } from '../stores/counter'

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
  const res = await fetch('/api/user/register', {
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

<style scoped>
.admin-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.admin-section {
  margin-bottom: 2.5rem;
  background: #23272b;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
}
.admin-form {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.admin-form input {
  padding: 0.5rem 1rem;
  border-radius: 5px;
  border: 1px solid #ccc;
  min-width: 180px;
}
.admin-form button {
  background: #34d399;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 0.5rem 1.5rem;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}
.admin-form button:hover {
  background: #059669;
}
.admin-msg {
  color: #059669;
  margin-bottom: 0.5rem;
}
.admin-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.admin-table th,
.admin-table td {
  padding: 0.7rem 0.5rem;
  border-bottom: 1px solid #333;
  text-align: left;
}
.admin-table th {
  background: #181c1f;
}
.suspended {
  color: #e11d48;
  font-weight: bold;
}
.active {
  color: #10b981;
  font-weight: bold;
}
.admin-search {
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  border: 1px solid #ccc;
  min-width: 220px;
}
</style>
