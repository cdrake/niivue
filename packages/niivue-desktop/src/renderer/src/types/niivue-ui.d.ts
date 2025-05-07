// src/types/niivue-ui.d.ts
import type { UIKRenderer, UIKFont } from '@niivue/uikrenderer'

declare module '@niivue/niivue' {
  interface Niivue {
    /** our runtime-patched renderer for all UIKit drawing */
    ui: UIKRenderer
    defaultFont: UIKFont
  }
}
