<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Configuration future pour l'authentification
const router = useRouter()

// Variables réactives pour le formulaire de recherche
const searchForm = ref({
  departure: '',
  destination: '',
  date: '',
})

// Fonction pour gérer la recherche
const handleSearch = () => {
  // Navigation vers la page de résultats avec les paramètres de recherche (même si vides)
  router.push({
    name: 'SearchResults',
    query: {
      from: searchForm.value.departure || '',
      to: searchForm.value.destination || '',
      date: searchForm.value.date || '',
    },
  })
}

// Fonction pour aller directement à la page des covoiturages
const goToCarpooling = () => {
  router.push({
    name: 'SearchResults',
    query: {
      from: '',
      to: '',
      date: '',
    },
  })
}

// Fonction pour scroller vers la section "À propos"
const scrollToAbout = () => {
  const aboutSection = document.getElementById('about-section')
  if (aboutSection) {
    aboutSection.scrollIntoView({ behavior: 'smooth' })
  }
}
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
          <h2 class="mobile-slogan">
            Il y aura moins d'emboutaillage et de pollution, et ca sera grâce à
            <span class="eco-highlight">Vous</span> !
          </h2>
          <p class="subtitle">
            Chaque trajet en solo pèse sur la planète. Avec EcoRide, partagez vos trajets, réduisez
            vos émissions et faites des économies. Il est temps de changer la façon dont nous nous
            déplaçons. EcoRoulons vers un avenir plus vert.
          </p>
        </div>

        <!-- Section bottom avec recherche -->
        <div class="bottom-section">
          <!-- Barre de recherche principale -->
          <div class="search-section">
            <div class="search-bar">
              <form @submit.prevent="handleSearch" class="search-inputs">
                <div class="input-group">
                  <input
                    type="text"
                    placeholder="Partir de ..."
                    class="search-input"
                    v-model="searchForm.departure"
                    required
                  />
                </div>
                <div class="input-group">
                  <input
                    type="text"
                    placeholder="Aller à ..."
                    class="search-input"
                    v-model="searchForm.destination"
                    required
                  />
                </div>
                <div class="input-group">
                  <input
                    type="date"
                    placeholder="dd/mm/yyyy"
                    class="search-input"
                    v-model="searchForm.date"
                    lang="fr"
                    :min="new Date().toISOString().split('T')[0]"
                  />
                </div>
                <button type="submit" class="search-btn">
                  <span>ecoRIDEZ</span>
                  <img
                    src="@/assets/search-sort-svgrepo-com.svg"
                    alt="Rechercher"
                    class="search-icon"
                  />
                </button>
              </form>
            </div>
            <!-- Bouton pour parcourir tous les covoiturages -->
            <div class="browse-all-section">
              <button @click="goToCarpooling" class="browse-all-btn">
                <span>Parcourir tous les covoiturages</span>
              </button>
            </div>
          </div>
          <!-- Section "En savoir plus" -->
          <div class="qui-sommes-nous">
            <div class="scroll-icon">
              <img src="@/assets/scroll-svgrepo-com.svg" alt="Scroll" class="scroll-svg" />
            </div>
            <div class="en-savoir-plus" @click="scrollToAbout">En Savoir Plus</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer arrows section -->
    <div class="arrows-section">
      <div class="arrow-down">
        <img
          src="@/assets/arrow-down-svgrepo-com.svg"
          alt="Scroller vers le bas"
          class="arrow-icon"
        />
      </div>
      <div class="footer-links">
      </div>
      <div class="arrow-down">
        <img
          src="@/assets/arrow-down-svgrepo-com.svg"
          alt="Scroller vers le bas"
          class="arrow-icon"
        />
      </div>
    </div>

    <!-- Section À propos de nous -->
    <section id="about-section" class="about-section">
      <div class="about-container">
        <div class="about-logo"></div>
        <div class="about-content">
          <h2 class="about-title">À Propos de Nous</h2>
          <div class="about-text">
            <p class="about-paragraph">
              Nous sommes une équipe passionnée qui croit fermement que le transport peut être
              différent. Née de l'envie de créer des liens authentiques entre les personnes, EcoRide
              n'est pas qu'une simple plateforme de covoiturage.
            </p>
            <p class="about-paragraph">
              Nous partageons la conviction que chaque trajet est une opportunité de rencontrer de
              nouvelles personnes, de partager des moments, et surtout, de contribuer ensemble à un
              impact positif sur notre environnement.
            </p>
            <p class="about-paragraph">
              Notre mission est simple : faciliter les connexions humaines tout en préservant notre
              planète. Nous croyons en la force du collectif et en l'impact que peuvent avoir de
              petits gestes quotidiens quand ils sont partagés par une communauté.
            </p>
            <p class="about-values">
              <strong>Nos valeurs :</strong> Authenticité, Partage, Respect environnemental, et
              Simplicité.
            </p>
          </div>
        </div>
      </div>
    </section>
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
  border-radius: 0px 0px 80px 0px; /* Réduit de 100px à 80px pour moins de clipping */
  display: flex;
  align-items: center;
  padding: 40px 60px;
  min-height: calc(100vh - 50px); /* Compense la hauteur de la navbar réduite */
  position: relative;
  overflow: visible; /* Changé de hidden à visible pour éviter le clipping */
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
  gap: auto; /* Utilisé pour l'espacement entre les éléments */
}

