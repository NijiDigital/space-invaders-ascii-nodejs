import { stdout } from 'node:process'

import { Canvas } from 'terminal-canvas'

import { eachIterate, mapIterate } from './helper'

const { columns, rows } = stdout

export const screenWidth = columns
export const screenHeight = rows

export const createCanvas = (backgroundColor = '#000000'): Canvas => {
  const canvas = Canvas.create({
    height: screenHeight,
    width: screenWidth,
  })
  canvas.reset().hideCursor().background(backgroundColor)
  const blankLine = mapIterate(canvas.width, () => ' ').join('')
  eachIterate(canvas.height, (y) => {
    canvas.moveTo(0, y).write(blankLine)
  })
  canvas.flush()
  return canvas
}

export const resetCanvas = (canvas: Canvas): void => {
  canvas.reset().showCursor()
  canvas.restoreScreen()
}
