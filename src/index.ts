import { Game } from './components/game'
import { EXCEPTION_NAME } from './util/exception-names'

let game = new Game()

process.on('uncaughtException', (error) => {
  if (error.name === EXCEPTION_NAME.gameOver) {
    game.endOfGame()
    return
  }
  if (error.name === EXCEPTION_NAME.quit) {
    process.exit(0)
  }
  if (error.name === EXCEPTION_NAME.restart) {
    game.reset()
    setTimeout((): void => {
      game = new Game()
      game.play()
    }, 1000)
    return
  }
  game.reset()
  console.error('/!\\ Error')
  console.log(error)
  process.exit(1)
})

game.play()
