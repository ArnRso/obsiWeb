import { promises as fs } from "fs";
import path from "path";
import { defineEventHandler, getQuery } from "h3";
// Types pour le payload reçu et retourné
import type { NoteItem, NotesApiResponse, NotesQuery } from "../../types/notes";
// Ajout du type Dirent pour le typage
import type { Dirent } from "fs";

function sortFilesAndFolders(list: Dirent[]): Dirent[] {
  return list.sort((a, b) => {
    if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export default defineEventHandler(async (event): Promise<NotesApiResponse> => {
  let { dir = "" }: NotesQuery = getQuery(event);
  // Décoder le chemin pour gérer les espaces et caractères spéciaux
  dir = decodeURIComponent(dir);
  // On pointe vers notes à la racine
  const notesDir = path.resolve(process.cwd(), "notes");
  // Sécurise le chemin pour éviter les accès hors du dossier notes
  const safeDir = String(dir).replace(/\.{2}|^\//g, "");
  const targetDir = path.join(notesDir, safeDir);

  const items: NoteItem[] = [];
  let currentType: "file" | "folder" | "notfound" = "notfound";
  try {
    const stat = await fs.stat(targetDir);
    if (stat.isDirectory()) {
      currentType = "folder";
      const list = sortFilesAndFolders(
        (await fs.readdir(targetDir, {
          withFileTypes: true,
        })) as unknown as Dirent[]
      );
      for (const file of list) {
        if (file.name.startsWith(".")) continue; // ignore fichiers cachés
        if (file.isDirectory()) {
          items.push({
            name: file.name,
            type: "folder",
            path: path.relative(notesDir, path.join(targetDir, file.name)),
          });
        } else if (file.name.endsWith(".md")) {
          items.push({
            name: file.name,
            type: "file",
            path: path.relative(notesDir, path.join(targetDir, file.name)),
          });
        }
      }
    } else if (stat.isFile()) {
      currentType = "file";
      // Un fichier n'a pas d'items, mais on pourrait retourner des infos si besoin
    }
    return { items, currentType };
  } catch {
    return {
      items: [],
      currentType: "notfound",
      error: "Dossier ou fichier introuvable",
    };
  }
});
