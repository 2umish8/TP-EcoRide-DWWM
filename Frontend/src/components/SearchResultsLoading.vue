<template>
  <div class="state-container">
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Recherche des covoiturages...</p>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.state-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  color: var(--color-gray);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>





