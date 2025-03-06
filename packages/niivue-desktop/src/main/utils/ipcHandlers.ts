import { loadFromFileHandler } from './loadFromFile'
import { loadStandardHandler } from './loadStandard'
import { openMeshFileDialog } from './openMeshFileDialog'
import { store } from '../utils/appStore'
import { NVConfigOptions } from '@niivue/niivue'
import { ipcMain } from 'electron'

export const registerIpcHandlers = (): void => {
  ipcMain.handle('openMeshFileDialog', openMeshFileDialog)
  ipcMain.handle('loadFromFile', loadFromFileHandler)
  ipcMain.handle('loadStandard', loadStandardHandler)
  ipcMain.handle('getPreferences', () => {
    return store.getPreferences()
  })

  ipcMain.handle(
    'setPreference',
    (_event, key: keyof NVConfigOptions, value: NVConfigOptions[keyof NVConfigOptions]) => {
      store.setPreference(key, value)
    }
  )

  ipcMain.handle('resetPreferences', () => {
    store.resetPreferences()
  })
}
