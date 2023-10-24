import type { Canvas } from 'terminal-canvas'

import type { Plan, Shapeable, ShapeConfig } from '../types'
import Constants from './constants'
import { Shape } from './shape'

export class Shelter implements Shapeable {
  readonly parts: Map<string, Shape>

  constructor(canvas: Canvas, config: Pick<ShapeConfig, 'bgColor' | 'x'>) {
    this.parts = new Map<string, Shape>()
    const content = ['/MMMMM\\', 'MMMMMMM', 'MMM MMM']
    for (const [dy] of Array.from({
      length: Constants.shelter.height,
    }).entries()) {
      const partY = Math.round(canvas.height - 10 + dy)
      for (const [dx] of Array.from({
        length: Constants.shelter.width,
      }).entries()) {
        const partX = Math.round(config.x + dx)
        const part = new Shape(canvas, {
          bgColor: config.bgColor,
          contents: [[Shape.getContentChar(content, dx, dy)]],
          fgColor: Constants.shelter.color,
          height: 1,
          width: 1,
          x: partX,
          y: partY,
        })
        this.parts.set(`${partX},${partY}`, part)
      }
    }
  }

  collidesWith(other: Plan): boolean {
    for (const position of this.parts.keys()) {
      const part = this.parts.get(position)
      if (part !== undefined && part.collidesWith(other)) {
        this.destroyPart(position)
        return true
      }
    }
    return false
  }

  destroyPart(position: string): boolean {
    const part = this.getPart(position)
    if (part === undefined) {
      return false
    }
    part.erase()
    this.parts.delete(position)
    return true
  }

  draw(): void {
    for (const part of this.parts.values()) {
      part.draw()
    }
  }

  erase(): void {
    for (const part of this.parts.values()) {
      part.erase()
    }
  }

  getPart(position: string): Shape | undefined {
    return this.parts.get(position) ?? undefined
  }
}
