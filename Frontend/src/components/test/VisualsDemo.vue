<script setup>
import ButtonsTemplate from '@/components/test/ButtonsTemplate.vue'
</script>

<template>
  <section class="visuals-demo">
    <ButtonsTemplate />
    <div class="row mb-4">
      <div class="col-md-6">
        <h3>Color palette</h3>
        <div class="d-flex gap-2 flex-wrap">
          <div class="swatch" style="background: var(--eco-primary)"><span>#8fdab3</span></div>
          <div class="swatch" style="background: var(--eco-primary-hover)">
            <span>#6bc26b</span>
          </div>
          <div class="swatch" style="background: var(--eco-secondary)"><span>#79d09e</span></div>
          <div class="swatch" style="background: var(--bg-dark)"><span>#1a1a1a</span></div>
          <div class="swatch" style="background: var(--bg-dark-2)"><span>#2d2d2d</span></div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6">
        <h3>Cards</h3>
        <div class="card-demo">
          <div class="trip-card p-3 mb-3">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h4 class="mb-1">Paris → Lyon</h4>
                <div class="text-muted small">12 déc • 08:30 • 4h</div>
              </div>
              <div class="status badge bg-success">Terminé</div>
            </div>
            <p class="mt-2 mb-0">Conducteur: Alice • Voiture: Toyota • 2 places</p>
          </div>

          <div class="trip-card p-3 mb-3 canceled">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h4 class="mb-1">Marseille → Nice</h4>
                <div class="text-muted small">15 déc • 10:00 • 2h</div>
              </div>
              <div class="status badge bg-secondary">Annulé</div>
            </div>
            <p class="mt-2 mb-0">Conducteur: Bob • Voiture: Renault • 0 places</p>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <h3>Typography</h3>
        <div class="typography-samples">
          <h1>H1 — Titre principal</h1>
          <h2>H2 — Sous-titre</h2>
          <p class="lead">
            Paragraphe d'exemple, taille normale et hauteur de ligne conforme à la charte.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
.btn-primary {
  background: var(--eco-green);
  color: #132;
  box-shadow: var(--shadow-button);
  border-radius: var(--radius-button);
  transition: var(--transition-standard);
}
.btn-primary:hover {
  box-shadow: var(--shadow-button-hover);
  transform: translateY(-2px);
}
.btn-secondary {
  background: var(--eco-blue);
  color: #fff;
  box-shadow: var(--shadow-button);
  border-radius: var(--radius-button);
  transition: var(--transition-standard);
}
.btn-secondary:hover {
  box-shadow: var(--shadow-button-hover);
  transform: translateY(-2px);
}
.btn-outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #fff;
}
.btn-disabled {
  background: #7a7a7a;
  color: #fff;
  cursor: not-allowed;
  opacity: 0.7;
}

.swatch {
  width: 120px;
  height: 60px;
  border-radius: var(--radius-card);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: var(--shadow-card);
  margin-bottom: 8px;
}
.swatch span {
  font-size: 0.9rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
}

.trip-card {
  background: var(--bg-dark-2);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: var(--shadow-card);
}
.trip-card.canceled {
  opacity: 0.7;
  filter: grayscale(0.3);
}
.status {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
}

.typography-samples h1 {
  font-size: 1.5rem;
}
.typography-samples h2 {
  font-size: 1.25rem;
}
.typography-samples p.lead {
  font-size: 1rem;
  color: var(--text-muted);
}
</style>
