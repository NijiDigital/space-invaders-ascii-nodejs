export const mapIterate = <T>(
  length: number,
  iterator: (currentIndex: number) => T,
): T[] =>
  Array.from(Array(length)).map((__, currentIndex) => iterator(currentIndex))

export const eachIterate = <T>(
  length: number,
  iterator: (currentIndex: number) => T,
): void => {
  Array.from(Array(length)).forEach((__, currentIndex) => {
    iterator(currentIndex)
  })
}

export const reduceIterate = <T>(
  length: number,
  iterator: (previousValue: T, currentIndex: number) => T,
  initialValue: T,
): T =>
  Array.from(Array(length)).reduce(
    (previousValue: T, __, currentIndex) =>
      iterator(previousValue, currentIndex),
    initialValue,
  )

export const getMaxLength = (lines: string[]): number =>
  lines.reduce((maxLength, line) => Math.max(maxLength, line.length), 0)

export const centerText = (s: string, width: number): string => {
  const trimmed = s.trim()
  const contentLength = trimmed.length
  const padding = Math.round((width - contentLength) / 2)
  return trimmed.padStart(width - padding).padEnd(width)
}

export const center = (containerWidth: number, width = 0): number =>
  Math.round(containerWidth / 2 - width / 2)

export const alea = (max: number, min = 0): number =>
  Math.round(Math.random() * (max - min + 1) + min)

export const oneOf = <T>(array: T[]): T => array[alea(array.length)]!
