import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { VolumeImageCard } from './VolumeImageCard';
import { MeshImageCard } from './MeshImageCard';
import { NVMesh, NVImage } from '@niivue/niivue';
import { Text, ScrollArea } from '@radix-ui/themes';
import { SceneTabs } from './SceneTabs';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

const electron = window.electron

interface SidebarProps {
  onRemoveVolume:    (volume: NVImage)  => void;
  onRemoveMesh:      (mesh: NVMesh)      => void;
  onMoveVolumeUp:    (volume: NVImage)  => void;
  onMoveVolumeDown:  (volume: NVImage)  => void;
}

export function Sidebar({
  onRemoveMesh,
  onRemoveVolume,
  onMoveVolumeUp,
  onMoveVolumeDown
}: SidebarProps): JSX.Element {
  const { volumes, meshes, currentDocumentPath } = useContext(AppContext);

  // local state for the document preview
  const [previewDataUrl, setPreviewDataUrl] = useState<string|null>(null);

  useEffect(() => {
    console.log('Sidebar.useEffect; doc=', currentDocumentPath)
    if (!currentDocumentPath?.toLowerCase().endsWith('.nvd')) {
      setPreviewDataUrl(null)
      return
    }
  
    electron.getPreviewForFile(currentDocumentPath)
      .then(url => {
        console.log('  preview URL received:', url)
        setPreviewDataUrl(url)
      })
      .catch(err => {
        console.error('  preview-fetch failed:', err)
        setPreviewDataUrl(null)
      })
  }, [currentDocumentPath])
  

  // ordering logic for volumes…
  const [orderedVolumes, setOrderedVolumes] = useState<NVImage[]>([]);
  useEffect(() => { setOrderedVolumes(volumes) }, [volumes]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const src = result.source.index, dst = result.destination.index;
    if (src === dst) return;
    const vol = orderedVolumes[src], diff = dst - src;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) onMoveVolumeDown(vol);
    } else {
      for (let i = 0; i < -diff; i++) onMoveVolumeUp(vol);
    }
  };

  return (
    <div className="flex flex-col bg-gray-100 px-2 w-1/3 basis-1/3 min-w-[300px] max-w-[500px]">
      {/* — document preview — */}
      {previewDataUrl && (
        <div className="mb-4 p-2 text-center">
          <img
            src={previewDataUrl}
            alt="Document preview"
            className="preview-image mx-auto"
          />
          <Text size="1" weight="medium">
            {currentDocumentPath!.split(/[\\/]/).pop()}
          </Text>
        </div>
      )}

      {/* — layer list — */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <ScrollArea style={{ height: '50%', paddingRight: '10px', marginBottom: '12px' }}>
          <Text size="2" weight="bold">Layers</Text>
          <Droppable droppableId="volumesDroppable">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {orderedVolumes.map((volume, index) => (
                  <Draggable
                    key={volume.id ?? index.toString()}
                    draggableId={volume.id ?? index.toString()}
                    index={index}
                  >
                    {(prov, snap) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                        style={{
                          userSelect:    'none',
                          margin:        '0 0 8px 0',
                          background:    snap.isDragging ? '#f0f0f0' : 'white',
                          ...prov.draggableProps.style
                        }}
                      >
                        <VolumeImageCard
                          image={volume}
                          onRemoveVolume={onRemoveVolume}
                          onMoveVolumeUp={onMoveVolumeUp}
                          onMoveVolumeDown={onMoveVolumeDown}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {meshes.map((mesh, i) => (
            <MeshImageCard key={i} image={mesh} onRemoveMesh={onRemoveMesh} />
          ))}
        </ScrollArea>
      </DragDropContext>

      <SceneTabs />
    </div>
  );
}