.catch-phrase {
  margin-top: 20px;
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
  font-size: 2.5rem;
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

.mobile-slogan {
  font-family: 'Inter', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.2;
  display: none; /* Masqué par défaut, affiché seulement sur mobile */
}

.subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 1.2rem; /* Réduit de 1.5rem à 1.2rem */
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
  gap: 5px;
  padding-top: 30px;
  padding-bottom: 20px;
  position: relative;
  z-index: 10; /* S'assure que le contenu reste au-dessus */
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

.scroll-svg {
  width: 32px;
  height: 32px;
  filter: invert(1);
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
  background: rgba(213, 213, 213, 0.1);
  border-color: #666666;
  border-radius: 25px;
  margin: 0 4px;
  padding: 0 20px;
  min-width: 0; /* Permet aux inputs de rétrécir */
}

.input-group:nth-child(1),
.input-group:nth-child(2) {
  flex: 0.35; /* 35% pour départ et arrivée */
}

.input-group:nth-child(3) {
  flex: 0.3; /* 30% pour la date */
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
  min-width: 0; /* Permet aux inputs de rétrécir autant que nécessaire */
  width: 100%; /* Prend toute la largeur disponible dans son conteneur */
}

.search-input[type='date'] {
  color-scheme: dark;
}

.search-input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
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
  flex-shrink: 0; /* Le bouton ne rétrécit jamais */
  min-width: auto; /* Pas de largeur minimum imposée par le navigateur */
}

.search-btn:hover {
  background: #22c55e;
}

.search-icon {
  width: 18px;
  height: 18px;
  filter: invert(1);
}

