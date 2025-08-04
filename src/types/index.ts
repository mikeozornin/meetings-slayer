// Игровые объекты
export interface Vector2D {
  x: number;
  y: number;
}

export interface Ball {
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
}

export interface Paddle {
  position: Vector2D;
  width: number;
  height: number;
  velocity: number;
  acceleration: number;
}

export interface Meeting {
  uid: string;
  summary: string;
  startTime: Date;
  endTime: Date;
  description?: string;
}

export interface Brick {
  meeting: Meeting;
  position: Vector2D;
  width: number;
  height: number;
  isDestroyed: boolean;
  isExploding: boolean;
}

// Игровое состояние
export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver' | 'victory';

export interface GameStateData {
  state: GameState;
  score: number;
  lives: number;
  level: number;
}

// Физика
export interface CollisionResult {
  hasCollision: boolean;
  normal?: Vector2D;
  penetration?: number;
}

// Размеры игрового поля
export interface GameDimensions {
  width: number;
  height: number;
  brickRows: number;
  brickCols: number;
}

// Настройки игры
export interface GameSettings {
  ballSpeed: number;
  paddleSpeed: number;
  paddleAcceleration: number;
  lives: number;
} 