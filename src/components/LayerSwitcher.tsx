interface Props {
  current: number
  setLayer: (n: number) => void
}

const LayerSwitcher = ({ current, setLayer }: Props) => (
  <div style={{
    position: 'absolute',
    top: 16,
    left: 16,
    background: '#fff',
    border: '1px solid #ccc',
    borderRadius: 4,
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    zIndex: 10
  }}>
    <button disabled={current === 0} onClick={() => setLayer(current - 1)} style={{
      border: 'none',
      background: 'transparent',
      fontSize: 20,
      cursor: 'pointer'
    }}>←</button>
    <span style={{ fontSize: 14 }}>Шар {current + 1}</span>
    <button onClick={() => setLayer(current + 1)} style={{
      border: 'none',
      background: 'transparent',
      fontSize: 20,
      cursor: 'pointer'
    }}>→</button>
  </div>
)

export default LayerSwitcher
