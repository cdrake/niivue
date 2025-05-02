// global.d.ts (make sure this file is included by your tsconfig)
export {}

declare global {
  interface ElectronAPI {
    // …other methods…
    getPreviewForFile(filePath: string): Promise<string | null>
  }

  interface Window {
    electronAPI: ElectronAPI
  }
}
