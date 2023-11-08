import { Game } from './components/game'
import { GameEvent } from './components/game-event'
import { startListening, stopListening } from './util/key-listener'

let game: Game | undefined

const quit = (): void => {
  stopListening()
  if (game) {
    game.quit()
    game = undefined
  }
}

const start = (): void => {
  game = new Game()
  game.events.on(GameEvent.GameOver, () => {
    if (game) {
      game.endOfGame()
    }
  })
  game.events.on(GameEvent.Restart, () => {
    quit()
    setTimeout(start, 1000)
  })
  game.events.on(GameEvent.Quit, () => {
    quit()
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(0)
  })
  startListening()
  game.play()
}

process.on('uncaughtException', (error) => {
  quit()
  console.error('/!\\ Error')
  console.log(error)
  process.exit(1)
})

start()
