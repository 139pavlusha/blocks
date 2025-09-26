import { Stage, Layer, Group, Rect, Text } from 'react-konva'
import { useEffect, useRef, useState } from 'react'
import { Block } from '../types'
import { getColor } from '../utils/colors'
import { KonvaEventObject } from 'konva/lib/Node'

interface Props {
  blocks: Block[]
  foundation: { length: number; width: number }
  inventoryHeight: number
  onUpdate: (b: Block) => void
  onMoveToStock: (id: string) => void
  removeBlock: (b: Block) => void
}

const tolerance = 8

type CtxState = {
  visible: boolean
  x: number
  y: number
  block: Block | null
}

const ContextMenu = ({
  state,
  onClose,
  onRotate,
  onDelete
}: {
  state: CtxState
  onClose: () => void
  onRotate: () => void
  onDelete: () => void
}) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) onClose()
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [onClose])

  if (!state.visible) return null

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: state.y,
        left: state.x,
        zIndex: 1000,
        background: 'white',
        color: '#111',
        borderRadius: 8,
        boxShadow: '0 10px 30px rgba(0,0,0,.2)',
        padding: 6,
        minWidth: 120,
        userSelect: 'none',
        fontSize: 14
      }}
    >
      <div
        role='button'
        onClick={() => {
          onRotate()
          onClose()
        }}
        style={{ padding: '8px 10px', cursor: 'pointer' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,.06)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        Перевернути
      </div>
      <div
        role='button'
        onClick={() => {
          onDelete()
          onClose()
        }}
        style={{ padding: '8px 10px', cursor: 'pointer', color: 'red' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,.06)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        Видалити
      </div>
    </div>
  )
}

const BlockCanvas = ({ blocks, foundation, inventoryHeight, onUpdate, onMoveToStock, removeBlock }: Props) => {
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

  const [menu, setMenu] = useState<CtxState>({
    visible: false,
    x: 0,
    y: 0,
    block: null
  })

  const openMenu = (e: KonvaEventObject<PointerEvent>, block: Block) => {
    e.evt.preventDefault()
    setMenu({
      visible: true,
      x: e.evt.clientX,
      y: e.evt.clientY,
      block
    })
  }

  const closeMenu = () =>
    setMenu(m => ({ ...m, visible: false, targetId: null }))

  return (
    <>
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
              onContextMenu={e => openMenu(e, b)}
              onDragEnd={e => {
                const relX = e.target.x()
                const relY = e.target.y()
                // if released in lower inventory strip area (outside foundation region vertically)
                const globalY = centerOffset.y + relY + b.width / 2
                if (globalY > stageHeight - inventoryHeight + 80) {
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
      <ContextMenu
        state={menu}
        onClose={closeMenu}
        onRotate={() => menu.block && onUpdate({ ...menu.block, rotation: (menu.block.rotation + 90) % 360 })}
        onDelete={() => menu.block && removeBlock(menu.block)}
      />
    </>
  )
}

export default BlockCanvas
