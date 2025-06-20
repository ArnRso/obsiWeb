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
        <div class="flex items-center gap-4">
          <USwitch
            v-model="isEditMode"
            label="Mode édition"
            checked-icon="i-lucide-pencil"
            unchecked-icon="i-lucide-eye"
            color="primary"
          />
        </div>
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
import { ref, watch } from 'vue'
import { useCookie } from '#app'
const isEditMode = ref(false)
const noteContent = ref('')
const { slug } = useRoute().params
const path = Array.isArray(slug) ? slug.join('/') : slug

const { data, pending, error } = await useFetch(`/api/notes?dir=${encodeURIComponent(path)}`)
const items = data?.value?.items || []

const isFolder = items.length > 0
const viewModeCookie = useCookie<'grid' | 'list' | 'detail'>('folderViewMode', { default: () => 'grid' })
const viewMode = ref(viewModeCookie.value)
watch(viewMode, (val) => { viewModeCookie.value = val })

type MinimarkNode = [string, Record<string, unknown>, ...(string | MinimarkNode)[]];
type MinimarkAst = MinimarkNode[];


interface NoteContent {
  body?: { type: string; value: MinimarkAst; toc?: unknown } | string;
  title?: string;
  [key: string]: unknown;
}
let note: NoteContent | null = null;
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
if (!isFolder) {
  // On retire l'extension .md si présente
  const cleanPath = path.replace(/\.md$/, '')
  // cleanPath est du type 'bienvenue' ou 'projets/alpha'
  const filePath = cleanPath + '.md'
  const { data: noteData } = await useAsyncData(
    `note-${cleanPath}`,
    () => queryCollection('content').path(`/notes/${cleanPath}`).first()
  );
  note = noteData.value as unknown as NoteContent;
  console.log('note structure', note);
  watch(noteData, async (val) => {
    note = val as unknown as NoteContent;
    console.log('note structure', note);
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
