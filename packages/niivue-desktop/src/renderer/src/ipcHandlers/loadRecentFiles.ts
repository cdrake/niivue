import { NVImage, NVMesh, Niivue, NVDocument } from '@niivue/niivue'
import React from 'react'
import { MESH_EXTENSIONS } from '../../../common/extensions'
import { base64ToJson, decompressGzipBase64ToJson, isProbablyGzip } from '@renderer/utils/base64ToJSON'

const electron = window.electron

interface HandlerProps {
  nv:                      Niivue
  setVolumes:              React.Dispatch<React.SetStateAction<NVImage[]>>
  setMeshes:               React.Dispatch<React.SetStateAction<NVMesh[]>>
  setCurrentDocumentPath:  React.Dispatch<React.SetStateAction<string|undefined>>
}

export const registerLoadRecentFileHandler = ({
  nv,
  setVolumes,
  setMeshes,
  setCurrentDocumentPath
}: HandlerProps): void => {
  electron.ipcRenderer.on('loadRecentFile', async (_evt, filePath: string) => {
    const base64 = await electron.ipcRenderer.invoke('loadFromFile', filePath)
    const pathLower = filePath.toLowerCase()

    if (pathLower.endsWith('.nvd')) {
      // load .nvd
      const json = isProbablyGzip(base64)
        ? await decompressGzipBase64ToJson(base64)
        : base64ToJson(base64)
      if (!json) throw new Error('Invalid .nvd content')

      const doc = NVDocument.loadFromJSON(json)
      await nv.loadDocument(doc)

      if (nv.meshes.length > 0) setMeshes(nv.meshes)
      if (nv.volumes.length > 0) setVolumes(nv.volumes)

      // **NEW**: inform context what doc is loaded
      setCurrentDocumentPath(filePath)

    } else if (MESH_EXTENSIONS.some(ext => pathLower.endsWith(ext.toLowerCase()))) {
      // load mesh
      const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer
      const mesh = await NVMesh.loadFromFile({
        file: new File([arrayBuffer], filePath),
        gl:   nv.gl,
        name: filePath
      })
      setMeshes(prev => [...prev, mesh])

      // clear any document preview
      setCurrentDocumentPath(undefined)

    } else {
      // load volume
      const vol = await NVImage.loadFromBase64({
        base64,
        name:   filePath
      })
      setVolumes(prev => [...prev, vol])

      // clear any document preview
      setCurrentDocumentPath(undefined)
    }
  })
}
