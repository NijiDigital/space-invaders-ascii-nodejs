import type { Canvas } from 'terminal-canvas'

import type { Plan, Shapeable, ShapeConfig } from '../types'
import { eachIterate, getMaxLength, mapIterate } from '../util/helper'

export class Shape implements Shapeable {
  static checkPosition(
    canvas: Canvas,
    x: number,
    y: number,
    width: number,
    height: number,
  ): boolean {
    return (
      x > 2 &&
      x < canvas.width - width - 1 &&
      y > 2 &&
      y < canvas.height - height - 1
    )
  }

  static getContentChar(content: string[], dx: number, dy: number): string {
    return content[dy]?.charAt(dx) ?? ''
  }

  readonly canvas: Canvas
  readonly config: ShapeConfig

  bgColor?: string
  contents!: string[][]
  contentsIndex!: number
  fgColor?: string
  height!: number
  width!: number
  x!: number
  y!: number

  constructor(canvas: Canvas, config: ShapeConfig) {
    this.canvas = canvas
    this.config = config
    this.reset()
  }

  checkPosition(x: number, y: number): boolean {
    return Shape.checkPosition(this.canvas, x, y, this.width, this.height)
  }

  collidesWith(other: Plan): boolean {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.height + this.y > other.y
    )
  }

  draw(
    options: { blink?: boolean; flush?: boolean } = {
      blink: false,
      flush: true,
    },
  ): void {
    const { blink = false, flush = true } = options
    this.canvas.moveTo(this.x, this.y)
    if (this.bgColor) {
      this.canvas.background(this.bgColor)
    }
    if (this.fgColor) {
      this.canvas.foreground(this.fgColor)
    }
    this.canvas.bold(true)
    this.canvas.blink(blink)
    const content = this.contents[this.contentsIndex]!
    this.contentsIndex = (this.contentsIndex + 1) % this.contents.length
    content.forEach((line) => {
      this.canvas.write(line).left(this.width).down(1)
    })
    if (flush) {
      this.canvas.flush()
    }
  }

  erase(): void {
    this.canvas.moveTo(this.x, this.y)
    if (this.bgColor) {
      this.canvas.background(this.bgColor)
    }
    const blankLine = mapIterate(this.width, () => ' ').join('')
    eachIterate(this.height, () => {
      this.canvas.write(blankLine).left(this.width).down(1)
    })
    this.canvas.flush()
  }

  moveBy(dx: number, dy: number, checkPosition = true): boolean {
    const x = Math.round(this.x + dx)
    const y = Math.round(this.y + dy)
    const hasValidPosition = !checkPosition || this.checkPosition(x, y)
    if (hasValidPosition) {
      this.moveTo(x, y)
    }
    return hasValidPosition
  }

  moveTo(x: number, y: number): void {
    this.x = x
    this.y = y
  }

  reset(options?: Partial<ShapeConfig>): void {
    const config = { ...this.config, ...options }
    this.fgColor = config.fgColor
    this.bgColor = config.bgColor
    this.x = config.x
    this.y = config.y
    this.height = config.height
    this.width = config.width
    this.setContents(
      config.contents ?? [
        mapIterate(this.height, () =>
          mapIterate(this.width, () => '█').join(''),
        ),
      ],
    )
  }

  setContents(contents: string[][]): void {
    this.contents = contents
    this.width = contents.reduce(
      (maxLength, content) => Math.max(maxLength, getMaxLength(content)),
      Number.MIN_VALUE,
    )
    this.height = contents.reduce(
      (maxLength, content) => Math.max(maxLength, content.length),
      Number.MIN_VALUE,
    )
    this.contentsIndex = 0
  }
}
