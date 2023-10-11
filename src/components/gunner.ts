import { join } from 'node:path'

import type { Canvas } from 'terminal-canvas'

import { baseDir } from '../util/base-dir'
import { center } from '../util/helper'
import { playSound } from '../util/sound-player'
import { Bullet } from './bullet'
import { Shape, type ShapeConfig } from './shape'

export class Gunner extends Shape {
  static readonly contents = {
    exploded: [
      [" ,' %  ", ' ;&+,! '],
      [' -,+$! ', ' +  ^~ '],
    ],
    normal: [' mAm ', 'MAZAM'],
  }
  static readonly soundFileShoot = join(baseDir, 'sounds', 'shoot.wav')

  readonly bullets: Bullet[] = []

  firingBullet = false

  constructor(canvas: Canvas, config: Pick<ShapeConfig, 'bgColor'>) {
    super(canvas, {
      ...config,
      contents: [Gunner.contents.normal],
      fgColor: '#EBDF64',
      height: 2,
      width: 5,
      x: 0,
      y: canvas.height - 4,
    })
  }

  explode(): void {
    this.setContents(Gunner.contents.exploded)
    this.draw({ blink: true })
  }

  reset(): void {
    super.reset()
    this.x = center(this.canvas.width, this.width)
  }

  shoot(collisionHandler?: (shape: Shape) => boolean): boolean {
    if (this.firingBullet) {
      return false
    }
    playSound(Gunner.soundFileShoot)
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
    this.bullets.forEach((bullet) => {
      bullet.stop()
    })
    this.erase()
  }
}
