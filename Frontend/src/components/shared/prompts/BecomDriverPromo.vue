<template>
  <div class="promo-container">
    <div class="promo-icon">
      <font-awesome-icon :icon="['fas', 'car']" />
    </div>
    <h3 class="promo-title">Devenez conducteur EcoRide</h3>
    <p class="promo-subtitle">Vous n'êtes pas encore conducteur sur EcoRide.</p>
    <p class="promo-description">En devenant conducteur, vous pourrez :</p>
    <ul class="benefit-list">
      <li>
        <font-awesome-icon :icon="['fas', 'bullseye']" /> Proposer vos trajets à la communauté
      </li>
      <li>
        <font-awesome-icon :icon="['fas', 'coins']" /> Gagner des crédits en partageant vos frais
      </li>
      <li><font-awesome-icon :icon="['fas', 'leaf']" /> Réduire votre empreinte carbone</li>
      <li><font-awesome-icon :icon="['fas', 'handshake']" /> Rencontrer de nouvelles personnes</li>
      <li><font-awesome-icon :icon="['fas', 'star']" /> Recevoir des avis de vos passagers</li>
    </ul>
    <div class="promo-notice">
      <p>
        <strong
          ><font-awesome-icon :icon="['fas', 'clipboard-list']" /> Processus d'inscription requis
          :</strong
        >
      </p>
      <ul class="notice-list">
        <li>
          <font-awesome-icon :icon="['fas', 'circle-check']" /> Informations de votre véhicule
        </li>
        <li><font-awesome-icon :icon="['fas', 'circle-check']" /> Vos préférences de conduite</li>
        <li>
          <font-awesome-icon :icon="['fas', 'circle-check']" /> Engagement de conduite responsable
        </li>
      </ul>
    </div>
    <div class="promo-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
// No props needed - self-contained promotional component
</script>

<style scoped>
.promo-container {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  padding: 3rem 2rem;
  background: var(--color-dark-secondary);
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  color: var(--color-light-secondary);
}

.promo-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.promo-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-light);
  margin-bottom: 0.5rem;
}

.promo-subtitle {
  font-size: 1rem;
  color: var(--color-gray);
  margin-bottom: 1rem;
}

.promo-description {
  font-size: 1.1rem;
  color: var(--color-gray);
  margin: 1.5rem 0 1rem 0;
}

.benefit-list {
  text-align: left;
  margin: 1.5rem 0;
  padding: 0;
  list-style: none;
}

.benefit-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 1rem;
  color: var(--color-light-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.benefit-list li:last-child {
  border-bottom: none;
}

.benefit-list svg {
  color: var(--color-primary);
  min-width: 20px;
}

.promo-notice {
  background: var(--color-dark-tertiary);
  padding: 1rem;
  border-radius: 8px;
  margin: 1.5rem 0;
  border-left: 4px solid var(--color-success);
}

.promo-notice p {
  margin-bottom: 0.5rem;
  text-align: left;
}

.notice-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
}

.notice-list li {
  padding: 0.25rem 0;
  font-size: 0.95rem;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notice-list svg {
  color: var(--color-success);
  min-width: 16px;
}

.promo-actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
