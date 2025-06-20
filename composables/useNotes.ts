import { computed } from "vue";
import { useFetch } from "#app";
import type { NotesApiResponse } from "~/types/notes";

export function useNotes(path: string) {
  const { data, pending, error, refresh } = useFetch<NotesApiResponse>(
    `/api/notes?dir=${encodeURIComponent(path)}`
  );
  const items = computed(() => data.value?.items || []);
  const isFolder = computed(() => data.value?.currentType === "folder");
  return { data, items, isFolder, pending, error, refresh };
}
