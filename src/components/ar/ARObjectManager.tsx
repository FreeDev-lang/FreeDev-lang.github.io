import type { ARObject } from './types/ar.types'
import ARObjectComponent from './ARObject'

interface ARObjectManagerProps {
  objects: ARObject[]
  onObjectUpdate: (id: string, updates: Partial<ARObject>) => void
  onObjectSelect: (id: string | null) => void
  selectedObjectId: string | null
}

export default function ARObjectManager({
  objects,
  onObjectUpdate,
  onObjectSelect,
  selectedObjectId,
}: ARObjectManagerProps) {
  return (
    <>
      {objects.map((obj) => (
        <ARObjectComponent
          key={obj.id}
          arObject={obj}
          isSelected={selectedObjectId === obj.id}
          onSelect={() => onObjectSelect(obj.id)}
          onUpdate={(updates) => onObjectUpdate(obj.id, updates)}
        />
      ))}
    </>
  )
}

