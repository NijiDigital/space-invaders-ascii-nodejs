import { EventEmitter } from 'node:events'
import { join } from 'node:path'

import type { Canvas } from 'terminal-canvas'

import { baseDir } from '../util/base-dir'
import { createCanvas, resetCanvas } from '../util/full-screen-blank-canvas'
import { displayGameOverBoard } from '../util/game-over-board'
import { centerText } from '../util/helper'
import type { KeyListener } from '../util/key-listener'
import {
  registerKeyListeners,
  unregisterKeyListeners,
} from '../util/key-listener'
import { playSound } from '../util/sound-player'
import { Aliens } from './aliens'
import Constants from './constants'
import { GameEvent } from './game-event'
import { Gunner } from './gunner'
import type { Shape } from './shape'
import { Shelters } from './shelters'

export class Game {
  static readonly soundFileExplosion = join(baseDir, 'sounds', 'explosion.wav')

  readonly aliens: Aliens
  readonly canvas: Canvas
  readonly events: EventEmitter
  readonly gunner: Gunner
  readonly keyListeners: KeyListener[]
  readonly playKeyListeners: KeyListener[]

  score: number
  shelters!: Shelters

  constructor() {
    this.events = new EventEmitter()
    const canvas = createCanvas(Constants.game.backgroundColor)
    this.canvas = canvas
    this.score = 0
    this.gunner = new Gunner(canvas, {
      bgColor: Constants.game.backgroundColor,
    })
    this.aliens = new Aliens(
      canvas,
      { bgColor: Constants.game.backgroundColor },
      this.events,
    )
    this.resetShelters()
    this.keyListeners = [
      {
        key: 'q',
        listener: (): void => {
          this.events.emit(GameEvent.Quit)
        },
      },
      {
        key: 'r',
        listener: (): void => {
          this.events.emit(GameEvent.Restart)
        },
      },
    ]
    this.playKeyListeners = [
      {
        key: 'left',
        listener: (): void => {
          this.gunner.erase()
          this.gunner.moveBy(-1, 0)
          this.gunner.draw()
        },
      },
      {
        key: 'right',
        listener: (): void => {
          this.gunner.erase()
          this.gunner.moveBy(1, 0)
          this.gunner.draw()
        },
      },
      {
        key: 'space',
        listener: (): void => {
          this.gunner.shoot((bullet) =>
            this.handleGunnerBulletCollision(bullet),
          )
        },
      },
    ]
    registerKeyListeners(this.keyListeners)
  }

  displayScore(): void {
    this.canvas
      .moveTo(0, 0)
      .background('DARK_SLATE_GREY')
      .foreground('WHITE')
      .write(centerText(`Score: ${this.score}`, this.canvas.width))
      .flush()
  }

  endOfGame(): void {
    unregisterKeyListeners(this.playKeyListeners)
    this.shelters.erase()
    this.aliens.clearTimers()
    this.aliens.stop()
    this.gunner.stop()
    this.gunner.reset()
    this.gunner.draw()
    displayGameOverBoard(this.canvas, this.score)
  }

  handleAlienBulletCollision(bullet: Shape): boolean {
    if (this.shelters.collidesWith(bullet)) {
      return true
    }
    const exploded = this.gunner.collidesWith(bullet)
    if (!exploded) {
      return false
    }
    playSound(Game.soundFileExplosion)
    this.gunner.explode()
    this.aliens.clearTimers()
    setTimeout(() => {
      this.endOfGame()
    }, 3000)
    return true
  }

  handleGunnerBulletCollision(bullet: Shape): boolean {
    if (this.shelters.collidesWith(bullet)) {
      return true
    }
    const explodedAlien = this.aliens.collidesWith(bullet)
    if (!explodedAlien) {
      return false
    }
    playSound(Aliens.soundFileExplosion)
    this.score += explodedAlien.score
    this.displayScore()
    explodedAlien.explode()
    setTimeout(() => {
      explodedAlien.erase()
      this.aliens.deleteAlien(explodedAlien)
      if (this.aliens.items.size === 0) {
        setTimeout(() => {
          this.shelters.erase()
          this.resetShelters()
          this.shelters.draw()
          this.aliens.clearTimers()
          this.aliens.accelDuration = Math.round(this.aliens.accelDuration / 2)
          this.aliens.createAliens()
          this.aliens.run()
        }, 1000)
      }
    }, 500)
    return true
  }

  play(): void {
    this.score = 0
    this.displayScore()
    this.gunner.draw()
    this.shelters.draw()
    registerKeyListeners(this.playKeyListeners)
    this.aliens.run((bullet) => this.handleAlienBulletCollision(bullet))
  }

  quit(): void {
    unregisterKeyListeners([...this.playKeyListeners, ...this.keyListeners])
    this.events.removeAllListeners()
    this.aliens.clearTimers()
    this.aliens.reset()
    this.gunner.reset()
    resetCanvas(this.canvas)
  }

  resetShelters(): void {
    this.shelters = new Shelters(this.canvas, {
      bgColor: Constants.game.backgroundColor,
    })
  }
}
