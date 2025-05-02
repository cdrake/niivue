// main/process/previewCache.ts
import { promises as fs } from 'fs'
import { gunzipSync } from 'zlib'
import Store from 'electron-store'

interface PreviewEntry {
  dataURL:  string
  mtimeMs:  number
}

const previewStore = new Store<Record<string,PreviewEntry>>({
  name: 'preview-images',
})

/**
 * Read the .nvd file, decompress if needed, parse JSON,
 * grab previewImageDataURL, and cache it with its mtime.
 */
export async function cachePreview(filePath: string): Promise<void> {
  const stat = await fs.stat(filePath)
  const mtimeMs = stat.mtimeMs

  // if we already have this exact version, nothing to do
  const existing = previewStore.get(filePath)
  if (existing?.mtimeMs === mtimeMs) return

  // load raw file
  const buf = await fs.readFile(filePath)

  // try gun-zipping; if it fails, assume it wasn’t gzipped
  let jsonText: string
  try {
    const decompressed = gunzipSync(buf)
    jsonText = decompressed.toString('utf8')
  } catch {
    jsonText = buf.toString('utf8')
  }

  // parse and cache
  const doc = JSON.parse(jsonText)
  if (typeof doc.previewImageDataURL === 'string') {
    previewStore.set(filePath, {
      dataURL:  doc.previewImageDataURL,
      mtimeMs,
    })
  }
}

/**
 * Synchronous lookup for menu-building.
 */
export function getCachedPreview(filePath: string): PreviewEntry | undefined {
  return previewStore.get(filePath)
}

/** Force a reload next time */
export function invalidatePreview(filePath: string) {
  previewStore.delete(filePath)
}
