import type { Canvas } from 'terminal-canvas'

import type { Explodable, ShapeConfig, Shooterable } from '../types'
import { center } from '../util/helper'
import { Bullet } from './bullet'
import Constants from './constants'
import { Shape } from './shape'

export class Alien extends Shape implements Shooterable, Explodable {
  readonly bullets: Bullet[] = []
  readonly score: number

  constructor(
    canvas: Canvas,
    config: Pick<ShapeConfig, 'bgColor' | 'contents' | 'fgColor' | 'x' | 'y'>,
    score: number,
  ) {
    super(canvas, {
      ...config,
      height: Constants.alien.height,
      width: Constants.alien.width,
    })
    this.score = score
  }

  explode(): void {
    this.setContents(Constants.alien.contents.exploded)
    this.draw(true)
  }

  shoot(collisionHandler?: (shape: Shape) => boolean): void {
    const bullet = new Bullet(this.canvas, 'down', {
      bgColor: this.bgColor,
      fgColor: Constants.bullet.color,
      x: this.x + center(this.width),
      y: this.y + this.height,
    })
    this.bullets.push(bullet)
    bullet.run(() => {
      const index = this.bullets.indexOf(bullet)
      this.bullets.splice(index, 1)
    }, collisionHandler)
  }

  stop(): void {
    for (const bullet of this.bullets) {
      bullet.stop()
    }
    this.erase()
  }
}
