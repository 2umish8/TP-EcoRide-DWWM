<template>
  <div class="test-buttons-page p-md">
    <h1>Button test playground</h1>

    <section>
      <h2>BaseButton</h2>
      <BaseButton @click="log('base click')">Base default</BaseButton>
      <BaseButton class="btn-sm" @click="log('base small')">Small</BaseButton>
      <BaseButton class="btn-lg" @click="log('base large')">Large</BaseButton>
      <BaseButton :disabled="true">Disabled</BaseButton>
    </section>

    <section>
      <h2>PrimaryButton</h2>
      <PrimaryButton @click="log('primary click')">Primary</PrimaryButton>
      <PrimaryButton :disabled="true">Primary disabled</PrimaryButton>
    </section>

    <section>
      <h2>SecondaryButton</h2>
      <SecondaryButton @click="log('secondary click')">Secondary</SecondaryButton>
    </section>

    <section>
      <h2>NavButton</h2>
      <NavButton @click="log('nav click')">Nav Action</NavButton>
      <NavButton to="/">Nav Link (home)</NavButton>
    </section>

    <section>
      <h2>InlineLink</h2>
      <InlineLink @click="log('inline click')">Inline link</InlineLink>
    </section>

    <pre class="mt-md">Last: {{ last }}</pre>
  </div>
</template>

<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'
import NavButton from '@/components/ui/NavButton.vue'
import InlineLink from '@/components/ui/InlineLink.vue'
import { ref } from 'vue'

const last = ref('none')
const log = (msg) => (last.value = msg)
</script>

<style scoped>
.test-buttons-page h1 {
  margin-bottom: var(--spacing-md);
}
.test-buttons-page section {
  margin-bottom: var(--spacing-lg);
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  flex-wrap: wrap;
}
.test-buttons-page pre {
  background: var(--color-dark-secondary);
  padding: var(--spacing-md);
  border-radius: 8px;
}
</style>





