import type { Canvas } from 'terminal-canvas'

import type { ShapeConfig, Stoppable } from '../types'
import { getMaxLength } from '../util/helper'
import { Shape } from './shape'

export type BulletDirection = 'down' | 'up'

export class Bullet extends Shape implements Stoppable {
  readonly direction: BulletDirection
  timer?: NodeJS.Timeout

  constructor(
    canvas: Canvas,
    direction: BulletDirection,
    config: Pick<ShapeConfig, 'bgColor' | 'fgColor' | 'x' | 'y'>,
  ) {
    const content = ['|']
    const width = getMaxLength(content)
    const height = content.length
    super(canvas, {
      ...config,
      height,
      width,
      contents: [content],
    })
    this.direction = direction
  }

  run(
    endListener: () => void,
    collisionHandler?: (shape: Shape) => boolean,
  ): void {
    super.draw()
    if (this.timer) {
      return
    }
    this.timer = setInterval(() => {
      this.erase()
      const moved = this.moveBy(0, this.direction === 'up' ? -1 : 1)
      if (!moved) {
        this.stop()
        endListener()
        return
      }
      if (collisionHandler) {
        const collides = collisionHandler(this)
        if (collides) {
          this.stop()
          endListener()
          return
        }
      }
      this.draw()
    }, 40)
  }

  stop(): void {
    clearInterval(this.timer)
    this.timer = undefined
    this.erase()
  }
}
