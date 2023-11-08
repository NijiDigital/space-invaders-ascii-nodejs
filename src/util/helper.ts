import { join } from 'node:path'

import { baseDir } from './base-dir'

export const eachIterate = <T>(
  length: number,
  iterator: (currentIndex: number) => T,
): void => {
  for (const currentIndex of Array.from({ length }, (__, index) => index)) {
    iterator(currentIndex)
  }
}

export const alea = (max: number, min = 0): number =>
  Math.round(Math.random() * (max - min + 1) + min)

export const center = (containerWidth: number, width = 0): number =>
  Math.round(containerWidth / 2 - width / 2)

export const centerText = (s: string, width: number): string => {
  const trimmed = s.trim()
  const contentLength = trimmed.length
  const padding = Math.round((width - contentLength) / 2)
  return trimmed.padStart(width - padding).padEnd(width)
}

export const fromBaseDir = (
  ...filepaths: string[]
): ((filename: string) => string) => {
  const absolutePath = join(baseDir, ...filepaths)
  return (filename) => join(absolutePath, filename)
}

export const getMaxLength = (lines: string[]): number =>
  lines.reduce((maxLength, line) => Math.max(maxLength, line.length), 0)

export const mapIterate = <T>(
  length: number,
  iterator: (currentIndex: number) => T,
): T[] =>
  Array.from({ length }, (__, index) => index).map((__, currentIndex) =>
    iterator(currentIndex),
  )

export const oneOf = <T>(array: T[]): T => array[alea(array.length)]!

export const reduceIterate = <T>(
  length: number,
  iterator: (previousValue: T, currentIndex: number) => T,
  initialValue: T,
): T =>
  Array.from({ length }, (__, index) => index).reduce(
    (previousValue: T, __, currentIndex) =>
      iterator(previousValue, currentIndex),
    initialValue,
  )
