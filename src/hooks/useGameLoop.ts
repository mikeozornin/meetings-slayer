import { useEffect, useRef, useCallback } from 'react';
import { soundManager } from '../utils/soundEffects';
// import { GameStateData, GameSettings } from '../types';
type Ball = any;
type Paddle = any;
type Brick = any;
type GameStateData = any;
type GameSettings = any;
import { 
  checkBallPaddleCollision, 
  checkBallBrickCollision, 
  checkBallBoundaryCollision,
  reflectBall 
} from '../utils/physics';
// import { KeyboardState } from './useKeyboard';
type KeyboardState = any;

interface GameLoopProps {
  ball: Ball;
  paddle: Paddle;
  bricks: Brick[];
  gameState: GameStateData;
  settings: GameSettings;
  dimensions: { width: number; height: number };
  keyState: KeyboardState;
  isLoggingEnabled: boolean;
  onBallUpdate: (ball: Ball) => void;
  onPaddleUpdate: (paddle: Paddle) => void;
  onBricksUpdate: (bricks: Brick[]) => void;
  onGameStateUpdate: (gameState: GameStateData) => void;
}

export const useGameLoop = ({
  ball,
  paddle,
  bricks,
  gameState,
  settings,
  dimensions,
  keyState,
  isLoggingEnabled,
  onBallUpdate,
  onPaddleUpdate,
  onBricksUpdate,
  onGameStateUpdate,
}: GameLoopProps) => {
  const frameIdRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);

  const updatePaddle = useCallback((deltaTime: number) => {
    const newPaddle = { ...paddle };
    
    // Обновляем ускорение на основе нажатых клавиш
    if (keyState.left && !keyState.right) {
      newPaddle.acceleration = -settings.paddleAcceleration;
    } else if (keyState.right && !keyState.left) {
      newPaddle.acceleration = settings.paddleAcceleration;
    } else {
      newPaddle.acceleration = 0;
      // Трение
      newPaddle.velocity *= 0.9;
    }

    // Обновляем скорость
    newPaddle.velocity += newPaddle.acceleration * deltaTime;
    newPaddle.velocity = Math.max(-settings.paddleSpeed, Math.min(settings.paddleSpeed, newPaddle.velocity));

    // Обновляем позицию
    newPaddle.position.x += newPaddle.velocity * deltaTime;

    // Ограничиваем ракетку границами экрана
    newPaddle.position.x = Math.max(0, Math.min(dimensions.width - newPaddle.width, newPaddle.position.x));

    onPaddleUpdate(newPaddle);
  }, [paddle, keyState, settings, dimensions.width, onPaddleUpdate]);

  const updateBall = useCallback((deltaTime: number) => {
    const newBall = { ...ball };

    // Обновляем позицию мяча
    newBall.position.x += newBall.velocity.x * deltaTime;
    newBall.position.y += newBall.velocity.y * deltaTime;

    // Журналирование позиции до коллизий
    if (isLoggingEnabled) {
      console.log('Ball position before collision check:', {
        x: newBall.position.x,
        y: newBall.position.y,
        radius: newBall.radius,
        dimensions: dimensions
      });
    }

    // Проверяем коллизии с границами
    const boundaryCollision = checkBallBoundaryCollision(newBall, dimensions.width, dimensions.height, isLoggingEnabled);
    if (boundaryCollision.hasCollision && boundaryCollision.normal) {
      if (isLoggingEnabled) {
        console.log('Boundary collision detected:', {
          normal: boundaryCollision.normal,
          beforeCorrection: { x: newBall.position.x, y: newBall.position.y }
        });
      }
      
      // Если мяч упал вниз, теряем жизнь и сбрасываем мяч
      if (boundaryCollision.normal.y === -1) {
        // Сбрасываем мяч на ракетку
        newBall.position.x = paddle.position.x + paddle.width / 2;
        newBall.position.y = paddle.position.y - 10;
        newBall.velocity.x = 0;
        newBall.velocity.y = 0;
        
        onGameStateUpdate({
          ...gameState,
          lives: gameState.lives - 1,
          state: gameState.lives - 1 <= 0 ? 'gameOver' : 'playing'
        });
      } else {
        // Для всех остальных границ (верх, лево, право) - отскакиваем
        reflectBall(newBall, boundaryCollision.normal);
        // Воспроизводим звук отскока
        soundManager.playBounce();
        
        if (isLoggingEnabled) {
          console.log('Ball position after collision correction:', {
            x: newBall.position.x,
            y: newBall.position.y
          });
        }
      }
    }

    // Проверяем коллизии с ракеткой
    const paddleCollision = checkBallPaddleCollision(newBall, paddle);
    if (paddleCollision.hasCollision && paddleCollision.normal) {
      reflectBall(newBall, paddleCollision.normal);
      // Воспроизводим звук отскока от ракетки
      soundManager.playBounce();
    }

    // Проверяем коллизии с блоками
    const newBricks = [...bricks];
    let scoreIncrease = 0;
    let bricksToUpdate = false;

    for (let i = 0; i < newBricks.length; i++) {
      const brick = newBricks[i];
      if (brick.isDestroyed) continue;

      const brickCollision = checkBallBrickCollision(newBall, brick);
      if (brickCollision.hasCollision && brickCollision.normal) {
        reflectBall(newBall, brickCollision.normal);
        
        // Помечаем блок как разрушенный и взрывающийся
        newBricks[i] = {
          ...brick,
          isDestroyed: true,
          isExploding: true
        };
        
        scoreIncrease += 10;
        bricksToUpdate = true;

        if (isLoggingEnabled) {
          console.log('Brick destroyed:', {
            brick: brick.meeting.summary,
            position: brick.position,
            uid: brick.uid,
            newState: {
              isDestroyed: true,
              isExploding: true
            }
          });
        }
      }
    }

    if (scoreIncrease > 0) {
      onGameStateUpdate({
        ...gameState,
        score: gameState.score + scoreIncrease
      });
    }

    onBallUpdate(newBall);
    
    // Обновляем блоки только если были изменения
    if (bricksToUpdate) {
      onBricksUpdate(newBricks);
    }
  }, [ball, paddle, bricks, gameState, dimensions, onBallUpdate, onBricksUpdate, onGameStateUpdate]);

  const gameLoop = useCallback((currentTime: number) => {
    if (gameState.state !== 'playing') {
      frameIdRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = (currentTime - lastTimeRef.current) / 1000; // Конвертируем в секунды
    lastTimeRef.current = currentTime;

    updatePaddle(deltaTime);
    updateBall(deltaTime);

    frameIdRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.state, updatePaddle, updateBall]);

  useEffect(() => {
    frameIdRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [gameLoop]);

  // Функция для запуска мяча
  const launchBall = useCallback(() => {
    if (gameState.state !== 'playing') return;

    const newBall = { ...ball };
    const angle = Math.PI / 4; // 45 градусов
    const speed = settings.ballSpeed;
    
    newBall.velocity.x = Math.cos(angle) * speed;
    newBall.velocity.y = -Math.sin(angle) * speed;

    // Воспроизводим звук запуска мяча
    soundManager.playLaunch();

    onBallUpdate(newBall);
  }, [ball, gameState.state, settings.ballSpeed, onBallUpdate]);

  return { launchBall };
}; 