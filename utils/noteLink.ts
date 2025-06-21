// Utilitaire frontend pour générer un lien vers une note
export function noteLinkFromPath(path: string): string {
  return "/notes/" + path.split("/").map(encodeURIComponent).join("/");
}
