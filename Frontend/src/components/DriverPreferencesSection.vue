<template>
  <div class="preferences-card">
    <h3 class="card-title">Mes Préférences de Conduite</h3>
    <div class="preferences-grid">
      <label class="preference-item">
        <input
          type="checkbox"
          :checked="preferences.allowsSmoking"
          @change="onChange({ ...preferences, allowsSmoking: $event.target.checked })"
        />
        <span class="preference-label">🚬 Fumeur autorisé</span>
      </label>

      <label class="preference-item">
        <input
          type="checkbox"
          :checked="preferences.allowsPets"
          @change="onChange({ ...preferences, allowsPets: $event.target.checked })"
        />
        <span class="preference-label">🐕 Animaux autorisés</span>
      </label>

      <div class="preference-select">
        <label class="form-label">🎵 Genre musical préféré</label>
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

      <div class="preference-select">
        <label class="form-label">💬 Niveau de conversation</label>
        <select
          :value="preferences.conversationLevel"
          @change="onChange({ ...preferences, conversationLevel: $event.target.value })"
          class="form-select"
        >
          <option value="silencieux">Silencieux</option>
          <option value="modéré">Modéré</option>
          <option value="bavard">Bavard</option>
        </select>
      </div>
    </div>

    <div class="custom-rules">
      <textarea
        :value="preferences.specialRules"
        @input="onChange({ ...preferences, specialRules: $event.target.value })"
        class="form-textarea"
        placeholder="Règles spéciales (ex: pas de musique, climatisation à 22°C...)"
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
.preferences-card {
  background: #111827;
  padding: 20px;
  border-radius: 12px;
}
</style>
