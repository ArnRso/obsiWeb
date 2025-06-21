import { toValue } from "vue";
import type { MaybeRefOrGetter } from "vue";
import { noteLinkFromPath } from "~/utils/noteLink";
import type {
  CreateNotePayload,
  CreateNoteResponse,
  DeleteNotePayload,
  DeleteNoteResponse,
  NoteItem,
} from "~/types/notes";
import type { FormSubmitEvent } from "@nuxt/ui";

export function useNoteActions(
  path: MaybeRefOrGetter<string>,
  refresh: () => Promise<void>,
  items?: () => NoteItem[],
  cancelSelectionMode?: () => void
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

  // Helpers pour la gestion des noms
  function getFileNameWithoutMd(name: string) {
    return name.endsWith(".md") ? name.slice(0, -3) : name;
  }
  function getFileNameWithMd(name: string) {
    return name.endsWith(".md") ? name : name + ".md";
  }
  function isValidFolderName(name: string) {
    return !name.includes(".");
  }

  // Logique de renommage (modale)
  const isRenameModalOpen = ref(false);
  const renameState = reactive({ name: "" });
  const renameTarget = ref<{ path: string; isFolder: boolean } | null>(null);

  function openRenameModal(itemPath: string) {
    if (!items) return;
    const item = items().find((i) => i.path === itemPath);
    if (!item) return;
    renameTarget.value = { path: item.path, isFolder: item.type === "folder" };
    if (item.type === "file") {
      renameState.name = getFileNameWithoutMd(item.name);
    } else {
      renameState.name = item.name;
    }
    isRenameModalOpen.value = true;
  }

  function closeRenameModal() {
    isRenameModalOpen.value = false;
    renameTarget.value = null;
    renameState.name = "";
  }

  async function onSubmitRename(_: FormSubmitEvent<{ name: string }>) {
    if (!renameTarget.value) return;
    const { path: oldPath, isFolder } = renameTarget.value;
    let newName = renameState.name.trim();
    if (!newName) return;
    if (!isFolder) {
      newName = getFileNameWithMd(newName);
    }
    if (isFolder && !isValidFolderName(newName)) {
      alert("Un dossier ne doit pas contenir de point.");
      return;
    }
    try {
      const res = await $fetch("/api/notes/rename", {
        method: "POST",
        body: { oldPath, newName, isFolder },
      });
      if (res.success) {
        await refresh();
        closeRenameModal();
        cancelSelectionMode && cancelSelectionMode();
      } else {
        alert(res.error || "Erreur lors du renommage");
      }
    } catch (e) {
      alert((e as Error).message || "Erreur lors du renommage");
    }
  }

  return {
    onNewFolder,
    onNewFile,
    onDelete,
    onDeleteSelected,
    getFileNameWithoutMd,
    getFileNameWithMd,
    isValidFolderName,
    // Pour la modale de renommage
    isRenameModalOpen,
    renameState,
    renameTarget,
    openRenameModal,
    closeRenameModal,
    onSubmitRename,
  };
}
