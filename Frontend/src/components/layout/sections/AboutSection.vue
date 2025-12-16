<template>
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
</template>

<script setup></script>

<style scoped>
.about-section {
  background-color: var(--color-dark);
  padding: 80px 60px;
  color: var(--color-light);
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
  color: var(--color-primary);
  margin-bottom: 30px;
  letter-spacing: -0.02em;
}

.about-text {
  font-family: 'Inter', sans-serif;
  line-height: 1.7;
}

.about-paragraph {
  font-size: 1.1rem;
  color: var(--color-light-secondary);
  margin-bottom: 20px;
  font-weight: 300;
}

.about-values {
  font-size: 1.1rem;
  color: var(--color-light);
  margin-top: 30px;
  padding: 20px;
  background: rgba(52, 211, 153, 0.1);
  border-left: 4px solid var(--color-primary);
  border-radius: 0 8px 8px 0;
}
</style>





