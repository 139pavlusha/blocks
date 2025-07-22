import { Block } from '../types'
import { Stage, Layer, Group, Rect, Text } from 'react-konva'
import { getColor } from '../utils/colors'

interface Props {
  stock: Block[]
  onDragStart: (b: Block) => void
}

const BlockPreview = ({ block }: { block: Block }) => (
  <>
    <Rect
      width={80}
      height={40}
      fill={getColor(block.length, block.width)}
      stroke='#333'
      strokeWidth={1}
    />
    <Text
      width={80}
      height={40}
      text={`${block.length}×${block.width}`}
      align='center'
      verticalAlign='middle'
      fontSize={14}
    />
  </>
)

const StockPanel = ({ stock, onDragStart }: Props) => {
  const itemSpacing = 20
  const maxHeight = 140

  return (
    <div style={{
      height: maxHeight + 20,
      borderTop: '1px solid #ccc',
      background: '#f9f9f9',
      padding: 10,
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      boxSizing: 'border-box'
    }}>
      <Stage width={stock.length * (100 + itemSpacing)} height={maxHeight}>
        <Layer>
          {stock.map((b, idx) => (
            <Group
              key={b.id}
              x={idx * (80 + itemSpacing)}
              y={10}
              draggable
              onDragStart={() => onDragStart(b)}
            >
              <BlockPreview block={b} />
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  )
}

export default StockPanel
