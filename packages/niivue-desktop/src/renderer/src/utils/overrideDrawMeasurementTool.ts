import { Niivue, SLICE_TYPE } from '@niivue/niivue'
import { vec3 } from 'gl-matrix'

// overwrite Niivue’s drawGraph with your UIKit version
Niivue.prototype.drawGraph = function () {
  console.log('drawGraph called')
  // bail if there’s nothing to plot
  console.log('this', this)
  console.log(this.graph.plotLTWH, this.graph.lines)
  // if (!this.graph.plotLTWH) return
  console.log('drawing graph')
  
  const graph = this.graph
  let axialTop = 0
    if (this.graph.autoSizeMultiplanar && this.opts.sliceType === SLICE_TYPE.MULTIPLANAR) {
      for (let i = 0; i < this.screenSlices.length; i++) {
        const axCorSag = this.screenSlices[i].axCorSag
        if (axCorSag === SLICE_TYPE.AXIAL) {
          axialTop = this.screenSlices[i].leftTopWidthHeight[1]
        }
        if (axCorSag !== SLICE_TYPE.SAGITTAL) {
          continue
        }
        const ltwh = this.screenSlices[i].leftTopWidthHeight.slice()
        if (ltwh[1] === axialTop) {
          graph.LTWH[0] = ltwh[0] + ltwh[2]
          graph.LTWH[1] = ltwh[1]
        } else {
          graph.LTWH[0] = ltwh[0]
          graph.LTWH[1] = ltwh[1] + ltwh[3]
        }
        graph.LTWH[2] = ltwh[2]
        graph.LTWH[3] = ltwh[2]
      }
    }
  const [x, y, w, h] = this.graph.LTWH
  // if(!graph.lines?.length) {
  //   return
  // }
  const vols: number[] = []
  for (let i = 0; i < graph.vols.length; i++) {
    const j = graph.vols[i]
    if (this.volumes[j] == null) {
      continue
    }
    const n = this.volumes[j].nFrame4D!
    if (n < 2) {
      continue
    }
    vols.push(j)
  }
  const maxVols = this.volumes[vols[0]].nFrame4D!
  this.graph.selectedColumn = this.volumes[vols[0]].frame4D
  graph.lines = []
  for (let i = 0; i < vols.length; i++) {
    graph.lines[i] = []
    const vox = this.frac2vox(this.scene.crosshairPos)
    const v = this.volumes[vols[i]]
    let n = v.nFrame4D
    n = Math.min(n!, maxVols)
    for (let j = 0; j < n; j++) {
      const val = v.getValue(vox[0], vox[1], vox[2], j)
      graph.lines[i].push(val)
    }
  }
  // pick the first time‐series (you could merge multiple series here too)
  const data = this.graph.lines![0]  
  console.log('data', data)
  // hand off rendering to your UIKRenderer
  this.ui.drawLineGraph({
    position:    [x, y],
    size:        [w, h],
    backgroundColor: this.opts.backColor  ?? [0, 1, 0, 0],
    lineColor:       [0, 0, 1, 1],
    axisColor:       [1, 1, 1, 1],
    data,
    font:        this.defaultFont,
    textColor:   this.opts.fontColor            ?? [1, 1, 1, 1],
    xLabel: 'volumes',
    yLabel: 'activation',
    textScale:       0.5,
    // you can also pass xLabel, yLabel, yRange, etc. if you like
  })
}


// patch drawMeasurementTool at runtime
Niivue.prototype.drawMeasurementTool = function(startXYendXY: number[]) {
  function extendTo(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    distance: number
  ): { origin: number[]; terminus: number[] } {
    const x = x0 - x1
    const y = y0 - y1
    if (x === 0 && y === 0) {
      return {
        origin: [x1 + distance, y1],
        terminus: [x1 + distance, y1]
      }
    }
    const c = Math.hypot(x, y)
    const dX = (distance * x) / c
    const dY = (distance * y) / c
    return {
      origin: [x0 + dX, y0 + dY],
      terminus: [x1 - dX, y1 - dY]
    }
  }

  const gl = this.gl
  gl.bindVertexArray(this.genericVAO)
  gl.depthFunc(gl.ALWAYS)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  let startFrac = this.canvasPos2frac([startXYendXY[0], startXYendXY[1]])
  let endFrac   = this.canvasPos2frac([startXYendXY[2], startXYendXY[3]])

  if (startFrac[0] >= 0 && endFrac[0] >= 0) {
    const startMm = this.frac2mm(startFrac)
    startFrac = vec3.fromValues(startMm[0], startMm[1], startMm[2])

    const endMm = this.frac2mm(endFrac)
    endFrac = vec3.fromValues(endMm[0],   endMm[1],   endMm[2])

    const v = vec3.create()
    vec3.sub(v, startFrac, endFrac)
    const lenMM = vec3.len(v)

    let decimals = lenMM > 99 ? 0 : lenMM > 9 ? 1 : 2

    this.ui.drawRuler({
      pointA:        [startXYendXY[0], startXYendXY[1]],
      pointB:        [startXYendXY[2], startXYendXY[3]],
      length:        lenMM,
      units:         'mm',
      font:          this.defaultFont,
      textColor:     this.opts.rulerColor,
      lineColor:     this.opts.rulerColor,
      lineThickness: this.opts.rulerWidth,
      offset:        100
    })
  }

  gl.bindVertexArray(this.unusedVAO)
}
