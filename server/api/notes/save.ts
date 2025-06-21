import { writeFile } from "fs/promises";
import { join } from "path";
import { defineEventHandler, readBody } from "h3";
import type { SaveNotePayload, SaveNoteResponse } from "~/types/saveNote";

export default defineEventHandler(async (event): Promise<SaveNoteResponse> => {
  const body = (await readBody(event)) as SaveNotePayload;
  if (!body || !body.path || typeof body.markdown !== "string") {
    return { success: false, error: "Paramètres manquants" };
  }
  // Sécurise le chemin pour éviter les accès hors du dossier notes
  const safePath = body.path.replace(/\.{2}|^\//g, "");
  const notesDir = join(process.cwd(), "notes");
  const filePath = join(notesDir, safePath);
  try {
    await writeFile(filePath, body.markdown, "utf-8");
    return { success: true };
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Erreur inconnue";
    return { success: false, error: errorMsg };
  }
});
