const colorMap = new Map<string, string>()

const hashString = (s: string): number =>
  [...s].reduce((h, c) => (h << 5) - h + c.charCodeAt(0), 0) >>> 0

export const getColor = (len: number, width: number): string => {
  const key = `${len}x${width}`
  if (colorMap.has(key)) return colorMap.get(key)!
  const h = hashString(key) % 360
  const color = `hsl(${h},60%,70%)`
  colorMap.set(key, color)
  return color
}
