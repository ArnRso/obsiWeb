<template>
  <section>
    <UBreadcrumb :items="breadcrumbItems" class="mb-4" />
    <UCard class="mb-4">
      <NotesToolbar
        :is-selection-mode="isSelectionMode"
        :selected-for-delete="selectedItems"
        :is-folder="isStableFolder && !pending"
        :is-file="isStableFile && !pending"
        :is-edit-mode="isEditMode"
        :can-delete="!!canDelete"
        @new-folder="() => openNewItemModal('folder')"
        @new-file="() => openNewItemModal('file')"
        @toggle-selection="toggleSelectionMode"
        @delete-selected="() => onDeleteSelected(selectedItems)"
        @cancel-selection="cancelSelectionMode"
        @update:is-edit-mode="(val) => (isEditMode = val)"
        @delete-file="() => onDelete(!!canDelete, !!isStableFolder)"
      />
      <template v-if="isStableFile && !pending">
        <div class="flex items-center gap-4">
          <!-- USwitch et bouton Supprimer déplacés dans la toolbar -->
        </div>
      </template>
    </UCard>
    <UCard>
      <div v-if="pending">Chargement...</div>
      <div v-else-if="error">Erreur lors du chargement</div>
      <div v-else-if="isStableFolder">
        <NotesGrid
          :items="items"
          :is-selection-mode="isSelectionMode"
          :selected-for-delete="selectedItems"
          :on-note-item-click="onNoteItemClick"
        />
      </div>
      <div v-else-if="isStableFile && note" class="prose max-w-none">
        <h2 class="text-lg font-bold mb-4">{{ note.title || path }}</h2>
        <ContentRenderer :value="note" />
      </div>
      <div v-else-if="isStableFile">Note ou dossier introuvable</div>
    </UCard>

    <!-- Modale pour création de fichier/dossier -->
    <UModal
      v-model:open="isModalOpen"
      :title="
        creationType === 'folder'
          ? 'Créer un dossier'
          : creationType === 'file'
            ? 'Créer un fichier'
            : 'Créer un nouvel élément'
      "
      description="Veuillez renseigner un nom pour le nouvel élément."
    >
      <template #body>
        <div class="p-4">
          <UForm :state="creationState" @submit="onSubmitCreate">
            <UFormField
              :label="
                creationType === 'folder'
                  ? 'Nom du dossier'
                  : creationType === 'file'
                    ? 'Nom du fichier'
                    : 'Nom'
              "
              name="name"
            >
              <UInput
                v-model="creationState.name"
                :placeholder="
                  creationType === 'folder'
                    ? 'Nom du dossier'
                    : creationType === 'file'
                      ? 'Nom du fichier (ex: note.md)'
                      : 'Nom'
                "
                class="w-full"
                autofocus
              />
            </UFormField>
            <div class="flex gap-2 mt-4 justify-end">
              <UButton
                label="Fermer"
                color="neutral"
                variant="outline"
                type="button"
                @click="closeNewItemModal"
              />
              <UButton
                :label="
                  creationType === 'folder'
                    ? 'Créer le dossier'
                    : creationType === 'file'
                      ? 'Créer le fichier'
                      : 'Créer'
                "
                color="primary"
                type="submit"
                :disabled="!creationState.name.trim()"
              />
            </div>
          </UForm>
        </div>
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import type { FormSubmitEvent } from "@nuxt/ui";
import { noteLinkFromPath } from "~/services/noteService";
import { useNotes } from "~/composables/useNotes";
import { useNoteActions } from "~/composables/useNoteActions";
import NotesToolbar from "~/components/NotesToolbar.vue";
import NotesGrid from "~/components/NotesGrid.vue";
import type { NoteContent } from "~/types/notes";

const isEditMode = ref(false);
const { slug } = useRoute().params;
const path = Array.isArray(slug) ? slug.join("/") : slug;

const { items, pending, error, refresh } = useNotes(path);

