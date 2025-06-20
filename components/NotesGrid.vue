<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
    <NoteItem
      v-for="item in items"
      :key="item.path"
      :item="item"
      :is-selected="isSelectionMode && selectedForDelete.includes(item.path)"
      @click="onNoteItemClick(item.path)"
    />
  </div>
</template>
<script setup lang="ts">
defineProps<{
  items: Array<{ path: string }>;
  isSelectionMode: boolean;
  selectedForDelete: string[];
  onNoteItemClick: (path: string) => void;
}>();
</script>
