<template>
  <section>
    <UBreadcrumb :items="breadcrumbItems" class="mb-4" />
    <UCard class="mb-4">
      <template v-if="isFolder">
        <div class="flex items-center gap-2 mb-2">
          <UButtonGroup size="md">
            <UButton
              :color="viewMode === 'grid' ? 'primary' : 'neutral'"
              icon="i-lucide-grid"
              aria-label="Affichage en icônes"
              @click="viewMode = 'grid'"
            />
          </UButtonGroup>
          <UButton icon="i-lucide-folder-plus" color="primary" class="ml-4" @click="onNewFolder">Nouveau dossier</UButton>
          <UButton icon="i-lucide-file-plus" color="primary" @click="onNewFile">Nouveau fichier</UButton>
          <UButton v-if="!isSelectionMode" icon="i-lucide-move" color="primary" class="ml-4" @click="toggleSelectionMode">Sélectionner</UButton>
          <template v-else>
            <UButton color="primary" class="ml-4" :disabled="!selectedForDelete.length" @click="onDeleteSelected">Supprimer la sélection</UButton>
            <UButton color="neutral" class="ml-2" @click="cancelSelectionMode">Annuler la sélection</UButton>
          </template>
        </div>
      </template>
      <template v-else>
        <div class="flex items-center gap-4">
          <USwitch
            v-model="isEditMode"
            label="Mode édition"
            checked-icon="i-lucide-pencil"
            unchecked-icon="i-lucide-eye"
            color="primary"
          />
          <UButton v-if="canDelete" icon="i-lucide-trash" color="error" @click="onDelete">Supprimer</UButton>
        </div>
      </template>
    </UCard>
    <UCard>
      <div v-if="pending">Chargement...</div>
      <div v-else-if="error">Erreur lors du chargement</div>
      <div v-else>
        <template v-if="isFolder">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div
              v-for="item in items"
              :key="item.path"
              class="flex flex-col items-center cursor-pointer group relative rounded-lg transition-all"
              :class="isSelectionMode && selectedForDelete.includes(item.path) ? 'ring-2 ring-primary bg-primary/10' : ''"
            >
              <div
                class="flex flex-col items-center w-full"
                @click="isSelectionMode ? (toggleSelectItem(item.path), $event.preventDefault()) : undefined"
              >
                <NuxtLink
                  v-if="!isSelectionMode"
                  :to="`/notes/${item.path.split('/').map(encodeURIComponent).join('/')}`"
                  class="flex flex-col items-center w-full"
                >
                  <UIcon :name="item.type === 'folder' ? 'lucide:folder' : 'lucide:file-text'" class="text-4xl mb-1" :class="item.type === 'folder' ? 'text-yellow-400' : 'text-slate-500'" />
                  <span class="truncate w-full text-center font-medium">{{ item.name.replace(/\.md$/, '') }}</span>
                </NuxtLink>
                <template v-else>
                  <UIcon :name="item.type === 'folder' ? 'lucide:folder' : 'lucide:file-text'" class="text-4xl mb-1" :class="item.type === 'folder' ? 'text-yellow-400' : 'text-slate-500'" />
                  <span class="truncate w-full text-center font-medium">{{ item.name.replace(/\.md$/, '') }}</span>
                  <div v-if="selectedForDelete.includes(item.path)" class="absolute top-1 left-1 z-10 w-5 h-5 rounded-full border border-primary bg-white flex items-center justify-center pointer-events-none shadow">
                    <UIcon name="lucide:check" class="text-primary text-lg" />
                  </div>
                </template>
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="note">
          <div class="prose max-w-none">
            <h2 class="text-lg font-bold mb-4">{{ note.title || path }}</h2>
            <template v-if="isEditMode">
              <textarea v-model="noteContent" rows="16" class="w-full border rounded p-2 font-mono text-sm mb-2"/>
              <UButton color="primary" class="mt-2">Enregistrer</UButton>
            </template>
            <template v-else>
              <ContentRenderer :value="note" />
            </template>
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
import { ref, watch, computed } from 'vue'
import { useCookie } from '#app'
import type { CreateNotePayload, CreateNoteResponse, DeleteNotePayload, DeleteNoteResponse, NoteContent } from '~/types/notes'
const isEditMode = ref(false)
const noteContent = ref('')
const { slug } = useRoute().params
const path = Array.isArray(slug) ? slug.join('/') : slug

// Remplace la déclaration de useFetch pour récupérer refresh
const { data, pending, error, refresh } = useFetch(`/api/notes?dir=${encodeURIComponent(path)}`)
const items = computed(() => data.value?.items || [])

const isFolder = computed(() => Array.isArray(data.value?.items))
const viewModeCookie = useCookie<'grid' | 'list' | 'detail'>('folderViewMode', { default: () => 'grid' })
const viewMode = ref(viewModeCookie.value)
watch(viewMode, (val) => { viewModeCookie.value = val })

