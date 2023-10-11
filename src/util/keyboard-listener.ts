import readline from 'node:readline'

const { stdin } = process

readline.emitKeypressEvents(stdin)
if (stdin.isTTY) {
  stdin.setRawMode(true)
}
stdin.resume()

export interface KeyboardListener {
  key: string
  listener: () => void
}
const keyboardListeners: KeyboardListener[] = []

stdin.on('keypress', (_chunk, pressedKey: { name: string }) => {
  keyboardListeners.forEach(({ key, listener }) => {
    if (pressedKey.name === key) {
      listener()
    }
  })
})

export const onKeyPressed = (key: string, listener: () => void): void => {
  keyboardListeners.push({ key, listener })
}

export const disableKeyPressed = (key: string): boolean => {
  const index = keyboardListeners.findIndex((listener) => listener.key === key)
  if (index === -1) {
    return false
  }
  keyboardListeners.splice(index, 1)
  return true
}

export const disableAllKeyPressed = (): void => {
  keyboardListeners.splice(0, keyboardListeners.length)
}
