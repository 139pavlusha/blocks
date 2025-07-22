import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Block } from '../types'
import { getColor } from '../utils/colors'

interface Props {
  foundation: { length: number; width: number }
  blocks: Block[]
}

const calcCorner = (block: Block) => {
  if (block.rotation === 0) {
    return [block.x, block.height * block.layer, block.y]
  }
  if (block.rotation === 90) {
    return [block.x - block.width, block.height * block.layer, block.y]
  }
  if (block.rotation === 180) {
    return [block.x - block.length, block.height * block.layer, block.y - block.width]
  }
  return [block.x, block.height * block.layer, block.y - block.length]

}

const BlockMesh = ({ block }: { block: Block }) => {
  const { length: L, width: W, height: H, rotation } = block
  const color = getColor(L, W)

  // 2‑D (x,y) — ліво‑верхній кут
  const pivot = calcCorner(block)          //  y → Z         //  y → Z
  const [l, h, w] = [rotation % 180 == 0 ? L : W, H, rotation % 180 == 0 ? W : L]
  const cx = pivot[0] + l / 2
  const cz = pivot[1] - h / 2
  const cy = pivot[2] + w / 2

  return (
    <mesh position={[cx, cz, cy]}>
      <boxGeometry args={[l, h, w]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

const BlockScene3D = ({ foundation, blocks }: Props) => {
  const { length: fLen, width: fWid } = foundation

  return (
    <Canvas
      shadows
      camera={{
        position: [fLen * 1.1, Math.max(fLen, fWid) * 0.7, fWid * 1.1],
        fov: 45,
        near: 0.1,
        far: Math.max(fLen, fWid) * 4        // запас у 4× від найбільшої сторони
      }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 3, 4]} intensity={0.8} castShadow />

      {/* shift so that (0,0) in 2D maps to (‑fLen/2, 0, ‑fWid/2) */}
      <group position={[-fLen / 2, 0, -fWid / 2]}>
        {blocks.map(b => <BlockMesh key={b.id} block={b} />)}
      </group>

      <OrbitControls makeDefault />
      <Environment preset='sunset' />
    </Canvas>
  )
}

export default BlockScene3D
