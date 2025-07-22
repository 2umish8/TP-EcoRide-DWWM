<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- En-tête du profil -->
      <div class="profile-header">
        <h1 class="profile-title">Mon Profil</h1>
        <div v-if="currentUser" class="user-info">
          <div class="user-avatar">
            <img
              v-if="currentUser.profile_picture_url"
              :src="currentUser.profile_picture_url"
              :alt="currentUser.pseudo"
              class="avatar-img"
            />
            <div v-else class="avatar-placeholder">
              {{ currentUser.pseudo.charAt(0).toUpperCase() }}
            </div>
          </div>
          <div class="user-details">
            <h2 class="user-name">{{ currentUser.pseudo }}</h2>
            <p class="user-email">{{ currentUser.email }}</p>
          </div>
        </div>
      </div>

      <!-- Sélection du rôle -->
      <div class="role-selection-card">
        <h3 class="card-title">Mon rôle sur EcoRide</h3>
        <div class="role-options">
          <label class="role-option" :class="{ active: selectedRoles.includes('passager') }">
            <input type="checkbox" value="passager" v-model="selectedRoles" @change="updateRole" />
            <div class="role-content">
              <span class="role-icon">🚗</span>
              <div class="role-text">
                <h4>Passager</h4>
                <p>Je cherche des trajets à partager</p>
              </div>
            </div>
          </label>

          <label class="role-option" :class="{ active: selectedRoles.includes('chauffeur') }">
            <input type="checkbox" value="chauffeur" v-model="selectedRoles" @change="updateRole" />
            <div class="role-content">
              <span class="role-icon">🛻</span>
              <div class="role-text">
                <h4>Chauffeur</h4>
                <p>Je propose mes véhicules pour covoiturer</p>
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Section Chauffeur (si chauffeur sélectionné) -->
      <div v-if="selectedRoles.includes('chauffeur')" class="driver-section">
        <!-- Véhicules -->
        <div class="vehicles-card">
          <div class="card-header">
            <h3 class="card-title">Mes Véhicules</h3>
            <button @click="showAddVehicle = true" class="add-btn">
              <span class="add-icon">+</span>
              Ajouter un véhicule
            </button>
          </div>

          <div v-if="vehicles.length === 0" class="empty-state">
            <span class="empty-icon">🚗</span>
            <p>Aucun véhicule enregistré</p>
            <small>Ajoutez votre premier véhicule pour proposer des trajets</small>
          </div>

          <div v-else class="vehicles-list">
            <div v-for="vehicle in vehicles" :key="vehicle.id" class="vehicle-item">
              <div class="vehicle-info">
                <h4>{{ vehicle.brand }} {{ vehicle.model }}</h4>
                <p class="vehicle-details">
                  {{ vehicle.plate_number }} • {{ vehicle.seats_available }} places
                  <span v-if="vehicle.is_electric" class="eco-badge">⚡ Électrique</span>
                </p>
              </div>
              <button @click="removeVehicle(vehicle.id)" class="remove-btn">
                <span>🗑️</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Préférences du chauffeur -->
        <div class="preferences-card">
          <h3 class="card-title">Mes Préférences de Conduite</h3>
          <div class="preferences-grid">
            <label class="preference-item">
              <input
                type="checkbox"
                v-model="driverPreferences.allowsSmoking"
                @change="updatePreferences"
              />
              <span class="preference-label">🚬 Fumeur autorisé</span>
            </label>

            <label class="preference-item">
              <input
                type="checkbox"
                v-model="driverPreferences.allowsPets"
                @change="updatePreferences"
              />
              <span class="preference-label">🐕 Animaux autorisés</span>
            </label>

            <div class="preference-select">
              <label class="form-label">🎵 Genre musical préféré</label>
              <select
                v-model="driverPreferences.preferredMusicGenre"
                @change="updatePreferences"
                class="form-select"
              >
                <option value="">Aucune préférence</option>
                <option value="pop">Pop</option>
                <option value="rock">Rock</option>
                <option value="jazz">Jazz</option>
                <option value="classique">Classique</option>
                <option value="electronic">Électronique</option>
                <option value="rap">Rap</option>
              </select>
            </div>

            <div class="preference-select">
              <label class="form-label">💬 Niveau de conversation</label>
              <select
                v-model="driverPreferences.conversationLevel"
                @change="updatePreferences"
                class="form-select"
              >
                <option value="silencieux">Silencieux</option>
                <option value="modéré">Modéré</option>
                <option value="bavard">Bavard</option>
              </select>
            </div>
          </div>

          <div class="custom-rules">
            <textarea
              v-model="driverPreferences.specialRules"
              @input="updatePreferences"
              class="form-textarea"
              placeholder="Règles spéciales (ex: pas de musique, climatisation à 22°C...)"
              rows="3"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout de véhicule -->
    <div v-if="showAddVehicle" class="modal-overlay" @click="showAddVehicle = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Ajouter un véhicule</h3>
          <button @click="showAddVehicle = false" class="close-btn">×</button>
        </div>

        <form @submit.prevent="addVehicle" class="vehicle-form">
          <div class="form-group">
            <label class="form-label">Plaque d'immatriculation</label>
            <input
              type="text"
              v-model="newVehicle.plate_number"
              class="form-input"
              placeholder="AA-123-BB"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Marque</label>
              <input
                type="text"
                v-model="newVehicle.brand"
                class="form-input"
                placeholder="Peugeot"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">Modèle</label>
              <input
                type="text"
                v-model="newVehicle.model"
                class="form-input"
                placeholder="308"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nombre de places</label>
              <select v-model="newVehicle.seats_available" class="form-select" required>
                <option value="">Sélectionner</option>
                <option value="1">1 place</option>
                <option value="2">2 places</option>
                <option value="3">3 places</option>
                <option value="4">4 places</option>
                <option value="5">5 places</option>
                <option value="6">6 places</option>
                <option value="7">7 places</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Couleur</label>
              <input
                type="text"
                v-model="newVehicle.color"
                class="form-input"
                placeholder="Blanc"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="newVehicle.is_electric" />
              <span>⚡ Véhicule électrique</span>
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showAddVehicle = false" class="cancel-btn">
              Annuler
            </button>
            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              <span v-if="isSubmitting">⏳</span>
              <span v-else>Ajouter</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/counter'

