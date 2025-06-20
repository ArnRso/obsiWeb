import { promises as fs } from 'fs'
import path from 'path'
import { defineEventHandler, getQuery } from 'h3'
type Dirent = import('fs').Dirent;

function sortFilesAndFolders(list: Dirent[]): Dirent[] {
  return list.sort((a, b) => {
    if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

export default defineEventHandler(async (event) => {
  const { dir = '' } = getQuery(event)
  // On pointe vers content/notes au lieu de notes
  const notesDir = path.resolve(process.cwd(), 'content/notes')
  // Sécurise le chemin pour éviter les accès hors du dossier notes
  const safeDir = String(dir).replace(/\.\.|^\//g, '')
  const targetDir = path.join(notesDir, safeDir)

  const items: { name: string; type: 'file' | 'folder'; path: string }[] = []
  try {
    const list = sortFilesAndFolders(await fs.readdir(targetDir, { withFileTypes: true }) as unknown as Dirent[])
    for (const file of list) {
      if (file.name.startsWith('.')) continue // ignore fichiers cachés
      if (file.isDirectory()) {
        items.push({
          name: file.name,
          type: 'folder',
          path: path.relative(notesDir, path.join(targetDir, file.name))
        })
      } else if (file.name.endsWith('.md')) {
        items.push({
          name: file.name,
          type: 'file',
          path: path.relative(notesDir, path.join(targetDir, file.name))
        })
      }
    }
    return { items }
  } catch {
    return { items: [], error: 'Dossier introuvable' }
  }
})
