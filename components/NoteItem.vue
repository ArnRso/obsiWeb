<template>
  <div
    class="flex flex-col items-center cursor-pointer group relative rounded-lg transition-all"
    :class="isSelected ? 'ring-2 ring-primary bg-primary/10' : ''"
    @click="$emit('click', item.path)"
  >
    <div class="flex flex-col items-center w-full">
      <UIcon :name="item.type === 'folder' ? 'lucide:folder' : 'lucide:file-text'" class="text-4xl mb-1" :class="item.type === 'folder' ? 'text-yellow-400' : 'text-slate-500'" />
      <span class="truncate w-full text-center font-medium">{{ item.name.replace(/\.md$/, '') }}</span>
      <div v-if="isSelected" class="absolute top-1 left-1 z-10 w-5 h-5 rounded-full border border-primary bg-white flex items-center justify-center pointer-events-none shadow">
        <UIcon name="lucide:check" class="text-primary text-lg" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['click'])
defineProps({
  item: { type: Object, required: true },
  isSelected: { type: Boolean, required: true }
})
</script>
