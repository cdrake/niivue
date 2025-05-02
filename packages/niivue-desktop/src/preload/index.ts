import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

if (process.contextIsolated) {
  try {
    // merge your new method into the existing electronAPI object:
    const api = {
      ...electronAPI,
      getPreviewForFile: (filePath: string): Promise<string | null> =>
        ipcRenderer.invoke('preview:get', filePath),
    }

    contextBridge.exposeInMainWorld('electron', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // fallback when not isolated
  // @ts-ignore
  window.electron = electronAPI
}
