import { promises as fs } from "fs";
import path from "path";

// --- Partie Node.js (uniquement pour le backend/server) ---

const NOTES_ROOT = path.resolve(process.cwd(), "notes");

/**
 * Renomme un fichier ou dossier (à utiliser uniquement côté serveur)
 */
export async function renameNoteOrFolder(
  oldPath: string,
  newName: string
): Promise<void> {
  const absOldPath = path.join(NOTES_ROOT, oldPath);
  const parentDir = path.dirname(absOldPath);
  const absNewPath = path.join(parentDir, newName);
  try {
    await fs.access(absOldPath);
  } catch {
    throw new Error("Fichier ou dossier introuvable");
  }
  try {
    await fs.access(absNewPath);
    throw new Error("Un élément avec ce nom existe déjà");
  } catch {
    // absNewPath n'existe pas, c'est ce qu'on veut
  }
  await fs.rename(absOldPath, absNewPath);
}

// --- Partie utilitaire frontend (safe) ---

/**
 * Génère un lien vers une note (utilisable côté client)
 * (NE PAS importer ce fichier côté client, mais copier cette fonction dans un fichier dédié si besoin)
 */
export function noteLinkFromPath(path: string): string {
  return "/notes/" + path.split("/").map(encodeURIComponent).join("/");
}
