import { readFile } from 'fs/promises'
import { join } from 'path'
import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const { path } = getQuery(event)
  if (!path || typeof path !== 'string') {
    return { error: 'Chemin de note manquant' }
  }
  // Sécurise le chemin pour éviter les accès hors du dossier notes
  const safePath = path.replace(/\.\.|^\//g, '')
  const filePath = join(process.cwd(), 'notes', safePath)
  try {
    const content = await readFile(filePath, 'utf-8')
    return { content }
  } catch (e) {
    return { error: 'Note introuvable' }
  }
})
