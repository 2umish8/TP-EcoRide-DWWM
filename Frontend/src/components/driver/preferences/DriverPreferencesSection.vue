<template>
  <div class="preferences-section">
    <h3><font-awesome-icon :icon="['fas', 'gear']" /> Mes Préférences de Conduite</h3>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Musique pendant le trajet</label>
        <select
          :value="preferences.preferredMusicGenre"
          @change="onChange({ ...preferences, preferredMusicGenre: $event.target.value })"
          class="form-select"
        >
          <option value="">Aucune préférence</option>
          <option value="pop">Pop</option>
          <option value="rock">Rock</option>
          <option value="jazz">Jazz</option>
          <option value="classique">Classique</option>
          <option value="electronic">Électronique</option>
          <option value="rap">Rap</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Niveau de conversation</label>
        <select
          :value="preferences.conversationLevel"
          @change="onChange({ ...preferences, conversationLevel: $event.target.value })"
          class="form-select"
        >
          <option value="silent">Silencieux</option>
          <option value="minimal">Minimal</option>
          <option value="friendly">Modéré</option>
          <option value="chatty">Bavard</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Préférences</label>
      <div class="preferences-inline">
        <div class="preference-inline-item">
          <div>
            <h5><font-awesome-icon :icon="['fas', 'smoking']" /> Fumeur</h5>
          </div>
          <label class="switch-small">
            <input
              type="checkbox"
              :checked="preferences.allowsSmoking"
              @change="onChange({ ...preferences, allowsSmoking: $event.target.checked })"
            />
            <span class="slider"></span>
          </label>
        </div>

        <div class="preference-inline-item">
          <div>
            <h5><font-awesome-icon :icon="['fas', 'paw']" /> Animaux</h5>
          </div>
          <label class="switch-small">
            <input
              type="checkbox"
              :checked="preferences.allowsPets"
              @change="onChange({ ...preferences, allowsPets: $event.target.checked })"
            />
            <span class="slider"></span>
          </label>
        </div>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Règles spéciales (optionnel)</label>
      <textarea
        :value="preferences.specialRules"
        @input="onChange({ ...preferences, specialRules: $event.target.value })"
        class="form-textarea"
        placeholder="ex: pas de musique, climatisation à 22°C..."
        rows="3"
      ></textarea>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DriverPreferencesSection',
  props: {
    preferences: {
      type: Object,
      required: true,
    },
  },
  emits: ['update'],
  methods: {
    onChange(newPrefs) {
      this.$emit('update', newPrefs)
    },
  },
}
</script>

<style scoped>
.preferences-section {
  margin-bottom: 20px;
}

.preferences-section h3 {
  margin: 0 0 15px 0;
  color: var(--color-light);
  font-size: 1.3rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
  width: 100%;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: var(--color-light-secondary);
}

.form-select {
  width: 100%;
  padding: 10px 12px;
  background: var(--color-dark-tertiary);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: var(--color-light-secondary);
  font-size: 0.95rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
}

.form-select:hover {
  border-color: rgba(255, 255, 255, 0.25);
}

.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(143, 218, 179, 0.18);
}

.form-select option {
  background: var(--color-dark);
  color: var(--color-light);
}

.preferences-inline {
  display: flex;
  gap: 20px;
}

.preference-inline-item {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.preference-inline-item div h5 {
  margin: 0;
  color: var(--color-light);
  font-size: 0.9rem;
  white-space: nowrap;
}

.switch-small {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch-small input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-error);
  transition: 0.4s;
  border-radius: 24px;
  opacity: 0.5;
}

.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

.switch-small input:checked + .slider {
  background-color: var(--color-success);
  opacity: 1;
}

.switch-small input:checked + .slider:before {
  transform: translateX(18px);
}

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  background: var(--color-dark-tertiary);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: var(--color-light-secondary);
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  transition: all 0.3s ease;
}

.form-textarea:hover {
  border-color: rgba(255, 255, 255, 0.25);
}

.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(143, 218, 179, 0.18);
  color: var(--color-light);
}

.form-textarea::placeholder {
  color: var(--color-gray);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .preferences-inline {
    flex-direction: column;
  }

  .preference-inline-item {
    justify-content: space-between;
  }
}
</style>
