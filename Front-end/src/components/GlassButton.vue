<template>
  <router-link
    :to="to"
    :class="[
      'eco-button',
      variant === 'inscription' ? 'eco-button--inscription' : 'eco-button--connexion',
    ]"
  >
    <slot></slot>
  </router-link>
</template>

<script setup>
defineProps({
  to: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: 'connexion', // 'connexion' ou 'inscription'
    validator: (value) => ['connexion', 'inscription'].includes(value),
  },
})
</script>

<style scoped>
.eco-button {
  /* Taille et position - Style moderne inspiré du bouton Ride */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 15px 25px;
  border-radius: 25px;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;

  /* Texte avec ombre intérieure et bordure grise */
  color: #2d2d2d;
  text-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid #d1d5db;

  /* Transitions fluides */
  transition: all 0.3s ease;

  /* Empêcher la sélection du texte */
  user-select: none;
  -webkit-user-select: none;
}

/* Variante Connexion - Vert nature désaturé */
.eco-button--connexion {
  /* Couleur verte écologique désaturée */
  background: #8fbc8f;

  /* Ombre portée moderne - NOIRE */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.eco-button--connexion:hover {
  /* Légère intensification au survol */
  background: #7fb87f;

  /* Ombre plus prononcée - NOIRE */
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);

  /* Transformation subtile */
  transform: translateY(-2px);
}

/* Variante Inscription - Bleu ciel désaturé */
.eco-button--inscription {
  /* Couleur bleue ciel désaturée */
  background: #87ceeb;

  /* Ombre portée moderne - NOIRE */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.eco-button--inscription:hover {
  /* Légère intensification au survol */
  background: #6bb6dd;

  /* Ombre plus prononcée - NOIRE */
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);

  /* Transformation subtile */
  transform: translateY(-2px);
}

/* États actifs - Retour à la position normale */
.eco-button--connexion:active,
.eco-button--inscription:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Focus pour l'accessibilité */
.eco-button:focus-visible {
  outline: 2px solid #f5deb3;
  outline-offset: 2px;
}

/* Responsive */
@media (max-width: 640px) {
  .eco-button {
    padding: 12px 20px;
    font-size: 0.9rem;
  }
}
</style>
