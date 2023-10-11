import { join } from 'node:path'

import type { Canvas } from 'terminal-canvas'

import type { Plan, Shapeable } from '../types'
import { baseDir } from '../util/base-dir'
import { EXCEPTION_NAME } from '../util/exception-names'
import { alea, mapIterate, oneOf, reduceIterate } from '../util/helper'
import { playSound } from '../util/sound-player'
import { Alien } from './alien'
import type { ShapeConfig } from './shape'
import { Shape } from './shape'

export class Aliens implements Shapeable {
  static readonly alienContents = [
    Alien.contents.alien1,
    Alien.contents.alien2,
    Alien.contents.alien2,
    Alien.contents.alien3,
    Alien.contents.alien3,
  ]
  static readonly aliensColors = [
    Alien.colors.alien1,
    Alien.colors.alien2,
    Alien.colors.alien2,
    Alien.colors.alien3,
    Alien.colors.alien3,
  ]
  static readonly hMargin = 10
  static readonly noItemsPerLine = 11
  static readonly noLines = 5
  static readonly soundFileExplosion = join(baseDir, 'sounds', 'explosion.wav')
  static readonly soundFilesFastInvader = [
    'fastinvader1.wav',
    'fastinvader2.wav',
    'fastinvader3.wav',
    'fastinvader4.wav',
  ].map((filename) => join(baseDir, 'sounds', filename))

  readonly bgColor: string | undefined
  readonly canvas: Canvas
  readonly hSpace: number

  accelDuration = 20000
  accelTimer: NodeJS.Timeout | undefined
  dx!: -1 | 0 | 1
  dy!: 0 | 1
  items = new Set<Alien>()
  soundIndex = 0
  timer: NodeJS.Timeout | undefined
  timerDuration!: number

  constructor(canvas: Canvas, config: Pick<ShapeConfig, 'bgColor'>) {
    this.canvas = canvas
    this.hSpace = Math.round(
      (canvas.width - 2 * Aliens.hMargin) / Aliens.noItemsPerLine,
    )
    this.bgColor = config.bgColor
  }

  clearTimers(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = undefined
    }
    if (this.accelTimer) {
      clearInterval(this.accelTimer)
      this.accelTimer = undefined
    }
  }

  collidesWith(other: Plan): Alien | undefined {
    let collides = false
    for (const item of Array.from(this.items)) {
      collides = item.collidesWith(other)
      if (collides) {
        return item
      }
    }
    return undefined
  }

  createAlien(
    hMargin: number,
    hSpace: number,
    rowIndex: number,
    colIndex: number,
    bgColor: string | undefined,
  ): Alien {
    const x = Math.round(
      hMargin + colIndex * hSpace + hSpace / 2 - Alien.width / 2,
    )
    const y = Math.round(3 + rowIndex * (Alien.height + 1))
    const contents =
      Aliens.alienContents[rowIndex % Aliens.alienContents.length]!
    const fgColor = Aliens.aliensColors[rowIndex % Aliens.aliensColors.length]!
    const score = rowIndex === 0 ? 30 : rowIndex < 3 ? 20 : 10
    return new Alien(
      this.canvas,
      {
        bgColor,
        contents,
        fgColor,
        x,
        y,
      },
      score,
    )
  }

  createAliens(): void {
    this.items = new Set(
      reduceIterate<Alien[]>(
        Aliens.noLines,
        (items, rowIndex) => [
          ...items,
          ...mapIterate(Aliens.noItemsPerLine, (colIndex) =>
            this.createAlien(
              Aliens.hMargin,
              this.hSpace,
              rowIndex,
              colIndex,
              this.bgColor,
            ),
          ),
        ],
        [],
      ),
    )
  }

  deleteAlien(alien: Alien): void {
    this.items.delete(alien)
  }

  draw(): void {
    this.items.forEach((item) => {
      item.draw({ flush: false })
    })
    this.canvas.flush()
  }

  erase(): void {
    this.items.forEach((item) => {
      item.erase()
    })
  }

  getMaxX(): number {
    return [...this.items].reduce(
      (maxX, item) => Math.max(maxX, item.x),
      Number.MIN_VALUE,
    )
  }

  getMaxY(): number {
    return [...this.items].reduce(
      (maxY, item) => Math.max(maxY, item.y),
      Number.MIN_VALUE,
    )
  }

  getMinX(): number {
    return [...this.items].reduce(
      (minX, item) => Math.min(minX, item.x),
      Number.MAX_VALUE,
    )
  }

  getMinY(): number {
    return [...this.items].reduce(
      (minY, item) => Math.min(minY, item.y),
      Number.MAX_VALUE,
    )
  }

  handleBounds(): void {
    const [maxX, maxY, minX, minY] = [
      this.getMaxX(),
      this.getMaxY(),
      this.getMinX(),
      this.getMinY(),
    ]
    const hasValidPosition =
      Shape.checkPosition(this.canvas, minX, minY, Alien.width, Alien.height) &&
      Shape.checkPosition(this.canvas, maxX, maxY, Alien.width, Alien.height)
    if (!hasValidPosition) {
      if (maxY + Alien.height >= this.canvas.height - Alien.height - 1) {
        const error = new Error('Game Over! (You lose ^⁾')
        error.name = EXCEPTION_NAME.gameOver
        throw error
      }
      if (this.dy === 0) {
        this.dy = 1
      } else {
        this.dx = this.dx === 1 ? -1 : 1
        this.dy = 0
      }
    } else {
      this.dy = 0
    }
  }

  moveBy(dx: number, dy: number): boolean {
    return [...this.items].reduce(
      (moved, item) => moved && item.moveBy(dx, dy, false),
      true,
    )
  }

  reset(): void {
    this.timerDuration = 600
    this.dx = 1
    this.dy = 0
  }

  resetAccelTimer(): void {
    this.accelTimer = setInterval(() => {
      this.timerDuration = Math.round(this.timerDuration * 0.8)
    }, this.accelDuration)
  }

  run(collisionHandler?: (shape: Shape) => boolean): void {
    this.draw()
    this.reset()
    this.createAliens()
    this.resetAccelTimer()
    const nextTick = (): void => {
      this.timer = setTimeout(() => {
        try {
          this.tick(collisionHandler)
        } catch (err) {
          this.clearTimers()
          throw err
        }
        nextTick()
      }, this.timerDuration)
    }
    nextTick()
  }

  stop(): void {
    Array.from(this.items.values()).forEach((item) => {
      item.stop()
    })
    this.erase()
  }

  tick(collisionHandler?: (shape: Shape) => boolean): void {
    this.erase()
    this.handleBounds()
    const shooting = alea((4 * 600) / this.timerDuration) === 0
    const shootingCandidates = shooting && Array.from(this.items.values())
    this.moveBy(this.dy === 0 ? this.dx : 0, this.dy)
    this.draw()
    playSound(Aliens.soundFilesFastInvader[this.soundIndex]!)
    this.soundIndex =
      (this.soundIndex + 1) % Aliens.soundFilesFastInvader.length
    const shootingAlien = shootingCandidates && oneOf(shootingCandidates)
    if (shootingAlien) {
      shootingAlien.shoot(collisionHandler)
    }
  }
}
