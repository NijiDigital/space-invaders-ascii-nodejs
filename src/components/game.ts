import { join } from 'node:path'

import type { Canvas } from 'terminal-canvas'

import { baseDir } from '../util/base-dir'
import { EXCEPTION_NAME } from '../util/exception-names'
import { createCanvas } from '../util/full-screen-blank-canvas'
import { displayGameOverBoard } from '../util/game-over-board'
import { centerText } from '../util/helper'
import {
  disableAllKeyPressed,
  disableKeyPressed,
  onKeyPressed,
} from '../util/keyboard-listener'
import { playSound } from '../util/sound-player'
import { Aliens } from './aliens'
import { Gunner } from './gunner'
import type { Shape } from './shape'
import { Shelters } from './shelters'

export class Game {
  static backgroundColor = '#000000'
  static readonly soundFileExplosion = join(baseDir, 'sounds', 'explosion.wav')

  readonly aliens: Aliens
  readonly canvas: Canvas
  readonly gunner: Gunner

  score: number
  shelters!: Shelters

  constructor() {
    const canvas = createCanvas(Game.backgroundColor)
    this.canvas = canvas
    this.score = 0
    this.gunner = new Gunner(canvas, { bgColor: Game.backgroundColor })
    this.aliens = new Aliens(canvas, { bgColor: Game.backgroundColor })
    this.resetShelters()
    onKeyPressed('q', () => {
      this.reset()
      const error = new Error('Quit')
      error.name = EXCEPTION_NAME.quit
      throw error
    })
    onKeyPressed('r', () => {
      disableAllKeyPressed()
      this.aliens.clearTimers()
      this.canvas.reset()
      const error = new Error('Restart')
      error.name = EXCEPTION_NAME.restart
      throw error
    })
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
    const keysToDisable = ['left', 'right', 'space']
    keysToDisable.forEach((key) => {
      disableKeyPressed(key)
    })
    this.shelters.erase()
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

  listenKeyboard(): void {
    onKeyPressed('left', () => {
      this.gunner.erase()
      this.gunner.moveBy(-1, 0)
      this.gunner.draw()
    })
    onKeyPressed('right', () => {
      this.gunner.erase()
      this.gunner.moveBy(1, 0)
      this.gunner.draw()
    })
    onKeyPressed('space', () => {
      this.gunner.shoot((bullet) => this.handleGunnerBulletCollision(bullet))
    })
  }

  play(): void {
    this.score = 0
    this.displayScore()
    this.gunner.draw()
    this.shelters.draw()
    this.listenKeyboard()
    this.aliens.run((bullet) => this.handleAlienBulletCollision(bullet))
  }

  reset(): void {
    this.aliens.clearTimers()
    this.aliens.reset()
    this.gunner.reset()
    this.canvas.reset().showCursor()
  }

  resetShelters(): void {
    this.shelters = new Shelters(this.canvas, { bgColor: Game.backgroundColor })
  }
}
