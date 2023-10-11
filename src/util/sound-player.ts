import createSoundPlayer from 'play-sound'

const soundPlayer = createSoundPlayer()

export const playSound = (soundFile: string): void => {
  soundPlayer.play(soundFile)
}
