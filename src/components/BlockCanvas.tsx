import { Stage, Layer, Group, Rect, Text } from 'react-konva'
import { useRef, useState } from 'react'
import { Block } from '../types'
import { getColor } from '../utils/colors'

interface Props {
  blocks: Block[]
  foundation: { length: number; width: number }
  inventoryHeight: number
  onUpdate: (b: Block) => void
  onMoveToStock: (id: string) => void
}

const tolerance = 8

const BlockCanvas = ({ blocks, foundation, inventoryHeight, onUpdate, onMoveToStock }: Props) => {
  const stageRef = useRef<any>(null)
  const [scale, setScale] = useState(1)

  const stageWidth = window.innerWidth - 320
  const stageHeight = window.innerHeight

  const centerOffset = {
    x: (stageWidth - foundation.length) / 2,
    y: (stageHeight - inventoryHeight - foundation.width) / 2
  }

  const handleWheel = (e: any) => {
    e.evt.preventDefault()
    const scaleBy = 1.05
    const oldScale = scale
    const pointer = stageRef.current.getPointerPosition()
    const mousePointTo = {
      x: (pointer.x - stageRef.current.x()) / oldScale,
      y: (pointer.y - stageRef.current.y()) / oldScale
    }
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
    setScale(newScale)
    stageRef.current.scale({ x: newScale, y: newScale })
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale
    }
    stageRef.current.position(newPos)
    stageRef.current.batchDraw()
  }

  const snap = (block: Block): { x: number; y: number } => {
    const edgesX = [0, foundation.length]
    const edgesY = [0, foundation.width]
    blocks.filter(b => b.id !== block.id).forEach(b => {
      edgesX.push(b.x, b.x + b.length)
      edgesY.push(b.y, b.y + b.width)
    })
    let { x, y } = block
    edgesX.forEach(edge => {
      if (Math.abs(x - edge) <= tolerance) x = edge
      if (Math.abs(x + block.length - edge) <= tolerance) x = edge - block.length
    })
    edgesY.forEach(edge => {
      if (Math.abs(y - edge) <= tolerance) y = edge
      if (Math.abs(y + block.width - edge) <= tolerance) y = edge - block.width
    })
    // constrain inside foundation
    x = Math.max(0, Math.min(x, foundation.length - block.length))
    y = Math.max(0, Math.min(y, foundation.width - block.width))
    return { x, y }
  }

  const isInsideFoundation = (x: number, y: number, b: Block) =>
    x >= 0 && y >= 0 && x + b.length <= foundation.length && y + b.width <= foundation.width

  return (
    <Stage
      width={stageWidth}
      height={stageHeight - inventoryHeight}
      draggable
      ref={stageRef}
      onWheel={handleWheel}
      style={{ background: '#fafafa', cursor: 'grab' }}
    >
      <Layer x={centerOffset.x} y={centerOffset.y}>
        <Rect
          width={foundation.length}
          height={foundation.width}
          stroke='#888'
          strokeWidth={2}
          dash={[10, 5]}
        />

        {blocks.map(b => (
          <Group
            key={b.id}
            x={b.x}
            y={b.y}
            rotation={b.rotation}
            draggable
            onDragEnd={e => {
              const relX = e.target.x()
              const relY = e.target.y()
              // if released in lower inventory strip area (outside foundation region vertically)
              const globalY = centerOffset.y + relY + b.width / 2
              if (globalY > stageHeight - inventoryHeight) {
                onMoveToStock(b.id)
                return
              }

              if (isInsideFoundation(relX, relY, b)) {
                const snapped = snap({ ...b, x: relX, y: relY })
                onUpdate({ ...b, ...snapped })
              } else {
                // allow staying outside foundation (no snap)
                onUpdate({ ...b, x: relX, y: relY })
              }
            }}
            onDblClick={() => onUpdate({ ...b, rotation: (b.rotation + 90) % 360 })}
          >
            <Rect
              width={b.length}
              height={b.width}
              fill={getColor(b.length, b.width)}
              stroke='#333'
              strokeWidth={1}
            />
            <Text
              width={b.length}
              height={b.width}
              text={`${b.length}×${b.width}`}
              align='center'
              verticalAlign='middle'
              fontSize={14}
            />
          </Group>
        ))}
      </Layer>
    </Stage>
  )
}

export default BlockCanvas
