<template>
  <div class="test-container">
    <div class="test-header">
      <h1>🧪 Page de Test - Modales</h1>
      <p>Teste les différents types de modales CustomModal ici</p>
    </div>

    <div class="test-grid">
      <!-- Test Alert -->
      <div class="test-card">
        <h3>Alert</h3>
        <p>Modale d'information simple</p>
        <button @click="testAlert" class="test-btn test-btn-info">Afficher Alert</button>
      </div>

      <!-- Test Success -->
      <div class="test-card">
        <h3>Success</h3>
        <p>Modale de succès (opération réussie)</p>
        <button @click="testSuccess" class="test-btn test-btn-success">Afficher Success</button>
      </div>

      <!-- Test Error -->
      <div class="test-card">
        <h3>Error</h3>
        <p>Modale d'erreur (problème détecté)</p>
        <button @click="testError" class="test-btn test-btn-error">Afficher Error</button>
      </div>

      <!-- Test Confirm -->
      <div class="test-card">
        <h3>Confirm</h3>
        <p>Modale de confirmation (Oui/Non)</p>
        <button @click="testConfirm" class="test-btn test-btn-confirm">Afficher Confirm</button>
      </div>
    </div>

    <div class="test-info">
      <h2>Informations</h2>
      <p>Cette page utilise le composable <code>useModal</code> pour afficher les modales.</p>
      <p>Les modales sont :</p>
      <ul>
        <li>✅ Personnalisées (design dark mode)</li>
        <li>✅ Non-bloquantes (l'app continue de fonctionner)</li>
        <li>✅ Avec icônes</li>
        <li>✅ Responsives (mobile-friendly)</li>
        <li>✅ Avec animations</li>
      </ul>
      <p>
        Le composable <code>useModal</code> est défini dans <code>src/composables/useModal.js</code>
      </p>
    </div>
  </div>
</template>

<script setup>
import { showAlert, showSuccess, showError, showConfirm } from '@/composables/useModal'

// Test Alert
const testAlert = () => {
  showAlert("Ceci est une alerte d'information", 'Alerte')
}

// Test Success
const testSuccess = () => {
  showSuccess("L'opération a réussi !", 'Succès')
}

// Test Error
const testError = () => {
  showError("Une erreur s'est produite", 'Erreur')
}

// Test Confirm
const testConfirm = async () => {
  const result = await showConfirm('Es-tu sûr de vouloir continuer ?', 'Confirmation')
  if (result) {
    showSuccess('Tu as cliqué OUI', 'Réponse')
  } else {
    showAlert('Tu as cliqué NON', 'Réponse')
  }
}
</script>

<style scoped>
.test-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.test-header {
  text-align: center;
  margin-bottom: 40px;
}

.test-header h1 {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #f5f5f5;
}

.test-header p {
  font-size: 1.1rem;
  color: #d1d5db;
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.test-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
}

.test-card:hover {
  border-color: rgba(52, 211, 153, 0.5);
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(52, 211, 153, 0.1);
}

.test-card h3 {
  margin: 0 0 10px 0;
  font-size: 1.3rem;
  color: #f5f5f5;
}

.test-card p {
  margin: 0 0 20px 0;
  color: #9ca3af;
  font-size: 0.95rem;
}

.test-btn {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.test-btn-info {
  background-color: #87ceeb;
  color: white;
}

.test-btn-info:hover {
  background-color: #6bb6dd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(135, 206, 235, 0.3);
}

.test-btn-success {
  background-color: #8fbc8f;
  color: white;
}

.test-btn-success:hover {
  background-color: #7fb87f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(143, 188, 143, 0.3);
}

.test-btn-error {
  background-color: #ff6b6b;
  color: white;
}

.test-btn-error:hover {
  background-color: #ff5252;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.test-btn-confirm {
  background-color: #34d399;
  color: white;
}

.test-btn-confirm:hover {
  background-color: #22c55e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 211, 153, 0.3);
}

.test-info {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 12px;
  padding: 24px;
}

.test-info h2 {
  margin: 0 0 16px 0;
  font-size: 1.3rem;
  color: #f5f5f5;
}

.test-info p {
  margin: 0 0 12px 0;
  color: #d1d5db;
  line-height: 1.6;
}

.test-info code {
  background-color: rgba(52, 211, 153, 0.1);
  color: #34d399;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.test-info ul {
  margin: 12px 0;
  padding-left: 20px;
  color: #d1d5db;
}

.test-info li {
  margin-bottom: 8px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .test-container {
    padding: 20px 16px;
  }

  .test-header h1 {
    font-size: 1.5rem;
  }

  .test-grid {
    grid-template-columns: 1fr;
  }
}
</style>
