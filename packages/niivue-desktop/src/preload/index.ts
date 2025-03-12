import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
// import { NVConfigOptions } from '@niivue/niivue'

// Extend the Electron API with correctly typed custom preference methods
// const customAPI = {
//   getPreferences: async (): Promise<Partial<NVConfigOptions>> => {
//     return await ipcRenderer.invoke('getPreferences')
//   },

//   setPreference: async <K extends keyof NVConfigOptions>(
//     key: K,
//     value: NVConfigOptions[K]
//   ): Promise<void> => {
//     await ipcRenderer.invoke('setPreference', key, value)
//   },

//   resetPreferences: async (): Promise<void> => {
//     await ipcRenderer.invoke('resetPreferences')
//   }
// }

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
}