// Déterminer le type de contenu de façon stable
const contentType = useState(`content-type-${path}`, () => {
  // Logique déterministe basée sur le path uniquement
  if (path.endsWith(".md")) {
    return "file";
  }
  // Si le path ne contient pas d'extension, c'est probablement un dossier
  // Ou si c'est vide (racine), c'est un dossier
  if (!path || path === "" || !path.includes(".")) {
    return "folder";
  }
  // Par défaut, considérer comme un fichier si on a une extension
  return "file";
});

// État stable pour savoir si on affiche un fichier ou un dossier
const isStableFolder = computed(() => contentType.value === "folder");
const isStableFile = computed(() => contentType.value === "file");

// Charger les données de la note avec useAsyncData - seulement pour les fichiers
const cleanPath = path.replace(/\.md$/, "");
const { data: noteData } = await useAsyncData(
  `note-${cleanPath}`,
  async () => {
    // Ne charger que si c'est un fichier basé sur la logique stable
    if (contentType.value !== "file") return null;

    try {
      // Récupérer d'abord les métadonnées de la note
      const noteContent = await queryCollection("content")
        .path(`/notes/${cleanPath}`)
        .first();

      if (!noteContent) {
        // Si pas de contenu trouvé, essayer de récupérer le contenu brut directement
        try {
          const relativePath = cleanPath
            .replace(/^notes\//, "")
            .replace(/^\//, "");
          const rawContent = await $fetch(
            `/api/note?path=${encodeURIComponent(relativePath)}`
          );

          if (
            rawContent &&
            typeof rawContent === "object" &&
            "content" in rawContent &&
            typeof rawContent.content === "string"
          ) {
            return {
              title:
                relativePath.split("/").pop()?.replace(/\.md$/, "") ||
                "Note sans titre",
              body: rawContent.content,
              _path: `/notes/${cleanPath}`,
            };
          }
        } catch (error) {
          console.warn(
            "Erreur lors de la récupération du contenu brut:",
            error
          );
        }
        return null;
      }

      // Si le body n'est pas directement disponible, récupérer le contenu brut
      if (
        !noteContent.body ||
        (typeof noteContent.body === "object" &&
          noteContent.body &&
          "value" in noteContent.body)
      ) {
        try {
          const relativePath = cleanPath
            .replace(/^notes\//, "")
            .replace(/^\//, "");
          const rawContent = await $fetch(
            `/api/note?path=${encodeURIComponent(relativePath)}`
          );

          if (
            rawContent &&
            typeof rawContent === "object" &&
            "content" in rawContent &&
            typeof rawContent.content === "string"
          ) {
            // Remplacer le body par le contenu brut
            return {
              ...noteContent,
              body: rawContent.content,
            };
          }
        } catch (error) {
          console.warn(
            "Erreur lors de la récupération du contenu brut:",
            error
          );
        }
      }

      return noteContent;
    } catch {
      return null;
    }
  },
  {
    watch: [contentType],
    server: true,
  }
);

const note = computed(() => noteData.value as unknown as NoteContent | null);

// Utiliser useState pour garantir la cohérence serveur/client
const breadcrumbItems = useState(`breadcrumbs-${path}`, () => {
  if (Array.isArray(slug)) {
    return [
      { label: "Notes", to: "/notes/" },
      ...slug.map((part, idx, arr) => {
        const segment = arr.slice(0, idx + 1).join("/");
        return {
          label: part.replace(/\.md$/, ""),
          to: `/notes/${segment}`,
        };
      }),
    ];
  } else {
    return [
      { label: "Notes", to: "/notes/" },
      {
        label: slug.replace(/\.md$/, ""),
        to: `/notes/${slug}`,
      },
    ];
  }
});

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

const isModalOpen = ref(false);
const creationType = ref<"folder" | "file" | null>(null);
const creationState = reactive({ name: "" });

function openNewItemModal(type: "folder" | "file") {
  creationType.value = type;
  creationState.name = "";
  isModalOpen.value = true;
}
function closeNewItemModal() {
  isModalOpen.value = false;
  creationType.value = null;
  creationState.name = "";
}
function onSubmitCreate(event: FormSubmitEvent<{ name: string }>) {
  if (creationType.value === "folder") {
    onNewFolder(event.data.name);
  } else if (creationType.value === "file") {
    onNewFile(event.data.name);
  }
  closeNewItemModal();
}
</script>
