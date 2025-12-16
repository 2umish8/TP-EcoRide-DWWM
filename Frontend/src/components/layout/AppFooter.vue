<script setup>
import { ref } from 'vue'
import BaseModal from '@/components/shared/modals/BaseModal.vue'

const showInfoModal = ref(false)
</script>

<template>
  <footer class="footer-ecoride">
    <div class="footer-content">
      <span class="footer-text">© 2025 EcoRide</span>
      <span class="footer-separator">|</span>
      <button class="footer-link" @click="showInfoModal = true">
        attention@nous.nexistons.pas
      </button>
      <span class="footer-separator">|</span>
      <router-link to="/mentions-legales" class="footer-link">Mentions légales</router-link>
    </div>

    <BaseModal :show="showInfoModal" title="À propos de nous" @close="showInfoModal = false">
      <div class="info-content">
        <p class="info-intro">
          <strong>EcoRide</strong> est un projet fictif créé à des fins éducatives.
        </p>
        <p>
          L'adresse e-mail <code>attention@nous.nexistons.pas</code> n'existe pas. Ce projet est une
          démonstration pédagogique et n'est pas une véritable application de covoiturage.
        </p>
        <p class="info-highlight">
          Merci de votre compréhension. Bonne exploration de l'application !
        </p>
      </div>
    </BaseModal>
  </footer>
</template>

<style scoped>
.footer-ecoride {
  position: static;
  width: 100%;
  z-index: 100;
  background: var(--color-dark-tertiary);
  color: var(--color-light);
  font-size: 1rem;
  padding: 15px 0;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.12);
  display: flex;
  justify-content: center;
  align-items: center;
}

.footer-content {
  display: flex;
  gap: 16px;
  align-items: center;
}

.footer-link {
  color: var(--color-light);
  text-decoration: underline;
  transition: color 0.2s;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font: inherit;
}

.footer-link:hover {
  color: var(--color-primary);
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-content p {
  margin: 0;
  line-height: 1.6;
  color: var(--color-light-secondary);
}

.info-intro {
  font-size: 1.1rem;
  color: var(--color-light);
}

.info-highlight {
  color: var(--color-primary);
  font-style: italic;
}

.info-content code {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  color: var(--color-primary);
}

.footer-separator {
  color: var(--color-light);
  opacity: 0.5;
}

.footer-text {
  font-weight: 500;
}
</style>
