// Service utilitaire pour les notes
export function noteLinkFromPath(path: string): string {
  return '/notes/' + path.split('/').map(encodeURIComponent).join('/')
}
