<template>
  <section>
    <UBreadcrumb :items="breadcrumbs" class="mb-4" />
    <UCard class="mb-4">
      <NotesToolbar
        :is-selection-mode="isSelectionMode"
        :selected-for-delete="selectedItems"
        :is-folder="isFolder && !pending"
        :is-file="isFile && !pending"
        :is-edit-mode="isEditMode"
        :can-delete="!!canDelete"
        :editor="tiptapEditorRef?.editor"
        @new-folder="() => openNewItemModal('folder')"
        @new-file="() => openNewItemModal('file')"
        @toggle-selection="toggleSelectionMode"
        @delete-selected="() => onDeleteSelected(selectedItems)"
        @cancel-selection="cancelSelectionMode"
        @update:is-edit-mode="(val) => (isEditMode = val)"
        @delete-file="() => onDelete(!!canDelete, !!isFolder)"
        @rename-selected="openRenameModal"
      />
      <template v-if="isFile && !pending">
        <div class="flex items-center gap-4">
          <!-- USwitch et bouton Supprimer déplacés dans la toolbar -->
        </div>
      </template>
    </UCard>
    <UCard>
      <div v-if="pending">Chargement...</div>
      <div v-else-if="error">Erreur lors du chargement</div>
      <div v-else-if="isFolder">
        <NotesGrid
          :items="items"
          :is-selection-mode="isSelectionMode"
          :selected-for-delete="selectedItems"
          :on-note-item-click="onNoteItemClick"
        />
      </div>
      <div v-else-if="isFile && note" class="prose max-w-none">
        <h2 class="text-lg font-bold mb-4">{{ note.title || path }}</h2>
        <client-only>
          <TiptapEditor
            ref="tiptapEditorRef"
            v-model="noteBodyHtml"
            :editable="isEditMode"
            :file-path="path"
          />
        </client-only>
      </div>
      <div v-else-if="isNotFound">Note ou dossier introuvable</div>
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

    <!-- Modale pour renommage de fichier/dossier -->
    <UModal
      v-model:open="isRenameModalOpen"
      title="Renommer"
      description="Modifier le nom de l'élément sélectionné."
    >
      <template #body>
        <div class="p-4">
          <UForm :state="renameState" @submit="onSubmitRename">
            <UFormField label="Nouveau nom" name="name">
              <UInput v-model="renameState.name" class="w-full" autofocus />
            </UFormField>
            <div class="flex gap-2 mt-4 justify-end">
              <UButton
                label="Annuler"
                color="neutral"
                variant="outline"
                type="button"
                @click="closeRenameModal"
              />
              <UButton
                label="Renommer"
                color="primary"
                type="submit"
                :disabled="!renameState.name.trim()"
              />
            </div>
          </UForm>
        </div>
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from "vue";
import type { FormSubmitEvent } from "@nuxt/ui";
import { noteLinkFromPath } from "~/utils/noteLink";
import { useNoteActions } from "~/composables/useNoteActions";
import { useContentResolver } from "~/composables/useContentResolver";
import NotesToolbar from "~/components/NotesToolbar.vue";
import NotesGrid from "~/components/NotesGrid.vue";
import TiptapEditor from "~/components/TiptapEditor.vue";

const isEditMode = ref(false);
const tiptapEditorRef = ref();
const { slug } = useRoute().params;

// Utiliser le nouveau composable pour résoudre le contenu
const {
  items,
  note,
  pending,
  error,
  isFile,
  isFolder,
  isNotFound,
  breadcrumbs,
  path,
  refresh,
} = useContentResolver(slug);

// Conversion du contenu de la note en string pour Tiptap
const noteBodyHtml = ref("");
watch(
  () => note.value?.body,
  (val) => {
    noteBodyHtml.value =
      typeof val === "string"
        ? val
        : typeof val?.value === "string"
          ? val.value
          : "";
  },
  { immediate: true }
);

// États pour la gestion de la sélection
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

function onNoteItemClick(itemPath: string) {
  if (isSelectionMode.value) {
    const idx = selectedItems.value.indexOf(itemPath);
    if (idx === -1) selectedItems.value.push(itemPath);
    else selectedItems.value.splice(idx, 1);
  } else {
    navigateTo(noteLinkFromPath(itemPath));
  }
}

const canDelete = computed(
  () => path.value && path.value !== "" && path.value !== "index"
);

const {
  onNewFolder,
  onNewFile,
  onDelete,
  onDeleteSelected,
  isRenameModalOpen,
  renameState,
  openRenameModal,
  closeRenameModal,
  onSubmitRename,
} = useNoteActions(path, refresh, () => items.value, cancelSelectionMode);

// États pour la modale de création
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
