<script setup>
// Configuration future pour l'authentification
</script>

<template>
  <div class="accueil">
    <!-- Hero Section avec design Figma -->
    <div class="hero-background">
      <div class="hero-content">
        <!-- Phrase d'accroche principale -->
        <div class="catch-phrase">
          <h1 class="main-title">Ta Voiture, Ton Empreinte Carbone.</h1>
          <h1 class="main-title">
            Et Si On <span class="eco-highlight">EcoRoulait</span> Ensemble ?
          </h1>
          <p class="subtitle">
            Chaque trajet en solo pèse sur la planète. Avec EcoRide, partagez vos trajets, réduisez
            vos émissions et faites des économies. Il est temps de changer la façon dont nous nous
            déplaçons. EcoRoulons vers un avenir plus vert.
          </p>
        </div>

        <!-- Section bottom avec recherche -->
        <div class="bottom-section">
          <!-- Section "En savoir plus" -->
          <div class="qui-sommes-nous">
            <div class="scroll-icon">
              <i class="fas fa-chevron-down"></i>
            </div>
            <div class="en-savoir-plus">En Savoir Plus</div>
          </div>

          <!-- Barre de recherche principale -->
          <div class="search-section">
            <div class="search-bar">
              <div class="search-inputs">
                <div class="input-group">
                  <input type="text" placeholder="Partir de ..." class="search-input" />
                </div>
                <div class="input-group">
                  <input type="text" placeholder="Aller à ..." class="search-input" />
                </div>
                <div class="input-group">
                  <input type="text" placeholder="Partir le ..." class="search-input" />
                </div>
                <button class="search-btn">
                  <span>Ride</span>
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer arrows section -->
    <div class="arrows-section">
      <div class="arrow-left">
        <i class="fas fa-chevron-left"></i>
      </div>
      <div class="footer-links">
        <span>attention@nous.nexistons.pas</span>
        <span>Mentions légales</span>
      </div>
      <div class="arrow-right">
        <i class="fas fa-chevron-right"></i>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Reset pour s'assurer qu'il n'y a pas de marges */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.accueil {
  background-color: #1a1a1a;
  border: none;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  color: white;
  margin: 0;
  padding: 0;
  padding-top: 50px; /* Espace réduit pour la navbar plus petite */
}

.hero-background {
  flex: 1;
  background: #1a1a1a url('@/assets/Accueil BG.png') center/cover no-repeat;
  border-radius: 0px 0px 100px 0px;
  display: flex;
  align-items: center;
  padding: 40px 60px;
  min-height: calc(100vh - 50px); /* Compense la hauteur de la navbar réduite */
  position: relative;
  overflow: hidden;
  width: 100%;
}

.hero-background::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 60%;
  height: 100%;
  background:
    radial-gradient(circle at 15% 15%, #34d399 18px, transparent 18px),
    radial-gradient(circle at 35% 25%, #22c55e 22px, transparent 22px),
    radial-gradient(circle at 25% 45%, #16a34a 25px, transparent 25px),
    radial-gradient(circle at 45% 65%, #34d399 20px, transparent 20px),
    radial-gradient(circle at 12% 80%, #22c55e 24px, transparent 24px),
    radial-gradient(circle at 50% 35%, #34d399 16px, transparent 16px),
    radial-gradient(circle at 20% 70%, #16a34a 19px, transparent 19px),
    radial-gradient(circle at 40% 85%, #22c55e 17px, transparent 17px);
  opacity: 0.3;
  z-index: 0;
  filter: blur(2px);
}

.hero-content {
  width: 100%;
  max-width: none;
  margin: 0;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100%;
}

.catch-phrase {
  margin-bottom: 80px;
  max-width: 70%;
  z-index: 3;
  position: relative;
}

.main-title {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  font-size: 3.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.1;
  margin-bottom: 0.5rem;
  z-index: 3;
  position: relative;
}

.eco-highlight {
  color: #34d399;
}

.subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 300;
  color: #e0e0e0;
  margin-top: 1rem;
  max-width: 700px;
  line-height: 1.4;
}

.bottom-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.qui-sommes-nous {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.scroll-icon {
  font-size: 2rem;
  color: #ffffff;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.en-savoir-plus {
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 300;
  color: #ffffff;
  text-align: center;
  letter-spacing: -0.08px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.en-savoir-plus:hover {
  color: #2e7d32;
}

.search-section {
  width: 100%;
  max-width: none;
}

.search-bar {
  background: transparent;
  border-radius: 50px;
  padding: 0;
  box-shadow: none;
}

.search-inputs {
  display: flex;
  align-items: center;
  gap: 0;
  flex-wrap: nowrap;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50px;
  padding: 8px;
}

.input-group {
  display: flex;
  align-items: center;
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  margin: 0 4px;
  padding: 0 20px;
}

.input-group i {
  color: #34d399;
  font-size: 1.2rem;
  margin-right: 10px;
}

.search-input {
  border: none;
  background: transparent;
  font-size: 1rem;
  color: #ffffff;
  flex: 1;
  padding: 15px 0;
  outline: none;
}

.search-input::placeholder {
  color: #cccccc;
}

.search-btn {
  background: #34d399;
  color: #1a1a1a;
  border: none;
  padding: 15px 25px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.3s ease;
  white-space: nowrap;
  margin-left: 8px;
}

.search-btn:hover {
  background: #22c55e;
}

.arrows-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 60px;
  height: 56px;
  background-color: #1a1a1a;
  width: 100%;
}

.arrow-left,
.arrow-right {
  color: #ffffff;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.arrow-left:hover,
.arrow-right:hover {
  color: #2e7d32;
}

.footer-links {
  display: flex;
  gap: 40px;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: #cccccc;
}

.footer-links span {
  cursor: pointer;
  transition: color 0.3s ease;
}

.footer-links span:hover {
  color: #2e7d32;
}

/* Responsive */
@media (max-width: 768px) {
  .accueil {
    padding-top: 50px;
  }

  .hero-background {
    padding: 20px;
    min-height: calc(100vh - 50px);
  }

  .catch-phrase {
    max-width: 100%;
    margin-bottom: 60px;
  }

  .main-title {
    font-size: 2.5rem;
  }

  .search-inputs {
    flex-direction: column;
  }

  .input-group {
    min-width: 100%;
  }

  .footer-links {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}

/* Animation pour l'icône de scroll */
@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.scroll-icon i {
  animation: bounce 2s infinite;
}
</style>
