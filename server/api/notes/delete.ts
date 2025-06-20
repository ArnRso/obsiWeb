import { rm, stat } from 'fs/promises'
import { join } from 'path'
import { defineEventHandler, readBody } from 'h3'
import type { DeleteNotePayload } from '~/types/notes'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as DeleteNotePayload
  if (!body || !body.path) {
    return { success: false, error: 'Paramètres manquants' }
  }
  // Sécurise le chemin pour éviter les accès hors du dossier notes
  const safePath = body.path.replace(/\.\.|^\//g, '')
  const baseDir = join(process.cwd(), 'content', 'notes')
  const absPath = join(baseDir, safePath)
  try {
    const stats = await stat(absPath)
    await rm(absPath, { recursive: stats.isDirectory(), force: true })
    return { success: true }
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'Erreur inconnue'
    return { success: false, error: errorMsg }
  }
})
