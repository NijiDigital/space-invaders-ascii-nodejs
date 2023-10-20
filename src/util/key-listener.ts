import { stdin } from 'node:process'
import readline from 'node:readline'

export interface KeyListener {
  key: string
  listener: () => void
}

const keyListeners: KeyListener[] = []

const keypressListener: (
  chunk: unknown,
  pressedKey: { name: string },
) => void = (_chunk, pressedKey) => {
  keyListeners.forEach(({ key, listener }) => {
    if (pressedKey.name === key) {
      listener()
    }
  })
}

export const registerKeyListener = (keyListener: KeyListener): void => {
  keyListeners.push(keyListener)
}

export const registerKeyListeners = (keyListeners: KeyListener[]): void => {
  keyListeners.forEach((keyListener) => {
    registerKeyListener(keyListener)
  })
}

export const unregisterKeyListener = (keyListener: KeyListener): boolean => {
  const index = keyListeners.findIndex(
    (keyboardListener) =>
      keyboardListener.key === keyListener.key &&
      keyboardListener.listener === keyListener.listener,
  )
  if (index === -1) {
    return false
  }
  keyListeners.splice(index, 1)
  return true
}

export const unregisterKeyListeners = (keyListeners: KeyListener[]): void => {
  keyListeners.forEach((keyListener) => {
    unregisterKeyListener(keyListener)
  })
}

export const unregisterAllKeyListeners = (): void => {
  keyListeners.splice(0, keyListeners.length)
}

export const startListening = (): void => {
  if (!stdin.isTTY) {
    throw new Error('Please run the app from a TTY!')
  }
  readline.emitKeypressEvents(stdin)
  stdin.setRawMode(true)
  stdin.on('keypress', keypressListener)
}

export const stopListening = (): void => {
  stdin.removeListener('keypress', keypressListener)
  stdin.setRawMode(false)
  stdin.end()
}
