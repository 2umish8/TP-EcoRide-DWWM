<template>
  <div class="test-modal-page">
    <div class="container">
      <h1>Test des Popins EcoRide</h1>
      <p>Cette page vous permet de tester les différents types de popins personnalisés.</p>

      <div class="test-buttons">
        <button @click="testInfo" class="test-btn btn-info">ℹ️ Tester Info</button>

        <button @click="testAlert" class="test-btn btn-primary">🔔 Tester Alert</button>

        <button @click="testSuccess" class="test-btn btn-success">✅ Tester Succès</button>

        <button @click="testError" class="test-btn btn-danger">❌ Tester Erreur</button>

        <button @click="testConfirm" class="test-btn btn-warning">❓ Tester Confirmation</button>
      </div>
    </div>
  </div>
</template>

<script>
import { showAlert, showSuccess, showError, showConfirm, showInfo } from '@/composables/useModal'

export default {
  name: 'TestModalPage',
  methods: {
    async testInfo() {
      await showInfo(
        "Ceci est un message d'information avec l'icône et les couleurs EcoRide. Parfait pour les notifications neutres.",
        'Information EcoRide',
      )
    },

    async testAlert() {
      await showAlert(
        "Ceci est un message d'alerte standard. Les popins utilisent maintenant les couleurs de votre thème EcoRide.",
        'Alerte EcoRide',
      )
    },

    async testSuccess() {
      await showSuccess(
        'Votre action a été effectuée avec succès ! Cette popin affiche les messages de réussite.',
        'Opération réussie',
      )
    },

    async testError() {
      await showError(
        "Une erreur s'est produite. Cette popin affiche les messages d'erreur de manière plus claire.",
        'Erreur détectée',
      )
    },

    async testConfirm() {
      const result = await showConfirm(
        'Voulez-vous vraiment effectuer cette action ? Cette popin remplace les confirm() natifs.',
        "Confirmer l'action",
        {
          confirmText: 'Oui, continuer',
          cancelText: 'Non, annuler',
        },
      )

      if (result) {
        await showSuccess("Vous avez confirmé l'action !", 'Action confirmée')
      } else {
        await showAlert("Vous avez annulé l'action.", 'Action annulée')
      }
    },
  },
}
</script>

<style scoped>
.test-modal-page {
  min-height: 100vh;
  padding: 100px 20px 20px 20px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(52, 211, 153, 0.2);
}

h1 {
  color: #2d2d2d;
  text-align: center;
  margin-bottom: 20px;
  font-size: 2.5rem;
}

p {
  color: #6b7280;
  text-align: center;
  margin-bottom: 40px;
  font-size: 1.1rem;
  line-height: 1.6;
}

.test-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.test-btn {
  padding: 15px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.test-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.btn-info {
  background: linear-gradient(135deg, #87ceeb, #6bb6dd);
}

.btn-primary {
  background: linear-gradient(135deg, #34d399, #22c55e);
}

.btn-success {
  background: linear-gradient(135deg, #8fbc8f, #7fb87f);
}

.btn-danger {
  background: linear-gradient(135deg, #cd5c5c, #b84c4c);
}

.btn-warning {
  background: linear-gradient(135deg, #f4a460, #e09440);
  color: white;
}

@media (max-width: 768px) {
  .container {
    padding: 20px;
  }

  h1 {
    font-size: 2rem;
  }

  .test-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
