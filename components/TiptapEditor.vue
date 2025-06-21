<template>
  <editor-content :editor="editor" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { getDebouncedSaveFn } from "~/composables/useNoteActions";

const props = defineProps<{
  modelValue: string;
  editable?: boolean;
  filePath: string;
}>();
const emit = defineEmits<(e: "update:modelValue", value: string) => void>();

const editor = ref<Editor>();
const debouncedSave = ref<((html: string) => void) | null>(null);

function getDebouncedSaveFnLocal(filePath: string) {
  return getDebouncedSaveFn(filePath);
}

watch(
  () => props.modelValue,
  (value) => {
    if (editor.value && editor.value.getHTML() !== value) {
      editor.value.commands.setContent(value, false);
    }
  }
);

watch(
  () => props.editable,
  (value) => {
    if (editor.value) {
      editor.value.setEditable(value ?? true);
    }
  }
);

watch(
  () => props.filePath,
  (newPath) => {
    debouncedSave.value = getDebouncedSaveFnLocal(newPath);
  }
);

onMounted(() => {
  debouncedSave.value = getDebouncedSaveFnLocal(props.filePath);
  editor.value = new Editor({
    content: props.modelValue,
    extensions: [StarterKit],
    editable: props.editable ?? true,
    onUpdate: () => {
      const html = editor.value!.getHTML();
      emit("update:modelValue", html);
      if (debouncedSave.value) debouncedSave.value(html);
    },
  });
});

onBeforeUnmount(() => {
  if (editor.value) editor.value.destroy();
});
</script>
