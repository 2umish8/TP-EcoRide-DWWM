<script setup>
import ButtonsTemplate from '@/components/test/ButtonsTemplate.vue'
import TripCard from '@/components/trips/cards/TripCard.vue'
import EcologicTripCard from '@/components/trips/cards/EcologicTripCard.vue'

const sampleTrips = [
  {
    id: 1,
    departure_address: 'Paris',
    arrival_address: 'Lyon',
    departure_datetime: new Date(2024, 11, 12, 8, 30),
    arrival_datetime: new Date(2024, 11, 12, 12, 30),
    price_per_passenger: 25,
    participants_count: 2,
    initial_seats_offered: 4,
    seats_remaining: 2,
    status: 'terminé',
    model: 'Toyota Prius',
    plate_number: 'AB-123-CD',
  },
  {
    id: 2,
    departure_address: 'Marseille',
    arrival_address: 'Nice',
    departure_datetime: new Date(2024, 11, 15, 10, 0),
    arrival_datetime: new Date(2024, 11, 15, 12, 0),
    price_per_passenger: 15,
    participants_count: 0,
    initial_seats_offered: 3,
    seats_remaining: 3,
    status: 'annulé',
    model: 'Renault Clio',
    plate_number: 'CD-456-EF',
    cancellation_date: new Date(2024, 11, 14),
  },
  {
    id: 3,
    departure_address: 'Toulouse',
    arrival_address: 'Bordeaux',
    departure_datetime: new Date(2024, 11, 18, 14, 0),
    arrival_datetime: new Date(2024, 11, 18, 16, 30),
    price_per_passenger: 18,
    participants_count: 3,
    initial_seats_offered: 4,
    seats_remaining: 1,
    status: 'démarré',
    model: 'Tesla Model 3',
    plate_number: 'EF-789-GH',
  },
]
</script>

<template>
  <section class="visuals-demo">
    <ButtonsTemplate />
    <div class="palette-section">
      <h3>Color palette</h3>
      <div class="d-flex gap-2 flex-wrap">
        <div class="swatch" style="background: var(--eco-primary)"><span>#8fdab3</span></div>
        <div class="swatch" style="background: var(--eco-primary-hover)">
          <span>#6bc26b</span>
        </div>
        <div class="swatch" style="background: var(--eco-secondary)"><span>#79d09e</span></div>
        <div class="swatch" style="background: var(--bg-dark)">
          <span>var(--color-dark)</span>
        </div>
        <div class="swatch" style="background: var(--bg-dark-2)"><span>#2d2d2d</span></div>
      </div>
    </div>

    <div class="content-row">
      <div class="cards-section">
        <h3>Cards</h3>
        <TripCard
          v-for="trip in sampleTrips.slice(0, 2)"
          :key="trip.id"
          :trip="trip"
          :showEarnings="true"
          class="mb-3"
        />
        <div class="ecologic-card-section">
          <h4>Écologic Trip Card</h4>
          <EcologicTripCard :trip="sampleTrips[2]" :showEarnings="true" class="mb-3" />
        </div>
        <h3>Typography</h3>
        <h1>H1 — Titre principal</h1>
        <h2>H2 — Sous-titre</h2>
        <p class="lead">
          Paragraphe d'exemple, taille normale et hauteur de ligne conforme à la charte.
        </p>
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
  color: var(--color-dark);
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
  color: var(--color-light);
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
  color: var(--color-light);
}
.btn-disabled {
  background: var(--color-gray);
  color: var(--color-light);
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
  color: var(--color-light);
  box-shadow: var(--shadow-card);
  margin-bottom: 8px;
}
.swatch span {
  font-size: 0.9rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
}

.palette-section,
.cards-section,
.typography-section {
  flex: 1;
  min-width: 300px;
}

.ecologic-card-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(143, 218, 179, 0.2);
}

.ecologic-card-section h4 {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: var(--eco-primary);
  font-weight: 600;
}

.content-row {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.typography-section h1 {
  font-size: 1.5rem;
}
.typography-section h2 {
  font-size: 1.25rem;
}
.typography-samples p.lead {
  font-size: 1rem;
  color: var(--text-muted);
}
</style>