/* Styles pour la section de navigation vers tous les covoiturages */
.browse-all-section {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

.browse-all-btn {
  background: transparent;
  color: #34d399;
  border: 2px solid #34d399;
  padding: 12px 20px;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.browse-all-btn:hover {
  background: #34d399;
  color: #1a1a1a;
  transform: translateY(-2px);
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

.arrow-down {
  color: #ffffff;
  font-size: 1.2rem;
  animation: arrowBounce 2s infinite ease-in-out;
}

.arrow-down:last-child {
  animation-delay: 0.3s;
}

.arrow-icon {
  width: 24px;
  height: 24px;
  filter: invert(1);
  transition: filter 0.3s ease;
}

@keyframes arrowBounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(8px);
  }
  60% {
    transform: translateY(4px);
  }
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

/* Section À propos de nous */
.about-section {
  background-color: #1a1a1a;
  padding: 80px 60px;
  color: #ffffff;
}

.about-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 60px;
}

.about-logo {
  flex-shrink: 0;
}

.about-logo-img {
  width: 200px;
  height: auto;
  filter: brightness(1.1);
}

.about-content {
  flex: 1;
}

.about-title {
  font-family: 'Inter', sans-serif;
  font-size: 2.5rem;
  font-weight: 600;
  color: #34d399;
  margin-bottom: 30px;
  letter-spacing: -0.02em;
}

.about-text {
  font-family: 'Inter', sans-serif;
  line-height: 1.7;
}

.about-paragraph {
  font-size: 1.1rem;
  color: #e0e0e0;
  margin-bottom: 20px;
  font-weight: 300;
}

.about-values {
  font-size: 1.1rem;
  color: #ffffff;
  margin-top: 30px;
  padding: 20px;
  background: rgba(52, 211, 153, 0.1);
  border-left: 4px solid #34d399;
  border-radius: 0 8px 8px 0;
}

/* Responsive pour tablettes (zone critique entre 769px et 1024px) */
@media (min-width: 769px) and (max-width: 1024px) {
  .search-inputs {
    padding: 6px;
  }

  .input-group {
    margin: 0 2px;
    padding: 0 15px;
  }

  .input-group:nth-child(1),
  .input-group:nth-child(2) {
    flex: 0.35; /* 35% pour départ et arrivée */
  }

  .input-group:nth-child(3) {
    flex: 0.25; /* 25% pour la date - plus compact */
  }

  .search-input {
    padding: 12px 0;
    font-size: 0.9rem;
    min-width: 0; /* Important pour permettre le rétrécissement */
  }

  .search-btn {
    padding: 12px 20px;
    margin-left: 4px;
    flex-shrink: 0; /* Le bouton garde sa taille */
    min-width: auto; /* Pas de largeur minimum imposée */
  }
}

/* Responsive */
@media (max-width: 768px) {
  .accueil {
    padding-top: 50px;
  }

  .hero-background {
    padding: 20px;
    min-height: calc(100vh - 50px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .hero-content {
    height: 100%;
    justify-content: space-between;
  }

  .catch-phrase {
    max-width: 100%;
    margin-bottom: 30px;
    flex-shrink: 0;
  }

  .main-title {
    font-size: 2rem;
    margin-bottom: 0.3rem;
    display: none; /* Masquer le titre principal sur mobile */
  }

  .mobile-slogan {
    display: block; /* Afficher le slogan mobile */
    margin-bottom: 1rem;
  }

  .subtitle {
    font-size: 1rem;
    margin-top: 0.5rem;
    display: none; /* Masquer le texte sur mobile pour prioriser la recherche */
  }

  .bottom-section {
    margin-top: auto;
    gap: 20px;
    padding-bottom: 40px; /* Augmenté pour éviter le clipping sur mobile */
    margin-bottom: 10px; /* Marge supplémentaire */
  }

  .qui-sommes-nous {
    order: 2; /* Mettre "En savoir plus" après la recherche */
  }

  .search-section {
    order: 1; /* Prioriser la barre de recherche */
    width: 100%;
  }

  .search-inputs {
    flex-direction: column;
    gap: 8px;
    padding: 12px;
  }

  .input-group {
    min-width: 100%;
    margin: 0;
  }

  .search-btn {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }

  .arrows-section {
    padding: 20px;
  }

  .footer-links {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  /* Section À propos responsive */
  .about-section {
    padding: 40px 20px;
  }

  .about-container {
    flex-direction: column;
    gap: 30px;
    text-align: center;
  }

  .about-logo-img {
    width: 150px;
  }

  .about-title {
    font-size: 2rem;
  }

  .about-paragraph,
  .about-values {
    font-size: 1rem;
  }
}

/* Responsive pour très petits écrans */
@media (max-width: 480px) {
  .mobile-slogan {
    font-size: 1.5rem;
  }

  .hero-background {
    padding: 15px;
  }

  .about-section {
    padding: 30px 15px;
  }

  .about-title {
    font-size: 1.8rem;
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
