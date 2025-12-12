<script setup>
// Footer composant - aucune logique complexe nécessaire
</script>

<template>
  <footer class="footer-ecoride">
    <div class="footer-content">
      <span class="footer-text">© 2025 EcoRide</span>
      <span class="footer-separator">|</span>
      <a href="mailto:attention@nous.nexistons.pas" class="footer-link"
        >attention@nous.nexistons.pas</a
      >
      <span class="footer-separator">|</span>
      <a href="#" class="footer-link">Mentions légales</a>
    </div>
  </footer>
</template>

<style scoped>
.footer-ecoride {
  position: static;
  width: 100%;
  z-index: 100;
  background: linear-gradient(90deg, #181c1f, #23272b 80%);
  color: #f5f5f5;
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
  color: #f5f5f5;
  text-decoration: underline;
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--eco-blue);
}

.footer-separator {
  color: #f5f5f5;
  opacity: 0.5;
}

.footer-text {
  font-weight: 500;
}
</style>
