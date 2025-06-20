<template>
  <section>
    <UCard>
      <div v-if="pending" class="text-muted">Chargement...</div>
      <div v-else-if="error" class="text-error">Erreur lors du chargement de la note</div>
      <div v-else>
        <h2 class="text-lg font-bold mb-4">{{ noteName }}</h2>
        <div class="prose max-w-none" v-html="content" />
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()

// On récupère le chemin complet après /notes/
const notePath = computed(() => decodeURIComponent(route.params.path as string || ''))

const { data, pending, error } = await useFetch(`/api/note?path=${encodeURIComponent(notePath.value)}`)
const content = computed(() => data.value?.content || '')
const noteName = computed(() => notePath.value.split('/').pop() || '')
</script>

<style scoped>
.prose {
  /* Pour un rendu markdown agréable */
  font-size: 1rem;
}
</style>
