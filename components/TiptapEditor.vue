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
const toast = useToast();
function createDebouncedSaveFnWithToast(filePath: string) {
  let toastId: string | number | undefined;
  return getDebouncedSaveFn(filePath, 1000, () => {
    if (toastId) toast.remove(toastId);
    const t = toast.add({
      title: "Note enregistrée",
      description: "La note a bien été sauvegardée.",
      color: "success",
      duration: 1200, // Toast disparaît plus vite (1,2s)
    });
    toastId = t.id;
  });
}
async function saveAndToast(html: string) {
  if (debouncedSave.value) debouncedSave.value(html);
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
    debouncedSave.value = createDebouncedSaveFnWithToast(newPath);
  }
);
onMounted(() => {
  debouncedSave.value = createDebouncedSaveFnWithToast(props.filePath);
  editor.value = new Editor({
    content: props.modelValue,
    extensions: [StarterKit],
    editable: props.editable ?? true,
    onUpdate: () => {
      const html = editor.value!.getHTML();
      emit("update:modelValue", html);
      saveAndToast(html);
    },
  });
});
onBeforeUnmount(() => {
  if (editor.value) editor.value.destroy();
});

defineExpose({ editor });
</script>
