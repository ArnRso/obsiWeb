<template>
  <section>
    <UBreadcrumb :items="breadcrumbItems" class="mb-4" />
    <UCard class="mb-4">
      <template v-if="isFolder">
        <UButtonGroup size="md" class="mb-2">
          <UButton
            :color="viewMode === 'grid' ? 'primary' : 'neutral'"
            icon="i-lucide-grid"
            aria-label="Affichage en icônes"
            @click="viewMode = 'grid'"
          />
          <UButton
            :color="viewMode === 'list' ? 'primary' : 'neutral'"
            icon="i-lucide-list"
            aria-label="Affichage en liste"
            @click="viewMode = 'list'"
          />
          <UButton
            :color="viewMode === 'detail' ? 'primary' : 'neutral'"
            icon="i-lucide-align-left"
            aria-label="Affichage en détail"
            @click="viewMode = 'detail'"
          />
        </UButtonGroup>
      </template>
      <template v-else>
        Barre fichier
      </template>
    </UCard>
    <UCard>
      <div v-if="pending">Chargement...</div>
      <div v-else-if="error">Erreur lors du chargement</div>
      <div v-else>
        <template v-if="isFolder">
          <div v-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div v-for="item in items" :key="item.path" class="flex flex-col items-center cursor-pointer group">
              <NuxtLink
                v-if="item.type === 'folder'"
                :to="`/notes/${item.path.split('/').map(encodeURIComponent).join('/')}`"
                class="flex flex-col items-center w-full"
              >
                <UIcon name="lucide:folder" class="text-4xl mb-1 text-yellow-400 group-hover:scale-110 transition-transform" />
                <span class="truncate w-full text-center font-medium">{{ item.name }}</span>
              </NuxtLink>
              <NuxtLink
                v-else
                :to="`/notes/${item.path.split('/').map(encodeURIComponent).join('/')}`"
                class="flex flex-col items-center w-full"
              >
                <UIcon name="lucide:file-text" class="text-4xl mb-1 text-slate-500 group-hover:scale-110 transition-transform" />
                <span class="truncate w-full text-center">{{ item.name.replace(/\.md$/, '') }}</span>
              </NuxtLink>
            </div>
          </div>
          <div v-else-if="viewMode === 'list'">
            <ul>
              <li v-for="item in items" :key="item.path" class="flex items-center gap-2 py-2 border-b">
                <UIcon :name="item.type === 'folder' ? 'lucide:folder' : 'lucide:file-text'" class="text-xl" />
                <NuxtLink :to="`/notes/${item.path.split('/').map(encodeURIComponent).join('/')}`" class="flex-1">
                  {{ item.name.replace(/\.md$/, '') }}
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div v-else>
            <ul>
              <li v-for="item in items" :key="item.path" class="flex items-center gap-2 py-2 border-b">
                <UIcon :name="item.type === 'folder' ? 'lucide:folder' : 'lucide:file-text'" class="text-xl" />
                <NuxtLink :to="`/notes/${item.path.split('/').map(encodeURIComponent).join('/')}`" class="flex-1">
                  <div class="font-bold">{{ item.name.replace(/\.md$/, '') }}</div>
                  <div class="text-xs text-slate-500">Type : {{ item.type }}</div>
                  <div class="text-xs text-slate-400">Chemin : {{ item.path }}</div>
                </NuxtLink>
              </li>
            </ul>
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
import { useCookie } from '#app'
import { ref, watch } from 'vue'
const { slug } = useRoute().params
const path = Array.isArray(slug) ? slug.join('/') : slug

const { data, pending, error } = await useFetch(`/api/notes?dir=${encodeURIComponent(path)}`)
const items = data?.value?.items || []

const isFolder = items.length > 0
const viewModeCookie = useCookie<'grid' | 'list' | 'detail'>('folderViewMode', { default: () => 'grid' })
const viewMode = ref(viewModeCookie.value)
watch(viewMode, (val) => { viewModeCookie.value = val })
let note = null
if (!isFolder) {
  // On retire l'extension .md si présente
  const cleanPath = path.replace(/\.md$/, '')
  const { data: noteData } = await useAsyncData(
    `note-${cleanPath}`,
    () => queryCollection('content').path(`/notes/${cleanPath}`).first()
  )
  note = noteData.value
}

const breadcrumbItems = Array.isArray(slug)
  ? [
      { label: 'Notes', to: '/notes' },
      ...slug.map((part, idx, arr) => {
        // Ajoute .md uniquement au dernier segment si c'est un fichier
        const isLast = idx === arr.length - 1
        const isFile = !isFolder && isLast
        return {
          label: part.replace(/\.md$/, ''),
          to: '/notes/' + arr.slice(0, idx + 1).map(encodeURIComponent).join('/') + (isFile ? '.md' : '')
        }
      }),
    ]
  : [{ label: 'Notes', to: '/notes' }, { label: slug, to: '/notes/' + slug }];
</script>