const note = ref<NoteContent | null>(null);
async function fetchRawMarkdown(cleanPath: string): Promise<string> {
  try {
    // cleanPath doit être relatif à content/notes, sans /notes/ devant
    const relativePath = cleanPath.replace(/^notes\//, '').replace(/^\//, '')
    const { data } = await useFetch(`/api/note?path=${encodeURIComponent(relativePath)}`)
    const val = data.value
    if (val && typeof val === 'object' && 'content' in val && typeof val.content === 'string') {
      return val.content
    }
    return ''
  } catch {
    return ''
  }
}

if (!isFolder.value) {
  // On retire l'extension .md si présente
  const cleanPath = path.replace(/\.md$/, '')
  // cleanPath est du type 'bienvenue' ou 'projets/alpha'
  const filePath = cleanPath + '.md'
  const { data: noteData } = await useAsyncData(
    `note-${cleanPath}`,
    () => queryCollection('content').path(`/notes/${cleanPath}`).first()
  );
  watch(noteData, async (val) => {
    note.value = val as unknown as NoteContent;
    console.log('note structure', note.value);
    if (typeof val?.body === 'string') {
      noteContent.value = val.body;
    } else if (val?.body && typeof val.body === 'object' && (val.body as { value?: unknown }).value) {
      // On tente de charger le markdown brut côté serveur
      noteContent.value = await fetchRawMarkdown(filePath)
    } else {
      noteContent.value = '';
    }
  }, { immediate: true });
}

// Types pour la création de fichier/dossier

const breadcrumbItems = Array.isArray(slug)
  ? [
      { label: 'Notes', to: '/notes' },
      ...slug.map((part, idx, arr) => {
        const isLast = idx === arr.length - 1
        const isFile = !isFolder.value && isLast
        let segment = arr.slice(0, idx + 1).map(encodeURIComponent).join('/')
        // Ajoute .md uniquement si c'est un fichier et que le segment ne finit pas déjà par .md
        if (isFile && !segment.endsWith('.md')) segment += '.md'
        return {
          label: part.replace(/\.md$/, ''),
          to: '/notes/' + segment
        }
      }),
    ]
  : [{ label: 'Notes', to: '/notes' }, { label: slug, to: '/notes/' + slug }];

async function onNewFolder() {
  const name = window.prompt('Nom du nouveau dossier ?')
  if (!name) return
  const payload: CreateNotePayload = { type: 'folder', path: path ? path + '/' + name : name }
  await $fetch<CreateNoteResponse>('/api/notes/new', { method: 'post', body: payload })
  await refresh()
}
async function onNewFile() {
  let name = window.prompt('Nom du nouveau fichier ? (sans extension)')
  if (!name) return
  if (!name.endsWith('.md')) name += '.md'
  const payload: CreateNotePayload = { type: 'file', path: path ? path + '/' + name : name }
  await $fetch<CreateNoteResponse>('/api/notes/new', { method: 'post', body: payload })
  await refresh()
}

// Type pour la suppression

const canDelete = computed(() => path && path !== '' && path !== 'index')

async function onDelete() {
  if (!canDelete.value) return
  if (!window.confirm('Voulez-vous vraiment supprimer ce ' + (isFolder.value ? 'dossier' : 'fichier') + ' ?')) return
  const payload: DeleteNotePayload = { path }
  const res = await $fetch<DeleteNoteResponse>('/api/notes/delete', { method: 'post', body: payload })
  if (res.success) {
    if (isFolder.value) {
      // Navigue au dossier parent
      const parent = path.split('/').slice(0, -1).join('/')
      await navigateTo('/notes/' + parent)
    } else {
      // Navigue au dossier parent après suppression d'un fichier
      const parent = path.split('/').slice(0, -1).join('/')
      await navigateTo('/notes/' + parent)
    }
  } else {
    window.alert('Erreur lors de la suppression : ' + (res.error || ''))
  }
}

const isSelectionMode = ref(false)
const selectedForDelete = ref<string[]>([])

function toggleSelectionMode() {
  isSelectionMode.value = !isSelectionMode.value
  if (!isSelectionMode.value) selectedForDelete.value = []
}
function toggleSelectItem(path: string) {
  const idx = selectedForDelete.value.indexOf(path)
  if (idx === -1) selectedForDelete.value.push(path)
  else selectedForDelete.value.splice(idx, 1)
}
function cancelSelectionMode() {
  isSelectionMode.value = false
  selectedForDelete.value = []
}
async function onDeleteSelected() {
  if (!selectedForDelete.value.length) return
  if (!window.confirm('Supprimer définitivement ' + selectedForDelete.value.length + ' élément(s) ?')) return
  for (const p of selectedForDelete.value) {
    await $fetch<DeleteNotePayload>('/api/notes/delete', { method: 'post', body: { path: p } })
  }
  isSelectionMode.value = false
  selectedForDelete.value = []
  await refresh()
}
</script>
