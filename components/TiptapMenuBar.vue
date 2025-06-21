<template>
  <div class="tiptap-menubar flex gap-2 mb-2 items-start">
    <UDropdownMenu
      v-if="editor"
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
      v-if="editor"
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
    <UTooltip :content="{ align: 'center', side: 'top', sideOffset: 8 }" text="Gras (Ctrl+B)">
      <UButton
        v-if="!!editor"
        :color="editor?.isActive('bold') ? 'primary' : 'neutral'"
        :variant="editor?.isActive('bold') ? 'solid' : 'soft'"
        size="sm"
        class="!px-2 !py-1"
        @click="() => editor?.chain().focus().toggleBold().run()"
      >
        <UIcon name="i-lucide-bold" />
      </UButton>
    </UTooltip>
    <UTooltip :content="{ align: 'center', side: 'top', sideOffset: 8 }" text="Italique (Ctrl+I)">
      <UButton
        v-if="!!editor"
        :color="editor?.isActive('italic') ? 'primary' : 'neutral'"
        :variant="editor?.isActive('italic') ? 'solid' : 'soft'"
        size="sm"
        class="!px-2 !py-1"
        @click="() => editor?.chain().focus().toggleItalic().run()"
      >
        <UIcon name="i-lucide-italic" />
      </UButton>
    </UTooltip>
    <UTooltip :content="{ align: 'center', side: 'top', sideOffset: 8 }" text="Barré">
      <UButton
        v-if="!!editor"
        :color="editor?.isActive('strike') ? 'primary' : 'neutral'"
        :variant="editor?.isActive('strike') ? 'solid' : 'soft'"
        size="sm"
        class="!px-2 !py-1"
        @click="() => editor?.chain().focus().toggleStrike().run()"
      >
        <UIcon name="i-lucide-strikethrough" />
      </UButton>
    </UTooltip>
    <UTooltip :content="{ align: 'center', side: 'top', sideOffset: 8 }" text="Citation">
      <UButton
        v-if="!!editor"
        :color="editor?.isActive('blockquote') ? 'primary' : 'neutral'"
        :variant="editor?.isActive('blockquote') ? 'solid' : 'soft'"
        size="sm"
        class="!px-2 !py-1"
        @click="() => editor?.chain().focus().toggleBlockquote().run()"
      >
        <UIcon name="i-lucide-quote" />
      </UButton>
    </UTooltip>
    <UTooltip :content="{ align: 'center', side: 'top', sideOffset: 8 }" text="Code">
      <UButton
        v-if="!!editor"
        :color="editor?.isActive('code') ? 'primary' : 'neutral'"
        :variant="editor?.isActive('code') ? 'solid' : 'soft'"
        size="sm"
        class="!px-2 !py-1"
        @click="() => editor?.chain().focus().toggleCode().run()"
      >
        <UIcon name="i-lucide-code" />
      </UButton>
    </UTooltip>
    <UTooltip :content="{ align: 'center', side: 'top', sideOffset: 8 }" text="Annuler">
      <UButton
        v-if="!!editor"
        color="neutral"
        variant="soft"
        size="sm"
        class="!px-2 !py-1"
        @click="() => editor?.chain().focus().undo().run()"
      >
        <UIcon name="i-lucide-undo" />
      </UButton>
    </UTooltip>
    <UTooltip :content="{ align: 'center', side: 'top', sideOffset: 8 }" text="Rétablir">
      <UButton
        v-if="!!editor"
        color="neutral"
        variant="soft"
        size="sm"
        class="!px-2 !py-1"
        @click="() => editor?.chain().focus().redo().run()"
      >
        <UIcon name="i-lucide-redo" />
      </UButton>
    </UTooltip>
    <UTooltip :content="{ align: 'center', side: 'top', sideOffset: 8 }" text="Paragraphe">
      <UButton
        v-if="!!editor"
        color="neutral"
        variant="soft"
        size="sm"
        class="!px-2 !py-1"
        @click="() => editor?.chain().focus().setParagraph().run()"
      >
        ¶
      </UButton>
    </UTooltip>
    <UTooltip :content="{ align: 'center', side: 'top', sideOffset: 8 }" text="Saut de ligne">
      <UButton
        v-if="!!editor"
        color="neutral"
        variant="soft"
        size="sm"
        class="!px-2 !py-1"
        @click="() => editor?.chain().focus().setHardBreak().run()"
      >
        ↵
      </UButton>
    </UTooltip>
    <UTooltip :content="{ align: 'center', side: 'top', sideOffset: 8 }" text="Effacer la mise en forme">
      <UButton
        v-if="!!editor"
        color="neutral"
        variant="soft"
        size="sm"
        class="!px-2 !py-1"
        @click="() => editor?.chain().focus().clearNodes().unsetAllMarks().run()"
      >
        <UIcon name="i-lucide-eraser" />
      </UButton>
    </UTooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Editor } from "@tiptap/vue-3";
const props = defineProps<{ editor: Editor | undefined }>();

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
