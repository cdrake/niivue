// main/process/loadFromFile.ts
import { readFile } from 'fs/promises'
import { store } from './appStore.js'
import { refreshMenu } from './menu.js'
import { cachePreview } from './previewCache.js'    // ← NEW

/** read a file and return it as a base64 string, _and_ cache its preview */
export const readFromFile = async (_: unknown, path: string): Promise<string> => {
  try {
    // load the raw .nvd
    const data = Buffer.from(await readFile(path))
    const base64 = data.toString('base64')

    // add to “recent” list
    store.addRecentFile(path)

    // ensure we have a fresh preview for the menu
    if (path.toLowerCase().endsWith('.nvd')) {
      await cachePreview(path)                        // ← ADDED
    }
    
    // rebuild the menu so the new thumbnail shows
    refreshMenu()

    return base64
  } catch (error) {
    console.error(error)
    return ''
  }
}

// keep your IPC handler thin – it already calls readFromFile, which now caches
export const loadFromFileHandler = (_: unknown, path: string): Promise<string> => {
  return readFromFile(undefined, path)
}
