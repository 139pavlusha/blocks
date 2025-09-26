import { useEffect, useState } from 'react'
import ControlPanel from './components/ControlPanel'
import BlockCanvas from './components/BlockCanvas'
import LayerSwitcher from './components/LayerSwitcher'
import FoundationDialog from './components/FoundationDialog'
import StockPanel from './components/StockPanel'
import BlockScene3D from './components/BlockScene3D'
import { Block } from './types'
import { v4 as uuid } from 'uuid'

const INVENTORY_HEIGHT = 180

const randomOffset = () => Math.floor(Math.random() * 21) - 10 // [-10,10]

const mock = [
  [240, 40, 58, 37],
  [110, 40, 58, 3],
  [120, 40, 58, 3],
  [65, 40, 58, 1],

  [240, 30, 58, 8],
  [130, 30, 58, 2],
  [150, 30, 58, 1],
  [110, 30, 58, 1],
  [115, 30, 58, 1],

  [240, 50, 58, 20],
  [180, 50, 58, 5],
  [130, 50, 58, 1],
  [90, 50, 58, 3],
  [140, 50, 58, 1],
  [120, 50, 58, 48],
  [80, 50, 58, 1],
  [100, 50, 58, 1],
  [110, 50, 58, 1],

  [127, 47, 58, 1],
]

const LS_KEY = 'blocks‑planner'

const App = () => {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [currentLayer, setCurrentLayer] = useState(0)
  const [foundation, setFoundation] = useState<{ length: number; width: number } | null>({ length: 2130, width: 660 })
  const [view3D, setView3D] = useState(false)

  const addBlocks = (newBlocks: Block[]) => setBlocks([...blocks, ...newBlocks])
  const removeBlock = (block: Block) => setBlocks(s => s.filter(b => b.id !== block.id))

  useEffect(() => {
    const json = localStorage.getItem(LS_KEY)
    if (json) {
      try {
        const blocks = JSON.parse(json)
        setBlocks(blocks)
      } catch { }
      return
    }
    if (!blocks.length) {
      const blc: Block[] = []
      mock.forEach(m => {
        for (let i = 0; i < m[3]; i++)
          blc.push({
            id: uuid(),
            length: m[0],
            width: m[1],
            height: m[2],
            x: 0,
            y: 0,
            rotation: 0,
            layer: currentLayer,
            inStock: true
          })
      })
      setBlocks(blc)
    }
  }, [])

  useEffect(() => {

  }, [])

  const save = () =>
    localStorage.setItem(LS_KEY, JSON.stringify(blocks))

  const download = () => {
    const blob = new Blob([JSON.stringify(blocks)], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'blocks.txt'
    link.click()
  }

  const clear = () => {
    localStorage.removeItem(LS_KEY)
    window.location.reload()
  }

  const updateBlock = (b: Block) =>
    setBlocks(blocks.map(x => x.id === b.id ? b : x))

  const moveToStock = (id: string) =>
    setBlocks(blocks.map(b => b.id === id ? { ...b, inStock: true, x: 0, y: 0, layer: 0 } : b))

  const moveFromStock = (id: string) =>
    setBlocks(blocks.map(b => {
      if (b.id !== id) return b
      if (!foundation) return b
      const centerX = (foundation.length - b.length) / 2 + randomOffset()
      const centerY = (foundation.width - b.width) / 2 + randomOffset()
      return { ...b, inStock: false, layer: currentLayer, x: centerX, y: centerY }
    }))

  const stock = blocks.filter(b => b.inStock)
  const blocksOnLayer = blocks.filter(b => !b.inStock && b.layer === currentLayer)

  if (!foundation) return <FoundationDialog onSubmit={(l, w) => setFoundation({ length: l, width: w })} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <ControlPanel onAdd={addBlocks} blocks={blocks} removeBlock={removeBlock} currentLayer={currentLayer} />
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8, zIndex: 20 }}>
            <button style={{ padding: '6px 12px', border: 'none', borderRadius: 4, background: 'red', color: '#fff', cursor: 'pointer' }} onClick={clear}>Очистити</button>
            <button style={{ padding: '6px 12px', border: 'none', borderRadius: 4, background: '#1976d2', color: '#fff', cursor: 'pointer' }} onClick={download}>Скачати</button>
            <button style={{ padding: '6px 12px', border: 'none', borderRadius: 4, background: '#1976d2', color: '#fff', cursor: 'pointer' }} onClick={save}>Зберегти</button>
            <button style={{ padding: '6px 12px', border: 'none', borderRadius: 4, background: view3D ? '#d32f2f' : '#1976d2', color: '#fff', cursor: 'pointer' }} onClick={() => setView3D(!view3D)}>{view3D ? 'Back 2D' : 'View 3D'}</button>
          </div>
          {view3D
            ? <BlockScene3D foundation={foundation} blocks={blocks.filter(b => !b.inStock)} />
            : <>
              <LayerSwitcher current={currentLayer} setLayer={setCurrentLayer} />
              <BlockCanvas
                blocks={blocksOnLayer}
                foundation={foundation}
                inventoryHeight={INVENTORY_HEIGHT}
                onUpdate={updateBlock}
                onMoveToStock={moveToStock}
                removeBlock={removeBlock}
              />
            </>
          }
        </div>
      </div>
      <StockPanel
        stock={stock}
        onDragStart={b => moveFromStock(b.id)}
      />
    </div>
  )
}

export default App
