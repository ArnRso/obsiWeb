import { toValue } from "vue";
import type { MaybeRefOrGetter } from "vue";
import { noteLinkFromPath } from "~/services/noteService";
import type {
  CreateNotePayload,
  CreateNoteResponse,
  DeleteNotePayload,
  DeleteNoteResponse,
} from "~/types/notes";

export function useNoteActions(
  path: MaybeRefOrGetter<string>,
  refresh: () => Promise<void>
) {
  async function onNewFolder(name: string) {
    if (!name) return;
    const currentPath = toValue(path);
    const payload: CreateNotePayload = {
      type: "folder",
      path: currentPath ? currentPath + "/" + name : name,
    };
    await $fetch<CreateNoteResponse>("/api/notes/new", {
      method: "post",
      body: payload,
    });
    await refresh();
  }
  async function onNewFile(name: string) {
    if (!name) return;
    let fileName = name;
    if (!fileName.endsWith(".md")) fileName += ".md";
    const currentPath = toValue(path);
    const payload: CreateNotePayload = {
      type: "file",
      path: currentPath ? currentPath + "/" + fileName : fileName,
    };
    await $fetch<CreateNoteResponse>("/api/notes/new", {
      method: "post",
      body: payload,
    });
    await refresh();
  }
  async function onDelete(canDelete: boolean, isFolder: boolean) {
    if (!canDelete) return;
    if (
      !window.confirm(
        "Voulez-vous vraiment supprimer ce " +
          (isFolder ? "dossier" : "fichier") +
          " ?"
      )
    )
      return;
    const currentPath = toValue(path);
    const payload: DeleteNotePayload = { path: currentPath };
    const res = await $fetch<DeleteNoteResponse>("/api/notes/delete", {
      method: "post",
      body: payload,
    });
    if (res.success) {
      const parent = currentPath.split("/").slice(0, -1).join("/");
      await navigateTo(noteLinkFromPath(parent));
    } else {
      window.alert("Erreur lors de la suppression : " + (res.error || ""));
    }
  }
  async function onDeleteSelected(selectedForDelete: string[]) {
    if (!selectedForDelete.length) return;
    if (
      !window.confirm(
        "Supprimer définitivement " + selectedForDelete.length + " élément(s) ?"
      )
    )
      return;
    for (const p of selectedForDelete) {
      await $fetch<DeleteNotePayload>("/api/notes/delete", {
        method: "post",
        body: { path: p },
      });
    }
    await refresh();
  }
  return { onNewFolder, onNewFile, onDelete, onDeleteSelected };
}
