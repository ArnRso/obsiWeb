<template>
  <section>
    <UBreadcrumb :items="breadcrumbItems" class="mb-4" />
    <UCard>
      <div v-if="pending">Chargement...</div>
      <div v-else-if="error">Erreur lors du chargement</div>
      <div v-else>
        <template v-if="isFolder">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div v-for="item in items" :key="item.path" class="flex flex-col items-center cursor-pointer group">
              <NuxtLink
                v-if="item.type === 'folder'"
                :to="`/notes/${encodeURIComponent(item.path)}`"
                class="flex flex-col items-center w-full"
              >
                <UIcon name="lucide:folder" class="text-4xl mb-1 text-yellow-400 group-hover:scale-110 transition-transform" />
                <span class="truncate w-full text-center font-medium">{{ item.name }}</span>
              </NuxtLink>
              <NuxtLink
                v-else
                :to="`/notes/${item.path.replace(/\.md$/, '').split('/').map(encodeURIComponent).join('/')}`"
                class="flex flex-col items-center w-full"
              >
                <UIcon name="lucide:file-text" class="text-4xl mb-1 text-slate-500 group-hover:scale-110 transition-transform" />
                <span class="truncate w-full text-center">{{ item.name.replace(/\.md$/, '') }}</span>
              </NuxtLink>
            </div>
          </div>
        </template>
        <template v-else-if="note">
          <div class="prose max-w-none">
            <h2 class="text-lg font-bold mb-4">{{ note.title || path }}</h2>
            <ContentRenderer :value="note" />
          </div>
        </template>
        <template v-else>
          <div>Note ou dossier introuvable</div>
        </template>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
const { slug } = useRoute().params
const path = Array.isArray(slug) ? slug.join('/') : slug

const { data, pending, error } = await useFetch(`/api/notes?dir=${encodeURIComponent(path)}`)
const items = data?.value?.items || []

// Si le dossier n'existe pas ou est vide, on tente de charger le fichier markdown
let isFolder = items.length > 0
let note = null
if (!isFolder) {
  // On tente de charger le fichier markdown
  const { data: noteData } = await useAsyncData(
    `note-${path}`,
    () => queryCollection('content').path(`/notes/${path}`).first()
  )
  note = noteData.value
}

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
