import { writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { defineEventHandler, readBody } from 'h3'

interface CreateNotePayload {
  type: 'file' | 'folder';
  path: string;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as CreateNotePayload
  if (!body || !body.type || !body.path) {
    return { success: false, error: 'Paramètres manquants' }
  }
  // Sécurise le chemin pour éviter les accès hors du dossier notes
  const safePath = body.path.replace(/\.\.|^\//g, '')
  const baseDir = join(process.cwd(), 'content', 'notes')
  const absPath = join(baseDir, safePath)
  try {
    if (body.type === 'folder') {
      await mkdir(absPath, { recursive: true })
    } else if (body.type === 'file') {
      await mkdir(dirname(absPath), { recursive: true })
      await writeFile(absPath, '', { flag: 'wx' }) // n'écrase pas si existe
    }
    return { success: true }
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'Erreur inconnue'
    return { success: false, error: errorMsg }
  }
})
