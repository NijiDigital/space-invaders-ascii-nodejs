import type { Canvas } from 'terminal-canvas'

import type { Explodable, ShapeConfig, Shooterable } from '../types'
import { center } from '../util/helper'
import { Bullet } from './bullet'
import { Shape } from './shape'

export class Alien extends Shape implements Shooterable, Explodable {
  static readonly colors = {
    alien1: '#62DE6D',
    alien2: '#42E9F4',
    alien3: '#DB55DD',
  }
  static readonly contents = {
    alien1: [
      [' {@@} ', ' /""\\ '],
      [' {@@} ', '  \\/  '],
    ],
    alien2: [
      [' dOOb ', ' ^/\\^ '],
      [' dOOb ', ' ~||~ '],
    ],
    alien3: [
      [' /MM\\ ', ' |~~| '],
      [' /MM\\ ', ' \\~~/ '],
    ],
    exploded: [
      [' \\||/ ', ' /||\\ '],
      ['', ''],
    ],
  }
  static readonly height = 2
  static readonly width = 6

  readonly bullets: Bullet[] = []
  readonly score: number

  constructor(
    canvas: Canvas,
    config: Pick<ShapeConfig, 'bgColor' | 'contents' | 'fgColor' | 'x' | 'y'>,
    score: number,
  ) {
    super(canvas, {
      ...config,
      height: Alien.height,
      width: Alien.width,
    })
    this.score = score
  }

  explode(): void {
    this.setContents(Alien.contents.exploded)
    this.draw({ blink: true })
  }

  shoot(collisionHandler?: (shape: Shape) => boolean): void {
    const bullet = new Bullet(this.canvas, 'down', {
      bgColor: this.bgColor,
      fgColor: '#FFFFFF',
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
    this.bullets.forEach((bullet) => {
      bullet.stop()
    })
    this.erase()
  }
}
