<template>
  <div class="flex items-center gap-2 mb-2 flex-wrap">
    <!-- Boutons pour les dossiers -->
    <template v-if="isFolder">
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
        <UButton
          color="primary"
          class="ml-2"
          icon="i-lucide-edit"
          :disabled="selectedForDelete.length !== 1"
          @click="$emit('rename-selected', selectedForDelete[0])"
          >Renommer</UButton
        >
        <UButton color="neutral" class="ml-2" @click="$emit('cancel-selection')"
          >Annuler la sélection</UButton
        >
      </template>
    </template>

    <!-- Contrôles pour les fichiers -->
    <template v-if="isFile && !isSelectionMode">
      <USwitch
        label="Mode édition"
        checked-icon="i-lucide-pencil"
        unchecked-icon="i-lucide-eye"
        color="primary"
        class="ml-4"
        :model-value="isEditMode"
        @update:model-value="$emit('update:isEditMode', $event)"
      />

      <!-- Bouton supprimer (position fixe) -->
      <UButton
        v-if="canDelete"
        icon="i-lucide-trash"
        color="error"
        class="ml-2"
        @click="$emit('delete-file')"
      >
        Supprimer
      </UButton>

      <!-- Séparateur visuel -->
      <div v-if="isEditMode && editor" class="w-px h-6 bg-gray-300 mx-2" />

      <!-- Boutons d'édition Tiptap (seulement en mode édition) -->
      <template v-if="isEditMode && editor">
        <UDropdownMenu
          :items="headingItems"
          :ui="{ content: 'w-40' }"
          :content="{ align: 'start', side: 'bottom', sideOffset: 8 }"
        >
          <UButton
            title="Titre"
            color="neutral"
            variant="soft"
            size="sm"
            class="!px-2 !py-1"
            icon="i-lucide-heading"
          >
            Titre
          </UButton>
        </UDropdownMenu>

        <UDropdownMenu
          :items="listItems"
          :ui="{ content: 'w-40' }"
          :content="{ align: 'start', side: 'bottom', sideOffset: 8 }"
        >
          <UButton
            title="Liste"
            color="neutral"
            variant="soft"
            size="sm"
            class="!px-2 !py-1"
            icon="i-lucide-list"
          >
            Liste
          </UButton>
        </UDropdownMenu>

        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          text="Gras (Ctrl+B)"
        >
          <UButton
            :color="editor?.isActive('bold') ? 'primary' : 'neutral'"
            :variant="editor?.isActive('bold') ? 'solid' : 'soft'"
            size="sm"
            class="!px-2 !py-1"
            @click="() => editor?.chain().focus().toggleBold().run()"
          >
            <UIcon name="i-lucide-bold" />
          </UButton>
        </UTooltip>

        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          text="Italique (Ctrl+I)"
        >
          <UButton
            :color="editor?.isActive('italic') ? 'primary' : 'neutral'"
            :variant="editor?.isActive('italic') ? 'solid' : 'soft'"
            size="sm"
            class="!px-2 !py-1"
            @click="() => editor?.chain().focus().toggleItalic().run()"
          >
            <UIcon name="i-lucide-italic" />
          </UButton>
        </UTooltip>

        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          text="Barré"
        >
          <UButton
            :color="editor?.isActive('strike') ? 'primary' : 'neutral'"
            :variant="editor?.isActive('strike') ? 'solid' : 'soft'"
            size="sm"
            class="!px-2 !py-1"
            @click="() => editor?.chain().focus().toggleStrike().run()"
          >
            <UIcon name="i-lucide-strikethrough" />
          </UButton>
        </UTooltip>

        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          text="Citation"
        >
          <UButton
            :color="editor?.isActive('blockquote') ? 'primary' : 'neutral'"
            :variant="editor?.isActive('blockquote') ? 'solid' : 'soft'"
            size="sm"
            class="!px-2 !py-1"
            @click="() => editor?.chain().focus().toggleBlockquote().run()"
          >
            <UIcon name="i-lucide-quote" />
          </UButton>
        </UTooltip>

        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          text="Code"
        >
          <UButton
            :color="editor?.isActive('code') ? 'primary' : 'neutral'"
            :variant="editor?.isActive('code') ? 'solid' : 'soft'"
            size="sm"
            class="!px-2 !py-1"
            @click="() => editor?.chain().focus().toggleCode().run()"
          >
            <UIcon name="i-lucide-code" />
          </UButton>
        </UTooltip>

        <!-- Séparateur -->
        <div class="w-px h-6 bg-gray-300 mx-1" />

        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          text="Annuler"
        >
          <UButton
            color="neutral"
            variant="soft"
            size="sm"
            class="!px-2 !py-1"
            @click="() => editor?.chain().focus().undo().run()"
          >
            <UIcon name="i-lucide-undo" />
          </UButton>
        </UTooltip>

        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          text="Rétablir"
        >
          <UButton
            color="neutral"
            variant="soft"
            size="sm"
            class="!px-2 !py-1"
            @click="() => editor?.chain().focus().redo().run()"
          >
            <UIcon name="i-lucide-redo" />
          </UButton>
        </UTooltip>

        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          text="Paragraphe"
        >
          <UButton
            color="neutral"
            variant="soft"
            size="sm"
            class="!px-2 !py-1"
            @click="() => editor?.chain().focus().setParagraph().run()"
          >
            ¶
          </UButton>
        </UTooltip>

        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          text="Saut de ligne"
        >
          <UButton
            color="neutral"
            variant="soft"
            size="sm"
            class="!px-2 !py-1"
            @click="() => editor?.chain().focus().setHardBreak().run()"
          >
            ↵
          </UButton>
        </UTooltip>

        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          text="Effacer la mise en forme"
        >
          <UButton
            color="neutral"
            variant="soft"
            size="sm"
            class="!px-2 !py-1"
            @click="
              () => editor?.chain().focus().clearNodes().unsetAllMarks().run()
            "
          >
            <UIcon name="i-lucide-eraser" />
          </UButton>
        </UTooltip>
      </template>
    </template>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import type { Editor } from "@tiptap/vue-3";

const props = defineProps<{
  isSelectionMode: boolean;
  selectedForDelete: string[];
  isFolder: boolean;
  isFile: boolean;
  isEditMode?: boolean;
  canDelete?: boolean;
  editor?: Editor;
}>();

defineEmits([
  "new-folder",
  "new-file",
  "toggle-selection",
  "delete-selected",
  "cancel-selection",
  "update:isEditMode",
  "delete-file",
  "rename-selected",
]);

const headingItems = computed(() => [
  ...Array.from({ length: 6 }, (_, i) => {
    const level = (i + 1) as 1 | 2 | 3 | 4 | 5 | 6;
    return {
      label: `Titre ${level}`,
      icon: "i-lucide-heading",
      onSelect: () =>
        props.editor?.chain().focus().toggleHeading({ level }).run(),
      active: !!props.editor?.isActive("heading", { level }),
    };
  }),
]);

const listItems = computed(() => [
  {
    label: "Liste à puces",
    icon: "i-lucide-list",
    onSelect: () => props.editor?.chain().focus().toggleBulletList().run(),
    active: !!props.editor?.isActive("bulletList"),
  },
  {
    label: "Liste numérotée",
    icon: "i-lucide-list-ordered",
    onSelect: () => props.editor?.chain().focus().toggleOrderedList().run(),
    active: !!props.editor?.isActive("orderedList"),
  },
]);
</script>
