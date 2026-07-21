export function col(index: number, columnCount: number): number {
  return ((index % columnCount) + columnCount) % columnCount
}

export function row(index: number, columnCount: number): number {
  if (columnCount === 0) return index
  return Math.floor(index / columnCount)
}

export function navigateDown(
  index: number,
  columnCount: number,
  itemCount: number,
): number | null {
  if (itemCount === 0) return null
  if (index < 0) return 0

  const c = col(index, columnCount)
  const r = row(index, columnCount)
  const rowsInCol = Math.ceil((itemCount - c) / columnCount)
  const nextRow = r + 1
  if (nextRow >= rowsInCol) return null
  return nextRow * columnCount + c
}

export function navigateUp(
  index: number,
  columnCount: number,
  itemCount: number,
): number | null {
  if (itemCount === 0) return null
  if (index < 0) return 0

  const c = col(index, columnCount)
  const r = row(index, columnCount)
  const prevRow = r - 1
  if (prevRow < 0) return null
  return prevRow * columnCount + c
}

export function navigateLeft(
  index: number,
  columnCount: number,
  itemCount: number,
): number | null {
  if (columnCount <= 1) return null
  if (index < 0) return 0
  if (index >= itemCount) return null

  const c = col(index, columnCount)
  if (c <= 0) return null

  const r = row(index, columnCount)
  const prevCol = c - 1
  const rowsInPrevCol = Math.ceil((itemCount - prevCol) / columnCount)
  return Math.min(r, rowsInPrevCol - 1) * columnCount + prevCol
}

export function navigateRight(
  index: number,
  columnCount: number,
  itemCount: number,
): number | null {
  if (columnCount <= 1) return null
  if (index < 0) return 0
  if (index >= itemCount) return null

  const c = col(index, columnCount)
  if (c >= columnCount - 1) return null

  const r = row(index, columnCount)
  const nextCol = c + 1
  const rowsInNextCol = Math.ceil((itemCount - nextCol) / columnCount)
  return Math.min(r, rowsInNextCol - 1) * columnCount + nextCol
}
