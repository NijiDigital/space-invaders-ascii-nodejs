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

export interface Shooter {
  shoot: (collisionHandler?: (shape: Shape) => boolean) => void
  stop: () => void
}

export interface Explodable {
  explode: () => void
}
