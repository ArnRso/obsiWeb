<template>
  <div class="flex items-center gap-2 mb-2">
    <UButtonGroup size="md">
      <UButton
        :color="viewMode === 'grid' ? 'primary' : 'neutral'"
        icon="i-lucide-grid"
        aria-label="Affichage en icônes"
        @click="$emit('update:view-mode', 'grid')"
      />
    </UButtonGroup>
    <UButton
      icon="i-lucide-folder-plus"
      color="primary"
      class="ml-4"
      @click="$emit('new-folder')"
      >Nouveau dossier</UButton
    >
    <UButton
      icon="i-lucide-file-plus"
      color="primary"
      @click="$emit('new-file')"
      >Nouveau fichier</UButton
    >
    <UButton
      v-if="!isSelectionMode"
      icon="i-lucide-move"
      color="primary"
      class="ml-4"
      @click="$emit('toggle-selection')"
      >Sélectionner</UButton
    >
    <template v-else>
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
  </div>
</template>
<script setup lang="ts">
defineProps<{
  viewMode: string;
  isSelectionMode: boolean;
  selectedForDelete: string[];
}>();
defineEmits([
  "update:view-mode",
  "new-folder",
  "new-file",
  "toggle-selection",
  "delete-selected",
  "cancel-selection",
]);
</script>