export default {
  name: 'ProfileView',
  setup() {
    const authStore = useAuthStore()
    const currentUser = computed(() => authStore.currentUser)

    // États
    const selectedRoles = ref(['passager']) // Par défaut passager
    const vehicles = ref([])
    const showAddVehicle = ref(false)
    const isSubmitting = ref(false)

    // Préférences du chauffeur
    const driverPreferences = ref({
      allowsSmoking: false,
      allowsPets: true,
      conversationLevel: 'modéré',
      preferredMusicGenre: '',
      specialRules: '',
    })

    // Nouveau véhicule
    const newVehicle = ref({
      plate_number: '',
      brand: '',
      model: '',
      seats_available: '',
      color: '',
      is_electric: false,
    })

    // Méthodes
    const updateRole = () => {
      console.log('Rôles sélectionnés:', JSON.stringify(selectedRoles.value))
      // TODO: Envoyer au back-end
    }

    const updatePreferences = () => {
      console.log('Préférences mises à jour:', JSON.stringify(driverPreferences.value))
      // TODO: Envoyer au back-end
    }

    const addVehicle = () => {
      isSubmitting.value = true

      // TODO: Appel API pour ajouter le véhicule
      setTimeout(() => {
        const vehicle = {
          id: Date.now(),
          ...newVehicle.value,
        }
        vehicles.value.push(vehicle)

        // Reset du formulaire
        newVehicle.value = {
          plate_number: '',
          brand: '',
          model: '',
          seats_available: '',
          color: '',
          is_electric: false,
        }

        showAddVehicle.value = false
        isSubmitting.value = false
      }, 1000)
    }

    const removeVehicle = (vehicleId) => {
      vehicles.value = vehicles.value.filter((v) => v.id !== vehicleId)
      // TODO: Appel API pour supprimer
    }

    onMounted(() => {
      // TODO: Charger les données depuis l'API
    })

    return {
      currentUser,
      selectedRoles,
      vehicles,
      showAddVehicle,
      isSubmitting,
      driverPreferences,
      newVehicle,
      updateRole,
      updatePreferences,
      addVehicle,
      removeVehicle,
    }
  },
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
  padding: 100px 20px 40px;
}

.profile-container {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.profile-header {
  background: #1a1a1a;
  border-radius: 20px;
  padding: 30px;
  border: 1px solid #333;
}

.profile-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 20px;
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
  border: 3px solid #34d399;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #34d399;
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
  color: #ffffff;
  margin-bottom: 5px;
}

.user-email {
  color: #cccccc;
  font-size: 1rem;
}

.role-selection-card,
.vehicles-card,
.preferences-card {
  background: #1a1a1a;
  border-radius: 20px;
  padding: 30px;
  border: 1px solid #333;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 20px;
}

.role-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.role-option {
  border: 2px solid #333;
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #2a2a2a;
}

.role-option.active {
  border-color: #34d399;
  background: rgba(52, 211, 153, 0.1);
}

.role-option input[type='checkbox'] {
  display: none;
}

.role-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.role-icon {
  font-size: 2rem;
}

.role-text h4 {
  color: #ffffff;
  font-size: 1.1rem;
  margin-bottom: 5px;
}

.role-text p {
  color: #cccccc;
  font-size: 0.9rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-btn {
  background: #34d399;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-btn:hover {
  background: #22c55e;
  transform: translateY(-1px);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #cccccc;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 15px;
}

.vehicles-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.driver-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 60px;
}

.vehicle-item {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #333;
}

.vehicle-info h4 {
  color: #ffffff;
  font-size: 1.1rem;
  margin-bottom: 5px;
}

.vehicle-details {
  color: #cccccc;
  font-size: 0.9rem;
}

.eco-badge {
  background: #34d399;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 10px;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: #c82333;
}

.preferences-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  justify-items: center;
}

.preference-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  justify-content: center;
}

.preference-item input[type='checkbox'] {
  accent-color: #34d399;
}

.preference-label {
  color: #ffffff;
  font-size: 0.95rem;
}

.preference-select {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  text-align: center;
}

.form-label {
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-select,
.form-input,
.form-textarea {
  padding: 12px 16px;
  border: 2px solid #333;
  border-radius: 10px;
  background: #2a2a2a;
  color: #ffffff;
  font-size: 0.95rem;
  width: 100%;
  max-width: 250px;
}

.form-select:focus,
.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #34d399;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.2);
}

.custom-rules {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.custom-rules .form-textarea {
  width: 100%;
  max-width: 600px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1a1a;
  border-radius: 20px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #333;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.modal-header h3 {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #cccccc;
  font-size: 2rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #333;
  color: #ffffff;
}

.vehicle-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ffffff;
  cursor: pointer;
}

.checkbox-label input[type='checkbox'] {
  accent-color: #34d399;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 10px;
}

.cancel-btn {
  background: #6b7280;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #555;
}

.submit-btn {
  background: #34d399;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: #22c55e;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 80px 15px 20px;
  }

  .role-options {
    grid-template-columns: 1fr;
  }

  .preferences-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .user-info {
    flex-direction: column;
    text-align: center;
  }
}
</style>
