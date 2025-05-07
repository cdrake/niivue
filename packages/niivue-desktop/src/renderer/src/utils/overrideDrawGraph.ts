// src/utils/overrideDrawGraph.ts
import { fmriEvents, getColorForTrialType } from '../types/events'
import type { Niivue } from '@niivue/niivue'

export function overrideDrawGraph(nv: Niivue) {
  const original = nv.drawGraph.bind(nv)

  nv.drawGraph = () => {
    original()

    if (!nv.graph.plotLTWH || !fmriEvents.length) return
    const [x, y, w, h] = nv.graph.plotLTWH
    const numFrames = nv.graph.lines?.[0]?.length || 0
    if (numFrames === 0) return

    const TR = nv.volumes[0]?.hdr?.pixDims?.[4] ?? 1
    const scaleW = w / numFrames

    for (const ev of fmriEvents) {
      const startX = x + (ev.onset / TR) * scaleW
      const endX   = x + ((ev.onset + ev.duration) / TR) * scaleW
      nv.drawRect([startX, y, endX - startX, h], getColorForTrialType(ev.trial_type))
    }
  }
}
