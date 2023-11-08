declare module 'node-wav-player' {
  const player: { play: (options: { path: string }) => Promise<void> }
  namespace player {}
  export = player
}
