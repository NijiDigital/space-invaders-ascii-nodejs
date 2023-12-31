import type { EventEmitter } from 'node:events'
import { join } from 'node:path'

import type { Canvas } from 'terminal-canvas'

import type { Plan, Resetable, Shapeable, ShapeConfig } from '../types'
import { baseDir } from '../util/base-dir'
import {
  alea,
  fromBaseDir,
  mapIterate,
  oneOf,
  reduceIterate,
} from '../util/helper'
import { playSound } from '../util/sound-player'
import { Alien } from './alien'
import Constants from './constants'
import { GameEvent } from './game-event'
import { Shape } from './shape'

export class Aliens implements Shapeable, Resetable {
  static readonly alienContents = [
    Constants.alien.contents.alien1,
    Constants.alien.contents.alien2,
    Constants.alien.contents.alien2,
    Constants.alien.contents.alien3,
    Constants.alien.contents.alien3,
  ]
  static readonly aliensColors = [
    Constants.alien.colors.alien1,
    Constants.alien.colors.alien2,
    Constants.alien.colors.alien2,
    Constants.alien.colors.alien3,
    Constants.alien.colors.alien3,
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
  ].map(fromBaseDir('sounds'))

  static computeAlienScore(rowIndex: number): number {
    if (rowIndex === 0) {
      return 30
    }
    if (rowIndex < 3) {
      return 20
    }
    return 10
  }

  readonly bgColor: string | undefined
  readonly canvas: Canvas
  readonly events: EventEmitter
  readonly hSpace: number

  accelDuration = 20_000
  accelTimer: NodeJS.Timeout | undefined
  dx!: -1 | 0 | 1
  dy!: 0 | 1
  items = new Set<Alien>()
  soundIndex = 0
  timer: NodeJS.Timeout | undefined
  timerDuration!: number

  constructor(
    canvas: Canvas,
    config: Pick<ShapeConfig, 'bgColor'>,
    events: EventEmitter,
  ) {
    this.canvas = canvas
    this.hSpace = Math.round(
      (canvas.width - 2 * Aliens.hMargin) / Aliens.noItemsPerLine,
    )
    this.bgColor = config.bgColor
    this.events = events
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
    for (const item of this.items) {
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
      hMargin + colIndex * hSpace + hSpace / 2 - Constants.alien.width / 2,
    )
    const y = Math.round(3 + rowIndex * (Constants.alien.height + 1))
    const contents =
      Aliens.alienContents[rowIndex % Aliens.alienContents.length]!
    const fgColor = Aliens.aliensColors[rowIndex % Aliens.aliensColors.length]!
    const score = Aliens.computeAlienScore(rowIndex)
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
    for (const item of this.items) {
      item.draw(false, false)
    }
    this.canvas.flush()
  }

  erase(): void {
    for (const item of this.items) {
      item.erase()
    }
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
      Shape.checkPosition(
        this.canvas,
        minX,
        minY,
        Constants.alien.width,
        Constants.alien.height,
      ) &&
      Shape.checkPosition(
        this.canvas,
        maxX,
        maxY,
        Constants.alien.width,
        Constants.alien.height,
      )
    if (hasValidPosition) {
      this.dy = 0
    } else {
      if (
        maxY + Constants.alien.height >=
        this.canvas.height - Constants.alien.height - 1
      ) {
        this.events.emit(GameEvent.GameOver)
        return
      }
      if (this.dy === 0) {
        this.dy = 1
      } else {
        this.dx = this.dx === 1 ? -1 : 1
        this.dy = 0
      }
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
        this.tick(collisionHandler)
        nextTick()
      }, this.timerDuration)
    }
    nextTick()
  }

  stop(): void {
    for (const item of this.items.values()) {
      item.stop()
    }
    this.erase()
  }

  tick(collisionHandler?: (shape: Shape) => boolean): void {
    this.erase()
    this.handleBounds()
    const shooting = alea((3 * 600) / this.timerDuration) === 0
    const shootingCandidates = shooting && [...this.items.values()]
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
