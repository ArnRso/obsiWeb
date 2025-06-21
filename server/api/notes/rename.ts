import type { RenameNotePayload, RenameNoteResponse } from "~/types/notes";
import { renameNoteOrFolder } from "~/services/noteService";

export default defineEventHandler(
  async (event): Promise<RenameNoteResponse> => {
    if (event.method !== "POST") {
      return { success: false, error: "Méthode non autorisée" };
    }
    const body = await readBody<RenameNotePayload>(event);
    if (!body.oldPath || !body.newName) {
      return { success: false, error: "Paramètres manquants" };
    }
    try {
      await renameNoteOrFolder(body.oldPath, body.newName);
      return { success: true };
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      return { success: false, error: error.message || "Erreur inconnue" };
    }
  }
);
