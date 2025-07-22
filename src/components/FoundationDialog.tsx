import { useState } from 'react'

interface Props {
  onSubmit: (length: number, width: number) => void
}

const FoundationDialog = ({ onSubmit }: Props) => {
  const [length, setLength] = useState(500)
  const [width, setWidth] = useState(300)

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div style={{
        background: '#fff',
        padding: 24,
        borderRadius: 8,
        minWidth: 300,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ marginTop: 0 }}>Розмір фундаменту</h2>
        <label>Довжина
          <input type='number' value={length} onChange={e => setLength(+e.target.value)} style={{ width: '100%' }} />
        </label>
        <br />
        <label>Ширина
          <input type='number' value={width} onChange={e => setWidth(+e.target.value)} style={{ width: '100%' }} />
        </label>
        <br />
        <button onClick={() => onSubmit(length, width)} style={{
          marginTop: 12,
          padding: '8px 12px',
          border: 'none',
          background: '#1976d2',
          color: '#fff',
          cursor: 'pointer',
          borderRadius: 4
        }}>Почати</button>
      </div>
    </div>
  )
}

export default FoundationDialog
