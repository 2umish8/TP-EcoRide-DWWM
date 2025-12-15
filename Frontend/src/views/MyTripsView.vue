<template>
  <div class="my-trips">
    <!-- Header -->
    <div class="trips-header">
      <h1 class="page-title">Mes Trajets</h1>
      <p class="page-subtitle">Gérez tous vos covoiturages</p>

      <!-- Tabs: Passenger/Driver -->
      <div class="tabs-container">
        <div class="tab-wrapper">
          <div v-if="activeTab === 'passenger'" class="action-hint left">
            <span class="hint-text">Cliquez à nouveau pour</span>
          </div>
          <div v-else class="action-hint left invisible">
            <span class="hint-text">Cliquez à nouveau pour</span>
          </div>
          <button
            @click="handlePassengerTab"
            :class="['tab-btn', { active: activeTab === 'passenger' }]"
          >
            <span v-if="activeTab === 'passenger'" class="tab-content action-mode">
              <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="icon" />
              Rechercher un EcoRide
            </span>
            <span v-else class="tab-content normal-mode">
              <font-awesome-icon :icon="['fas', 'calendar']" class="icon" />
              Voir mes réservations
            </span>
          </button>
        </div>

        <div class="tab-wrapper">
          <button @click="handleDriverTab" :class="['tab-btn', { active: activeTab === 'driver' }]">
            <span v-if="activeTab === 'driver'" class="tab-content action-mode">
              <font-awesome-icon :icon="['fas', 'plus']" class="icon" />
              Proposer un nouvel EcoRide
            </span>
            <span v-else class="tab-content normal-mode">
              <font-awesome-icon :icon="['fas', 'car']" class="icon" />
              Voir mes EcoRides proposés
            </span>
          </button>
          <div v-if="activeTab === 'driver'" class="action-hint right">
            <span class="hint-text">Cliquez à nouveau pour</span>
          </div>
          <div v-else class="action-hint right invisible">
            <span class="hint-text">Cliquez à nouveau pour</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="trips-container">
      <!-- Driver Tab -->
      <DriverTripsSection v-if="activeTab === 'driver'" :is-driver="isDriver" ref="driverSection" />

      <!-- Passenger Tab -->
      <PassengerTripsSection v-if="activeTab === 'passenger'" ref="passengerSection" />
    </div>

    <!-- Become driver confirmation modal -->
    <ConfirmActionModal
      :show="showBecomeDriverConfirm"
      title="Devenir chauffeur"
      message="Pour créer un trajet, vous devez d'abord devenir chauffeur. Voulez-vous lancer le processus maintenant ?"
      @confirm="startBecomeDriver"
      @cancel="cancelBecomeDriver"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DriverTripsSection from '@/components/DriverTripsSection.vue'
import PassengerTripsSection from '@/components/PassengerTripsSection.vue'
import ConfirmActionModal from '@/components/ConfirmActionModal.vue'
import useDriverStatus from '@/composables/useDriverStatus'

export default {
  name: 'MyTripsView',
  components: {
    DriverTripsSection,
    PassengerTripsSection,
    ConfirmActionModal,
  },
  setup() {
    const router = useRouter()
    const activeTab = ref('passenger')
    const driverSection = ref(null)
    const passengerSection = ref(null)
    const showBecomeDriverConfirm = ref(false)
    const { isDriver, checkDriverStatus } = useDriverStatus()

    const handlePassengerTab = () => {
      if (activeTab.value === 'passenger') {
        window.location.href = '/search'
      } else {
        activeTab.value = 'passenger'
        passengerSection.value?.loadParticipations()
      }
    }

    const handleDriverTab = () => {
      if (activeTab.value === 'driver') {
        // User is trying to create a trip
        if (!isDriver.value) {
          // Prompt user to become a driver first
          showBecomeDriverConfirm.value = true
        } else {
          window.location.href = '/create-trip'
        }
      } else {
        activeTab.value = 'driver'
        driverSection.value?.loadTrips()
      }
    }

    const startBecomeDriver = async () => {
      showBecomeDriverConfirm.value = false
      await router.push('/become-driver')
    }

    const cancelBecomeDriver = () => {
      showBecomeDriverConfirm.value = false
    }

    onMounted(() => {
      checkDriverStatus()
      if (activeTab.value === 'passenger') {
        passengerSection.value?.loadParticipations()
      } else {
        driverSection.value?.loadTrips()
      }
    })

    return {
      activeTab,
      isDriver,
      driverSection,
      passengerSection,
      showBecomeDriverConfirm,
      handlePassengerTab,
      handleDriverTab,
      startBecomeDriver,
      cancelBecomeDriver,
    }
  },
}
</script>

<style scoped>
/* Vue principale */
.my-trips {
  min-height: 100vh;
  background-color: var(--color-dark);
  color: var(--color-light-secondary);
  padding: 1rem 1rem;
}

/* Header */
.trips-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-light);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--color-gray);
  margin: 0 0 2rem 0;
}

/* Onglets */
.tabs-container {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
}

.tab-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: var(--color-dark-secondary);
  color: var(--color-gray);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 220px;
  justify-content: center;
}

.tab-btn:hover {
  border-color: var(--bs-primary);
  color: var(--bs-primary);
  background: var(--color-dark-tertiary);
}

.tab-btn.active {
  border-color: var(--bs-primary);
  background: var(--bs-primary);
  color: white;
  box-shadow: 0 2px 8px rgba(143, 218, 179, 0.28);
}

.tab-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-content.action-mode {
  font-weight: 700;
  font-size: 0.95rem;
}

.tab-content.action-mode .icon {
  font-size: 1.1rem;
}

.tab-content.normal-mode {
  font-size: 1rem;
}

.action-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--color-gray);
  opacity: 0;
  animation: fadeIn 0.3s ease-in-out 0.5s forwards;
  white-space: nowrap;
}

.action-hint.invisible {
  opacity: 0 !important;
  animation: none;
}

.action-hint.left {
  order: -1;
}

.action-hint.right {
  order: 1;
}

.hint-text {
  font-style: italic;
  font-weight: 500;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Container principal */
.trips-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Responsive */
@media (max-width: 768px) {
  .my-trips {
    padding: 1rem 0.5rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .tabs-container {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .tab-wrapper {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .action-hint.left,
  .action-hint.right {
    order: -1;
  }

  .action-hint.right {
    order: 1;
  }

  .tab-btn {
    width: 280px;
    justify-content: center;
  }

  .action-hint {
    justify-content: center;
    font-size: 0.75rem;
  }
}
</style>
