<template>
  <div class="test-container">
    <div class="test-header">
      <h1>🧪 Page de Test - Notifications</h1>
      <p>Teste les différents types de notifications ici</p>
    </div>

    <div class="test-grid">
      <!-- Test Info -->
      <div class="test-card">
        <h3>Info</h3>
        <p>Notification d'information simple</p>
        <button @click="testInfo" class="test-btn test-btn-info">Afficher Info</button>
      </div>

      <!-- Test Success -->
      <div class="test-card">
        <h3>Success</h3>
        <p>Notification de succès (opération réussie)</p>
        <button @click="testSuccess" class="test-btn test-btn-success">Afficher Success</button>
      </div>

      <!-- Test Error -->
      <div class="test-card">
        <h3>Error</h3>
        <p>Notification d'erreur (problème détecté)</p>
        <button @click="testError" class="test-btn test-btn-error">Afficher Error</button>
      </div>

      <!-- Test Warning -->
      <div class="test-card">
        <h3>Warning</h3>
        <p>Notification d'avertissement (attention requise)</p>
        <button @click="testWarning" class="test-btn test-btn-warning">Afficher Warning</button>
      </div>
    </div>

    <div class="test-info">
      <h3>À propos du système simplifié</h3>
      <p>
        Cette page utilise le store Pinia <code>useNotificationStore</code> pour afficher les
        notifications.
      </p>

      <h3>Caractéristiques :</h3>
      <ul>
        <li>✅ Personnalisées (design dark mode)</li>
        <li>✅ Non-bloquantes (l'app continue de fonctionner)</li>
        <li>✅ Avec icônes</li>
        <li>✅ Responsives (mobile-friendly)</li>
        <li>✅ Avec animations</li>
        <li>✅ Auto-fermeture après 3-5 secondes</li>
      </ul>

      <h3>Architecture :</h3>
      <ul>
        <li>📁 <code>stores/notification.js</code> - Store Pinia (gère l'état + actions)</li>
        <li>📁 <code>components/Notification.vue</code> - Composant d'affichage simple</li>
        <li>📁 <code>App.vue</code> - Affiche le composant Notification</li>
      </ul>

      <h3>Avantages de cette approche :</h3>
      <ul>
        <li>🎯 Architecture Pinia native (standard Vue 3)</li>
        <li>🚀 Performance optimale</li>
        <li>📚 Facile à expliquer à l'oral</li>
        <li>🔧 Facile à maintenir et modifier</li>
        <li>🔗 Séparation claire : état (store) + présentation (composant)</li>
      </ul>

      <h3>Utilisation dans le code :</h3>
      <pre><code>import { useNotificationStore } from '@/stores/notification'

// Dans un composant setup :
const notificationStore = useNotificationStore()

const handleSuccess = () => {
  notificationStore.showSuccess('Opération réussie !')
}

const handleError = () => {
  notificationStore.showError('Une erreur est survenue')
}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()

// Test Info
const testInfo = () => {
  notificationStore.showInfo("Ceci est une notification d'information")
}

// Test Success
const testSuccess = () => {
  notificationStore.showSuccess("L'opération a réussi !")
}

// Test Error
const testError = () => {
  notificationStore.showError("Une erreur s'est produite")
}

// Test Warning
const testWarning = () => {
  notificationStore.showWarning('Attention : action importante')
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

.test-btn-warning {
  background-color: #fbbf24;
  color: white;
}

.test-btn-warning:hover {
  background-color: #f59e0b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
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

.test-info h3 {
  margin: 20px 0 12px 0;
  font-size: 1.1rem;
  color: #d1d5db;
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
  font-size: 0.9rem;
}

.test-info pre {
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  margin: 12px 0;
}

.test-info pre code {
  background: none;
  padding: 0;
  color: #d1d5db;
  font-size: 0.85rem;
  line-height: 1.5;
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
