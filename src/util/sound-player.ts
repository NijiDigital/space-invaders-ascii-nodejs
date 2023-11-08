import player from 'node-wav-player'

export const playSound = (soundFile: string): void => {
  void player.play({ path: soundFile })
}
