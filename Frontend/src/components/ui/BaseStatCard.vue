<template>
  <div :class="['stat-card', variantClass]">
    <span class="stat-number">{{ number }}</span>
    <span class="stat-label">{{ label }}</span>
    <span v-if="subtext" class="stat-subtext">{{ subtext }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  number: {
    type: [String, Number],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  subtext: {
    type: String,
    default: null,
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) =>
      ['default', 'completed', 'upcoming', 'passengers', 'eco-impact'].includes(value),
  },
})

const variantClass = `stat-card-${props.variant}`
</script>

<style scoped>
/* Base stat card styling */
.stat-card {
  background: var(--color-dark-secondary);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  text-align: center;
  border-left: 4px solid var(--color-success);
  position: relative;
  overflow: hidden;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-success);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--color-gray);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-subtext {
  display: block;
  font-size: 0.75rem;
  color: var(--color-secondary);
  margin-top: 0.25rem;
  font-weight: 500;
}

/* Variant: Completed Trips */
.stat-card-completed {
  background: linear-gradient(135deg, var(--color-dark-secondary) 0%, rgba(34, 197, 94, 0.1) 100%);
  border-left-color: var(--color-success);
}

.stat-card-completed::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(67, 197, 97, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.stat-card-completed .stat-number {
  color: var(--color-success);
}

/* Variant: Upcoming Trips */
.stat-card-upcoming {
  background: linear-gradient(135deg, var(--color-dark-secondary) 0%, rgba(245, 158, 11, 0.1) 100%);
  border-left-color: var(--color-warning);
}

.stat-card-upcoming::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(241, 213, 129, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.stat-card-upcoming .stat-number {
  color: var(--color-warning);
}

/* Variant: Passengers Transported */
.stat-card-passengers {
  background: linear-gradient(135deg, var(--color-dark-secondary) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-left-color: var(--color-primary);
}

.stat-card-passengers::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(143, 218, 179, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.stat-card-passengers .stat-number {
  color: var(--color-primary);
}

/* Variant: Eco Impact */
.stat-card-eco-impact {
  background: linear-gradient(135deg, var(--color-dark-secondary) 0%, rgba(32, 201, 151, 0.1) 100%);
  border-left-color: var(--color-secondary);
}

.stat-card-eco-impact::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(121, 208, 158, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.stat-card-eco-impact .stat-number {
  color: var(--color-secondary);
}

/* Default variant */
.stat-card-default {
  border-left-color: var(--color-success);
}

.stat-card-default .stat-number {
  color: var(--color-success);
}
</style>
