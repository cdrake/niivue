import { useEffect, useRef, useState, useContext } from 'react'
import { AppContext } from '../App'
import { loadDroppedFiles } from '../utils/dragAndDrop'

export function Viewer(): JSX.Element {
  const { volumes, meshes, setVolumes, setMeshes, nvRef } = useContext(AppContext)
  const nv = nvRef.current
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Drag & drop handlers.
  const handleDragOver = (e: React.DragEvent<HTMLCanvasElement> | DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLCanvasElement> | DragEvent): void => {
    if (!e.dataTransfer) {
      throw new Error('No dataTransfer object found on drag event object')
    }
    e.preventDefault()
    e.stopPropagation()
    nv.volumes = []
    nv.meshes = []
    nv.updateGLVolume()
    loadDroppedFiles(e, setVolumes, setMeshes, nv.gl)
  }

  // Attach canvas and register event listeners.
  useEffect(() => {
    if (canvasRef.current) {
      const nv = nvRef.current
      canvasRef.current.addEventListener('dragover', handleDragOver)
      canvasRef.current.addEventListener('drop', handleDrop)
      nv.attachToCanvas(canvasRef.current)
    }
  }, [])

  // Update scene when volumes change.
  useEffect(() => {
    if (volumes.length > 0 && canvasRef.current) {
      const nv = nvRef.current
      nv.volumes = []
      for (let i = 0; i < volumes.length; i++) {
        nv.addVolume(volumes[i])
      }
    }
  }, [volumes])

  // Update scene when meshes change.
  useEffect(() => {
    if (meshes.length > 0 && canvasRef.current) {
      const nv = nvRef.current
      nv.meshes = []
      for (let i = 0; i < meshes.length; i++) {
        nv.addMesh(meshes[i])
      }
    }
  }, [meshes])
  

  return (
    <div className="flex flex-col bg-black basis-2/3 h-full grow relative">
      {/* Toolbar: (can be expanded for more controls) */}
      <div className="flex flex-row h-12 bg-black"></div>
      {/* Canvas container: account for the toolbar height */}
      <div className="w-full h-[calc(100%-48px)]">
        <canvas
          className="outline-none"
          ref={canvasRef}
          width={800}
          height={600}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        ></canvas>
      </div>     
    </div>
  )
}
