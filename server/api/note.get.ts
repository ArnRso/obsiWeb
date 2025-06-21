import { readFile } from "fs/promises";
import { join } from "path";
import { defineEventHandler, getQuery } from "h3";

export default defineEventHandler(async (event) => {
  let { path } = getQuery(event);
  if (!path || typeof path !== "string") {
    return { error: "Chemin de note manquant" };
  }
  // Décoder le chemin pour gérer les espaces et caractères spéciaux
  path = decodeURIComponent(path);
  // Sécurise le chemin pour éviter les accès hors du dossier notes
  const safePath = path.replace(/\.{2}|^\//g, "");
  // Correction : lit dans notes à la racine
  const notesDir = join(process.cwd(), "notes");
  let filePath = join(notesDir, safePath);
  try {
    const content = await readFile(filePath, "utf-8");
    return { content };
  } catch {
    // Si le fichier n'est pas trouvé et que le chemin ne finit pas par .md, réessayer avec .md
    if (!safePath.endsWith(".md")) {
      try {
        filePath = join(notesDir, safePath + ".md");
        const content = await readFile(filePath, "utf-8");
        return { content };
      } catch {
        // Fichier avec extension .md également introuvable, on retourne l'erreur plus bas
      }
    }
    return { error: "Note introuvable" };
  }
});
