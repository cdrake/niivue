/// <reference types="vite/client" />
// src/env.d.ts
import type { electronAPI as ToolkitAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    /**
     * The default electronAPI from @electron-toolkit/preload,
     * plus your custom preview call.
     */
    electron: typeof ToolkitAPI & {
      getPreviewForFile(filePath: string): Promise<string | null>
    }
  }
}

// this file needs no exports, but TS wants at least one
export {}
