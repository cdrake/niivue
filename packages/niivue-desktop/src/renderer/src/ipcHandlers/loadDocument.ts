import { Niivue, NVDocument, NVImage, NVMesh } from '@niivue/niivue'
import React from 'react'
import { base64ToJson, decompressGzipBase64ToJson, isProbablyGzip } from '@renderer/utils/base64ToJSON'

const electron = window.electron

interface HandlerProps {
  setVolumes: React.Dispatch<React.SetStateAction<NVImage[]>>
  setMeshes: React.Dispatch<React.SetStateAction<NVMesh[]>>
  nv: Niivue
  setCurrentDocumentPath:   React.Dispatch<React.SetStateAction<string|undefined>>
}

export const registerLoadDocumentHandler = ({ nv, setVolumes, setMeshes, setCurrentDocumentPath }: HandlerProps): void => {
  electron.ipcRenderer.on('loadDocument', async (_, filePath: string) => {
    const base64 = await electron.ipcRenderer.invoke('loadFromFile', filePath)

    const pathLower = filePath.toLowerCase()
    if (pathLower.endsWith('.nvd')) {
      let json: any
      if (isProbablyGzip(base64)) {
        json = await decompressGzipBase64ToJson(base64)
      }
      else {
        json = base64ToJson(base64)
        if (!json) throw new Error('Invalid .nvd content')
      }
      const doc = NVDocument.loadFromJSON(json)
      await nv.loadDocument(doc)

      if (nv.meshes.length > 0) {
        setMeshes(nv.meshes)
      }

      if (nv.volumes.length > 0) {
        setVolumes(nv.volumes)
      }
      setCurrentDocumentPath(filePath)
    }
  })
}
