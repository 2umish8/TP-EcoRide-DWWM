<template>
  <div class="arrows-section">
    <div class="arrow-down">
      <font-awesome-icon :icon="['fas', 'chevron-down']" class="arrow-icon" size="lg" />
    </div>
    <div class="footer-links">
      <slot />
    </div>
    <div class="arrow-down">
      <font-awesome-icon :icon="['fas', 'chevron-down']" class="arrow-icon" size="lg" />
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.arrows-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 60px;
  height: 56px;
  background-color: var(--color-dark);
  width: 100%;
}

.arrow-down {
  color: var(--color-light);
  font-size: 1.2rem;
  animation: arrowBounce 2s infinite ease-in-out;
}

.arrow-down:last-child {
  animation-delay: 0.3s;
}

.arrow-icon {
  width: 24px;
  height: 24px;
  transition: filter 0.3s ease;
}

.footer-links {
  display: flex;
  gap: 40px;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: var(--color-light-secondary);
}

.footer-links span {
  cursor: pointer;
  transition: color 0.3s ease;
}

.footer-links span:hover {
  color: var(--color-success);
}
</style>





