import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import type { Canvas } from 'terminal-canvas'

import { screenHeight, screenWidth } from './full-screen-blank-canvas'
import { centerText } from './helper'

export const displayGameOverBoard = (canvas: Canvas, score: number): void => {
  const baseDir = resolve(__dirname, '..', '..')
  const bestScoreFile = join(baseDir, '.best-score')
  const now = new Date()
  const bestScore = existsSync(bestScoreFile)
    ? (JSON.parse(readFileSync(bestScoreFile, 'utf8')) as {
        score: number
        timestamp: string
      })
    : { score: 0, timestamp: now }
  if (score > bestScore.score) {
    bestScore.score = score
    bestScore.timestamp = now
    writeFileSync(
      bestScoreFile,
      JSON.stringify(bestScore, undefined, 2),
      'utf8',
    )
  }
  const gameOverLines = [
    ' _______  _______  _______  _______    _______           _______  _______  _ ',
    '(  ____ \\(  ___  )(       )(  ____ \\  (  ___  )|\\     /|(  ____ \\(  ____ )( )',
    '| (    \\/| (   ) || () () || (    \\/  | (   ) || )   ( || (    \\/| (    )|| |',
    '| |      | (___) || || || || (__      | |   | || |   | || (__    | (____)|| |',
    '| | ____ |  ___  || |(_)| ||  __)     | |   | |( (   ) )|  __)   |     __)| |',
    '| | \\_  )| (   ) || |   | || (        | |   | | \\ \\_/ / | (      | (\\ (   (_)',
    '| (___) || )   ( || )   ( || (____/\\  | (___) |  \\   /  | (____/\\| ) \\ \\__ _ ',
    '(_______)|/     \\||/     \\|(_______/  (_______)   \\_/   (_______/|/   \\__/(_)',
  ]
  const width = gameOverLines.reduce(
    (maxWidth, line) => Math.max(maxWidth, line.length),
    Number.MIN_VALUE,
  )
  const scoreLine = centerText(`Your score: ${score}`, width)
  const bestScoreLine = centerText(`Best score: ${bestScore.score}`, width)
  const quitContent = centerText('Press "q" to quit, "r" to restart', width)
  canvas
    .moveTo(
      Math.round((screenWidth - width) / 2),
      Math.round((screenHeight - (gameOverLines.length + 1 + 1 + 1) - 4) / 2),
    )
    .foreground('RADICAL_RED')
  for (const line of gameOverLines) {
    canvas.write(line).down(1).left(width)
  }
  canvas
    .down(1)
    .foreground('WHITE')
    .blink(true)
    .write(scoreLine)
    .down(1)
    .left(width)
  canvas
    .down(1)
    .foreground('WHITE')
    .blink(false)
    .write(bestScoreLine)
    .down(1)
    .left(width)
  canvas
    .down(1)
    .background('SLATE_GREY')
    .foreground('BLACK')
    .blink(true)
    .write(quitContent)
    .down(1)
    .left(width)
  canvas.flush()
}
