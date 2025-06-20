<template>
  <section>
    <UBreadcrumb :items="breadcrumbItems" class="mb-4" />
    <UCard class="mb-4">
      <NotesToolbar
        :is-selection-mode="isSelectionMode"
        :selected-for-delete="selectedItems"
        :is-folder="isFolder"
        :is-file="!isFolder && !!note"
        :is-edit-mode="isEditMode"
        :can-delete="!!canDelete"
        @new-folder="onNewFolder"
        @new-file="onNewFile"
        @toggle-selection="toggleSelectionMode"
        @delete-selected="() => onDeleteSelected(selectedItems)"
        @cancel-selection="cancelSelectionMode"
        @update:is-edit-mode="(val) => (isEditMode = val)"
        @delete-file="() => onDelete(!!canDelete, !!isFolder)"
      />
      <template v-if="!isFolder">
        <div class="flex items-center gap-4">
          <!-- USwitch et bouton Supprimer déplacés dans la toolbar -->
        </div>
      </template>
    </UCard>
    <UCard>
      <div v-if="pending">Chargement...</div>
      <div v-else-if="error">Erreur lors du chargement</div>
      <div v-else>
        <template v-if="isFolder">
          <NotesGrid
            :items="items"
            :is-selection-mode="isSelectionMode"
            :selected-for-delete="selectedItems"
            :on-note-item-click="onNoteItemClick"
          />
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
import { ref, watch, computed } from "vue";
import { noteLinkFromPath } from "~/services/noteService";
import { useNotes } from "~/composables/useNotes";
import { useNoteActions } from "~/composables/useNoteActions";
import NotesToolbar from "~/components/NotesToolbar.vue";
import NotesGrid from "~/components/NotesGrid.vue";
import type { NoteContent } from "~/types/notes";

const isEditMode = ref(false);
const noteContent = ref("");
const { slug } = useRoute().params;
const path = Array.isArray(slug) ? slug.join("/") : slug;

const { items, isFolder, pending, error, refresh } = useNotes(path);

const note = ref<NoteContent | null>(null);
async function fetchRawMarkdown(cleanPath: string): Promise<string> {
  try {
    const relativePath = cleanPath.replace(/^notes\//, "").replace(/^\//, "");
    const { data } = await useFetch(
      `/api/note?path=${encodeURIComponent(relativePath)}`
    );
    const val = data.value;
    if (
      val &&
      typeof val === "object" &&
      "content" in val &&
      typeof val.content === "string"
    ) {
      return val.content;
    }
    return "";
  } catch {
    return "";
  }
}

if (!isFolder.value) {
  const cleanPath = path.replace(/\.md$/, "");
  const filePath = cleanPath + ".md";
  const { data: noteData } = useAsyncData(
    `note-${cleanPath}`,
    () => queryCollection("content").path(`/notes/${cleanPath}`).first(),
    {}
  );
  watch(
    noteData,
    async (val) => {
      note.value = val as unknown as NoteContent;
      if (typeof val?.body === "string") {
        noteContent.value = val.body;
      } else if (
        val?.body &&
        typeof val.body === "object" &&
        (val.body as { value?: unknown }).value
      ) {
        noteContent.value = await fetchRawMarkdown(filePath);
      } else {
        noteContent.value = "";
      }
    },
    { immediate: true }
  );
}

const breadcrumbItems = Array.isArray(slug)
  ? [
      { label: "Notes", to: noteLinkFromPath("") },
      ...slug.map((part, idx, arr) => {
        const isLast = idx === arr.length - 1;
        const isFile = !isFolder.value && isLast;
        let segment = arr
          .slice(0, idx + 1)
          .map(encodeURIComponent)
          .join("/");
        if (isFile && !segment.endsWith(".md")) segment += ".md";
        return {
          label: part.replace(/\.md$/, ""),
          to: noteLinkFromPath(segment),
        };
      }),
    ]
  : [
      { label: "Notes", to: noteLinkFromPath("") },
      { label: slug, to: noteLinkFromPath(slug) },
    ];

const isSelectionMode = ref(false);
const selectedItems = ref<string[]>([]);
function toggleSelectionMode() {
  isSelectionMode.value = !isSelectionMode.value;
  if (!isSelectionMode.value) selectedItems.value = [];
}
function cancelSelectionMode() {
  isSelectionMode.value = false;
  selectedItems.value = [];
}
function onNoteItemClick(path: string) {
  if (isSelectionMode.value) {
    const idx = selectedItems.value.indexOf(path);
    if (idx === -1) selectedItems.value.push(path);
    else selectedItems.value.splice(idx, 1);
  } else {
    navigateTo(noteLinkFromPath(path));
  }
}
const canDelete = computed(() => path && path !== "" && path !== "index");

const { onNewFolder, onNewFile, onDelete, onDeleteSelected } = useNoteActions(
  path,
  refresh
);
</script>
