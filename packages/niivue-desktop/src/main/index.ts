import { app, shell, BrowserWindow, Menu } from 'electron'
import { join } from 'path'
import { registerIpcHandlers } from './utils/ipcHandlers.js'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { createMenu } from './utils/menu.js'

let mainWindow: BrowserWindow | null = null // Global variable to store the window instance

function createWindow(): void {
  // Create the browser window.
  try {
    console.log('Preload script running...')
    mainWindow = new BrowserWindow({
      width: 900,
      height: 670,
      show: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.mjs'),
        sandbox: false,
        contextIsolation: false,
        nodeIntegration: true
      }
    })

    mainWindow.on('ready-to-show', () => {
      const menu = createMenu(mainWindow!)
      Menu.setApplicationMenu(menu)
      mainWindow!.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    mainWindow.webContents.on('did-finish-load', () => {
      console.log('✅ Renderer process loaded successfully!')
    })

    mainWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
      console.error(`❌ Renderer failed to load: ${errorCode} - ${errorDescription}`)
    })

    mainWindow.webContents.once('dom-ready', () => {
      mainWindow!.webContents.openDevTools() // ✅ Opens DevTools automatically
    })

    mainWindow.webContents.on('render-process-gone', (_, details) => {
      console.error(`Renderer process crashed: ${details.reason}`, details)
    })

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error)
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      console.log('url', process.env['ELECTRON_RENDERER_URL'])
      mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      const path = join(__dirname, '../renderer/index.html')
      console.log('path', path)
      mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
  } catch (error) {
    console.error('Preload script error:', error)
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // register all IPC events at once
  registerIpcHandlers()

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  app.quit()
})

// Function to get the main window instance safely
export const getMainWindow = (): BrowserWindow | null => mainWindow
