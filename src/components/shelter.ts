import type { Canvas } from 'terminal-canvas'

import type { Plan, Shapeable, ShapeConfig } from '../types'
import Constants from './constants'
import { Shape } from './shape'

export class Shelter implements Shapeable {
  readonly parts: Map<string, Shape>

  constructor(canvas: Canvas, config: Pick<ShapeConfig, 'bgColor' | 'x'>) {
    this.parts = new Map<string, Shape>()
    const content = ['/MMMMM\\', 'MMMMMMM', 'MMM MMM']
    Array.from(Array(Constants.shelter.height)).forEach((_heightItem, dy) => {
      const partY = Math.round(canvas.height - 10 + dy)
      Array.from(Array(Constants.shelter.width)).forEach((_widthItem, dx) => {
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
      })
    })
  }

  collidesWith(other: Plan): boolean {
    return Array.from(this.parts.keys()).reduce((collides, position) => {
      if (collides) {
        return true
      }
      const part = this.parts.get(position)
      if (typeof part !== 'undefined' && part.collidesWith(other)) {
        this.destroyPart(position)
        return true
      }
      return false
    }, false)
  }

  destroyPart(position: string): boolean {
    const part = this.getPart(position)
    if (part === null) {
      return false
    }
    part.erase()
    this.parts.delete(position)
    return true
  }

  draw(): void {
    Array.from(this.parts.values()).forEach((part) => {
      part.draw()
    })
  }

  erase(): void {
    Array.from(this.parts.values()).forEach((part) => {
      part.erase()
    })
  }

  getPart(position: string): Shape | null {
    return this.parts.get(position) ?? null
  }
}
