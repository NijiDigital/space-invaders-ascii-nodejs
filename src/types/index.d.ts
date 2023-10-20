import type { Shape } from '../components/shape'

export interface Plan {
  height: number
  width: number
  x: number
  y: number
}

export interface Shapeable {
  collidesWith: (other: Plan) => unknown
  draw: () => void
  erase: () => void
}

export interface ShapeConfig {
  bgColor?: string
  contents?: string[][]
  fgColor?: string
  height: number
  width: number
  x: number
  y: number
}

export interface Stoppable {
  stop: () => void
}

export interface Shooterable extends Stoppable {
  shoot: (collisionHandler?: (shape: Shape) => boolean) => void
}

export interface Explodable {
  explode: () => void
}

export interface Resetable {
  reset: () => void
}
