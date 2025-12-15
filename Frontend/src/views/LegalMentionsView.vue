<script setup>
// Page statique: Mentions légales
</script>

<template>
  <main class="legal-page">
    <h1 class="page-title">Mentions légales</h1>

    <section class="project-info">
      <p class="project-note">
        <strong>Projet étudiant</strong> — Ce site a été développé dans le cadre de la formation
        <a
          href="https://www.studi.com/fr/formation/developpement-web/graduate-developpeur-flutter"
          target="_blank"
          rel="noopener noreferrer"
          >Graduate Développeur Flutter (Studi)</a
        >.
      </p>
      <p class="project-meta">
        Le projet est <strong>open‑source</strong> et destiné à des fins pédagogiques — code
        disponible sur
        <a
          href="https://github.com/2umish8/TP-EcoRide-DWWM"
          target="_blank"
          rel="noopener noreferrer"
          >GitHub</a
        >. Si ce projet vous a aidé, pensez à lui laisser une étoile sur GitHub pour en faciliter la
        visibilité et aider les futurs étudiants.
      </p>
    </section>

    <section class="legal-section">
      <h2>Projet / Édition</h2>
      <p>
        Ce site est un <strong>projet étudiant</strong> réalisé dans le cadre d'un projet d'études
        pour l'obtention du diplôme
        <a
          href="https://www.francecompetences.fr/recherche/rncp/37674/"
          target="_blank"
          rel="noopener noreferrer"
          >RNCP Développeur Web et Web Mobile (DWWM)</a
        >. Il ne constitue pas une entreprise commerciale.
      </p>
    </section>

    <section class="legal-section">
      <h2>Hébergeur</h2>
      <p>
        Le site est hébergé par
        <a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer">Netlify</a>.
      </p>
    </section>

    <section class="legal-section">
      <h2>Avertissement & responsabilité</h2>
      <p>
        Ce site est fourni à des fins pédagogiques et n'offre pas de service commercial (pas de
        paiement, pas de garanties commerciales). Toute organisation, planification ou réalisation
        de trajets (covoiturage) qui s'effectue via cette plateforme se fait sous l'entière
        responsabilité des utilisateurs impliqués. L'auteur du projet décline toute responsabilité
        concernant les événements, dommages ou litiges qui pourraient survenir à l'occasion de
        trajets organisés via ce site.
      </p>
      <p>
        L'adresse <a href="mailto:attention@nous.nexistons.pas">attention@nous.nexistons.pas</a> est
        volontairement trompeuse pour rappeler qu'il ne s'agit pas d'un service commercial réel.
      </p>
    </section>

    <section class="legal-section">
      <h2>Contact professionnel</h2>
      <p>
        Pour toute demande professionnelle (création de site de A à Z, fullstack, déploiement),
        contactez :
        <a href="mailto:mischael.rad@gmail.com">mischael.rad@gmail.com</a>
      </p>
    </section>

    <router-link to="/" class="back-link">Retour à l'accueil</router-link>
  </main>
</template>

<style scoped>
.legal-page {
  max-width: 820px;
  margin: 2rem auto;
  padding: 1.25rem;
  background: var(--color-dark);
  color: var(--color-light);
  border-radius: 8px;
}

.page-title {
  margin-bottom: 1rem;
  font-size: 1.75rem;
}

.legal-section {
  margin-bottom: 1rem;
}

.legal-section h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
}

.legal-section p {
  margin: 0;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.85);
}

.back-link {
  display: inline-block;
  margin-top: 1.25rem;
  color: var(--color-primary);
  text-decoration: underline;
}

.project-info {
  border-left: 4px solid var(--color-primary);
  padding: 0.75rem 1rem;
  margin-bottom: 1.25rem;
  background: var(--color-dark-tertiary);
  border-radius: 6px;
}

.project-note {
  margin: 0 0 0.25rem 0;
  color: var(--color-light);
  font-weight: 600;
}

.project-meta {
  margin: 0;
  color: var(--color-light);
  opacity: 0.9;
  font-size: 0.95rem;
}

.project-info a {
  color: var(--color-primary);
  text-decoration: underline;
}

.legal-page a {
  color: var(--color-primary);
}
</style>
