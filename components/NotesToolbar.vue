<template>
  <div class="flex items-center gap-2 mb-2">
    <UButton
      v-if="isFolder"
      icon="i-lucide-folder-plus"
      color="primary"
      class="ml-4"
      @click="$emit('new-folder')"
      >Nouveau dossier</UButton
    >
    <UButton
      v-if="isFolder"
      icon="i-lucide-file-plus"
      color="primary"
      @click="$emit('new-file')"
      >Nouveau fichier</UButton
    >
    <UButton
      v-if="!isSelectionMode && isFolder"
      icon="i-lucide-move"
      color="primary"
      class="ml-4"
      @click="$emit('toggle-selection')"
      >Sélectionner</UButton
    >
    <template v-else-if="isFolder">
      <UButton
        color="primary"
        class="ml-4"
        :disabled="!selectedForDelete.length"
        @click="$emit('delete-selected')"
        >Supprimer la sélection</UButton
      >
      <UButton color="neutral" class="ml-2" @click="$emit('cancel-selection')"
        >Annuler la sélection</UButton
      >
    </template>
    <USwitch
      v-if="isFile && !isSelectionMode"
      label="Mode édition"
      checked-icon="i-lucide-pencil"
      unchecked-icon="i-lucide-eye"
      color="primary"
      class="ml-4"
      :model-value="isEditMode"
      @update:model-value="$emit('update:isEditMode', $event)"
    />
    <UButton
      v-if="isFile && canDelete && !isSelectionMode"
      icon="i-lucide-trash"
      color="error"
      class="ml-2"
      @click="$emit('delete-file')"
      >Supprimer</UButton
    >
    <span v-if="isFile && !isFolder" class="ml-4 text-gray-500"
      >Fichier sélectionné</span
    >
    <span v-if="isFolder && !isFile" class="ml-4 text-gray-500"
      >Dossier sélectionné</span
    >
  </div>
</template>
<script setup lang="ts">
defineProps<{
  isSelectionMode: boolean;
  selectedForDelete: string[];
  isFolder: boolean;
  isFile: boolean;
  isEditMode?: boolean;
  canDelete?: boolean;
}>();
defineEmits([
  "new-folder",
  "new-file",
  "toggle-selection",
  "delete-selected",
  "cancel-selection",
  "update:isEditMode",
  "delete-file",
]);
</script>
