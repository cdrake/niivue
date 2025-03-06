import { app } from 'electron'
import ElectronStore from 'electron-store'
import { NVConfigOptions } from '@niivue/niivue'

// Define schema with both recentFiles and user preferences
interface StoreSchema {
  recentFiles: string[]
  preferences: Partial<NVConfigOptions>
}

// Extend ElectronStore and explicitly declare `get` and `set`
export class AppStore extends ElectronStore<StoreSchema> {
  constructor() {
    super({
      defaults: {
        recentFiles: [],
        preferences: {} // Start with empty preferences (defaults come from Niivue)
      }
    })
  }

  // Recent Files Methods
  getRecentFiles(): string[] {
    return super.get('recentFiles') ?? []
  }

  addRecentFile(filePath: string): void {
    let recentFiles = this.getRecentFiles()
    recentFiles = [filePath, ...recentFiles.filter((f) => f !== filePath)].slice(0, 10)
    super.set('recentFiles', recentFiles)
    app.addRecentDocument(filePath)
  }

  clearRecentFiles(): void {
    super.set('recentFiles', [])
  }

  // User Preferences Methods
  getPreferences(): Partial<NVConfigOptions> {
    return super.get('preferences') ?? {}
  }

  setPreference<K extends keyof NVConfigOptions>(key: K, value: NVConfigOptions[K]): void {
    const updatedPreferences = { ...this.getPreferences(), [key]: value }
    super.set('preferences', updatedPreferences)
  }

  resetPreferences(): void {
    super.set('preferences', {})
  }
}

// Export singleton instance
export const store = new AppStore()
