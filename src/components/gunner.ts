import type { Canvas } from 'terminal-canvas'

import type { Explodable, Resetable, ShapeConfig, Shooterable } from '../types'
import { center } from '../util/helper'
import { playSound } from '../util/sound-player'
import { Bullet } from './bullet'
import Constants from './constants'
import { Shape } from './shape'

export class Gunner
  extends Shape
  implements Shooterable, Explodable, Resetable
{
  readonly bullets: Bullet[] = []

  firingBullet = false

  constructor(canvas: Canvas, config: Pick<ShapeConfig, 'bgColor'>) {
    super(canvas, {
      ...config,
      contents: [Constants.gunner.contents.normal],
      fgColor: '#EBDF64',
      height: 2,
      width: 5,
      x: 0,
      y: canvas.height - 4,
    })
  }

  explode(): void {
    this.setContents(Constants.gunner.contents.exploded)
    this.draw(true)
  }

  reset(): void {
    super.reset()
    this.x = center(this.canvas.width, this.width)
  }

  shoot(collisionHandler?: (shape: Shape) => boolean): boolean {
    if (this.firingBullet) {
      return false
    }
    playSound(Constants.gunner.soundFileShoot)
    this.firingBullet = true
    const bullet = new Bullet(this.canvas, 'up', {
      bgColor: this.bgColor,
      fgColor: '#F83B3A',
      x: this.x + center(this.width),
      y: this.y - 1,
    })
    this.bullets.push(bullet)
    bullet.run(() => {
      const index = this.bullets.indexOf(bullet)
      this.bullets.splice(index, 1)
      this.firingBullet = false
    }, collisionHandler)
    return true
  }

  stop(): void {
    for (const bullet of this.bullets) {
      bullet.stop()
    }
    this.erase()
  }
}
