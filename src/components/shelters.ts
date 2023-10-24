import type { Canvas } from 'terminal-canvas'

import type { Plan, Shapeable, ShapeConfig } from '../types'
import { mapIterate } from '../util/helper'
import Constants from './constants'
import { Shelter } from './shelter'

export class Shelters implements Shapeable {
  readonly items: Shelter[] = []

  constructor(canvas: Canvas, config: Pick<ShapeConfig, 'bgColor'>) {
    const noItems = 4
    const hMargin = 10
    const hSpace = Math.round((canvas.width - 2 * hMargin) / noItems)
    this.items = mapIterate(noItems, (colIndex) => {
      const x = Math.round(
        hMargin + colIndex * hSpace + hSpace / 2 - Constants.shelter.width / 2,
      )
      return new Shelter(canvas, {
        x,
        bgColor: config.bgColor,
      })
    })
  }

  collidesWith(other: Plan): boolean {
    return this.items.reduce(
      (collides, item) => collides || item.collidesWith(other),
      false,
    )
  }

  draw(): void {
    for (const item of this.items) {
      item.draw()
    }
  }

  erase(): void {
    for (const item of this.items) {
      item.erase()
    }
  }
}
