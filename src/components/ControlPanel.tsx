import { useState } from 'react'
import { Block } from '../types'
import { v4 as uuid } from 'uuid'

interface Props {
  onAdd: (blocks: Block[]) => void
  removeBlock: (block: Block) => void
  blocks: Block[]
  currentLayer: number
}

const ControlPanel = ({ onAdd, blocks, currentLayer, removeBlock }: Props) => {
  const [length, setLength] = useState(100)
  const [width, setWidth] = useState(50)
  const [height, setHeight] = useState(30)
  const [qty, setQty] = useState(1)

  const addBlocks = () => {
    const newBlocks: Block[] = Array.from({ length: qty }, () => ({
      id: uuid(),
      length,
      width,
      height,
      x: 0,
      y: 0,
      rotation: 0,
      layer: currentLayer,
      inStock: true
    }))
    onAdd(newBlocks)
  }

  return (
    <div style={{
      padding: 20,
      width: 300,
      boxSizing: 'border-box',
      background: '#ffffff',
      borderRight: '1px solid #e0e0e0',
      height: '100%',
      overflowY: 'auto'
    }}>
      <h2 style={{ marginTop: 0 }}>Новий блок</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        <label>Довжина
          <input type='number' value={length} onChange={e => setLength(+e.target.value)} style={{ width: '100%' }} />
        </label>
        <label>Ширина
          <input type='number' value={width} onChange={e => setWidth(+e.target.value)} style={{ width: '100%' }} />
        </label>
        <label>Висота
          <input type='number' value={height} onChange={e => setHeight(+e.target.value)} style={{ width: '100%' }} />
        </label>
        <label>Кількість
          <input type='number' value={qty} onChange={e => setQty(+e.target.value)} style={{ width: '100%' }} />
        </label>
        <button onClick={addBlocks} style={{
          padding: '8px 12px',
          border: 'none',
          background: '#1976d2',
          color: '#fff',
          cursor: 'pointer',
          borderRadius: 4
        }}>Додати</button>
      </div>

      <h3>Блоки ({blocks.length})</h3>
      <ul style={{ listStyle: 'none', padding: 0, maxHeight: 300, overflow: 'auto' }}>
        {blocks.map(b => (
          <li key={b.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 0',
            borderBottom: '1px dashed #ddd',
            fontSize: 14
          }}>
            <span>{b.length}×{b.width} ({b.inStock ? 'Інвертар' : `шар ${b.layer}`})</span>
            <span onClick={() => removeBlock(b)} style={{ color: 'red', cursor: 'pointer' }}>X</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ControlPanel
