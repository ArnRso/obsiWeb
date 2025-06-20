<template>
  <section>
    <UBreadcrumb :items="breadcrumbItems" class="mb-4" />
    <UCard>
      <div v-if="pending">Chargement...</div>
      <div v-else-if="error || !note">Note introuvable</div>
      <div v-else class="prose max-w-none">
        <h2 class="text-lg font-bold mb-4">{{ note.title || path }}</h2>
        <ContentRenderer :value="note" />
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
const { slug } = useRoute().params
const path = Array.isArray(slug) ? slug.join('/') : slug

const { data: note, pending, error } = await useAsyncData(
  `note-${path}`,
  () => queryCollection('content').path(`/notes/${path}`).first()
)

const breadcrumbItems = Array.isArray(slug)
  ? [
      { label: 'Notes', to: '/notes' },
      ...slug.map((part, idx) => ({
        label: part,
        to: '/notes/' + slug.slice(0, idx + 1).join('/'),
      })),
    ]
  : [{ label: 'Notes', to: '/notes' }, { label: slug, to: '/notes/' + slug }];
</script>
