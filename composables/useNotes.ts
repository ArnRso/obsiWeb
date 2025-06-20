import { computed } from "vue";
import { useFetch } from "#app";

export function useNotes(path: string) {
  const { data, pending, error, refresh } = useFetch(
    `/api/notes?dir=${encodeURIComponent(path)}`
  );
  const items = computed(() => data.value?.items || []);
  const isFolder = computed(() => Array.isArray(data.value?.items));
  return { data, items, isFolder, pending, error, refresh };
}
