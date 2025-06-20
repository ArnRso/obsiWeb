import { computed } from "vue";
import { useFetch } from "#app";
import type { NotesApiResponse } from "~/types/notes";

export function useNotes(path: string) {
  const { data, pending, error, refresh } = useFetch<NotesApiResponse>(
    `/api/notes?dir=${encodeURIComponent(path)}`,
    {
      key: `notes-${path}`,
      server: true,
      default: (): NotesApiResponse => ({ items: [], currentType: "notfound" }),
    }
  );

  const items = computed(() => (data.value as NotesApiResponse)?.items || []);
  const isFolder = computed(
    () => (data.value as NotesApiResponse)?.currentType === "folder"
  );

  return { data, items, isFolder, pending, error, refresh };
}
