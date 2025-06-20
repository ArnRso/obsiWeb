import { promises as fs } from 'fs'
import path from 'path'
type Dirent = import('fs').Dirent;

function sortFilesAndFolders(list: Dirent[]): Dirent[] {
  return list.sort((a, b) => {
    if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

export default defineEventHandler(async () => {
  // On pointe vers content/notes au lieu de notes
  const notesDir = path.resolve(process.cwd(), 'content/notes')

  async function getAllMarkdownFiles(dir: string): Promise<string[]> {
    let results: string[] = []
    const list = sortFilesAndFolders(await fs.readdir(dir, { withFileTypes: true }) as unknown as Dirent[])
    for (const file of list) {
      const filePath = path.join(dir, file.name)
      if (file.isDirectory()) {
        results = results.concat(await getAllMarkdownFiles(filePath))
      } else if (file.name.endsWith('.md')) {
        results.push(path.relative(notesDir, filePath))
      }
    }
    return results
  }

  const files = await getAllMarkdownFiles(notesDir)
  return { files }
})
