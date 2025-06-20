<template>
  <section>
    <UCard>
      <div v-if="pending">Chargement...</div>
      <div v-else-if="!doc">Note introuvable</div>
      <div v-else>
        <h2 class="text-lg font-bold mb-4">{{ doc.title || doc._file }}</h2>
        <ContentRenderer :value="doc" class="prose max-w-none" />
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { queryContent } from '#content'

const { slug } = useRoute().params
const path = Array.isArray(slug) ? slug.join('/') : slug
const { data: doc, pending } = await useAsyncData('note', () =>
  queryContent('notes/' + path).findOne()
)
</script>
