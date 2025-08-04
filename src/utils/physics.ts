// import { Vector2D } from '../types';
type Ball = any;
type Paddle = any;
type Brick = any;
type CollisionResult = any;
type Vector2D = any;

// Векторные операции
export const addVectors = (a: Vector2D, b: Vector2D): Vector2D => ({
  x: a.x + b.x,
  y: a.y + b.y,
});

export const subtractVectors = (a: Vector2D, b: Vector2D): Vector2D => ({
  x: a.x - b.x,
  y: a.y - b.y,
});

export const multiplyVector = (vector: Vector2D, scalar: number): Vector2D => ({
  x: vector.x * scalar,
  y: vector.y * scalar,
});

export const normalizeVector = (vector: Vector2D): Vector2D => {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  if (length === 0) return { x: 0, y: -1 }; // Возвращаем вертикальную нормаль по умолчанию
  return {
    x: vector.x / length,
    y: vector.y / length,
  };
};

export const getVectorLength = (vector: Vector2D): number => {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
};

// Коллизии
export const checkBallPaddleCollision = (ball: Ball, paddle: Paddle): CollisionResult => {
  const ballLeft = ball.position.x - ball.radius;
  const ballRight = ball.position.x + ball.radius;
  const ballTop = ball.position.y - ball.radius;
  const ballBottom = ball.position.y + ball.radius;

  const paddleLeft = paddle.position.x;
  const paddleRight = paddle.position.x + paddle.width;
  const paddleTop = paddle.position.y;
  const paddleBottom = paddle.position.y + paddle.height;

  // Проверяем пересечение
  if (ballRight < paddleLeft || ballLeft > paddleRight || 
      ballBottom < paddleTop || ballTop > paddleBottom) {
    return { hasCollision: false };
  }

  // Находим ближайшую точку на ракетке к центру мяча
  const closestX = Math.max(paddleLeft, Math.min(ball.position.x, paddleRight));
  const closestY = Math.max(paddleTop, Math.min(ball.position.y, paddleBottom));

  const distance = Math.sqrt(
    (ball.position.x - closestX) ** 2 + (ball.position.y - closestY) ** 2
  );

  if (distance <= ball.radius) {
    let normal: Vector2D;
    
    // Определяем нормаль в зависимости от того, с какой стороны ракетки произошло столкновение
    if (ball.position.y <= paddleTop) {
      // Удар сверху - основной случай для арканоида
      normal = { x: 0, y: -1 };
      
      // Добавляем небольшой угол в зависимости от позиции попадания на ракетке
      const relativeHitPos = (ball.position.x - (paddleLeft + paddleRight) / 2) / (paddle.width / 2);
      const maxAngle = Math.PI / 6; // 30 градусов максимум
      const angle = relativeHitPos * maxAngle;
      
      normal.x = Math.sin(angle) * 0.3; // Умножаем на 0.3 чтобы эффект был не слишком сильный
      normal = normalizeVector(normal);
    } else {
      // Удар сбоку или снизу - используем геометрическую нормаль
      normal = normalizeVector(subtractVectors(ball.position, { x: closestX, y: closestY }));
    }
    
    // Корректируем позицию мяча, чтобы он не проходил сквозь ракетку
    const penetration = ball.radius - distance;
    ball.position.x += normal.x * penetration;
    ball.position.y += normal.y * penetration;
    
    return {
      hasCollision: true,
      normal,
      penetration,
    };
  }

  return { hasCollision: false };
};

export const checkBallBrickCollision = (ball: Ball, brick: Brick): CollisionResult => {
  if (brick.isDestroyed) return { hasCollision: false };

  const ballLeft = ball.position.x - ball.radius;
  const ballRight = ball.position.x + ball.radius;
  const ballTop = ball.position.y - ball.radius;
  const ballBottom = ball.position.y + ball.radius;

  const brickLeft = brick.position.x;
  const brickRight = brick.position.x + brick.width;
  const brickTop = brick.position.y;
  const brickBottom = brick.position.y + brick.height;

  // Проверяем пересечение
  if (ballRight < brickLeft || ballLeft > brickRight || 
      ballBottom < brickTop || ballTop > brickBottom) {
    return { hasCollision: false };
  }

  // Находим ближайшую точку на блоке к центру мяча
  const closestX = Math.max(brickLeft, Math.min(ball.position.x, brickRight));
  const closestY = Math.max(brickTop, Math.min(ball.position.y, brickBottom));

  const distance = Math.sqrt(
    (ball.position.x - closestX) ** 2 + (ball.position.y - closestY) ** 2
  );

  if (distance <= ball.radius) {
    // Вычисляем нормаль отскока
    const normal = normalizeVector(subtractVectors(ball.position, { x: closestX, y: closestY }));
    
    // Корректируем позицию мяча, чтобы он не проходил сквозь блок
    const penetration = ball.radius - distance;
    ball.position.x += normal.x * penetration;
    ball.position.y += normal.y * penetration;
    
    return {
      hasCollision: true,
      normal,
      penetration,
    };
  }

  return { hasCollision: false };
};

// Отскок мяча - зеркальное отражение (угол падения = угол отскока)
export const reflectBall = (ball: Ball, normal: Vector2D): void => {
  // Убеждаемся что нормаль нормализована
  const normalLength = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
  const n = normalLength > 0 ? { x: normal.x / normalLength, y: normal.y / normalLength } : normal;
  
  // Формула зеркального отражения: v' = v - 2(v·n)n
  // где v - входящий вектор скорости, n - нормаль поверхности
  const dotProduct = ball.velocity.x * n.x + ball.velocity.y * n.y;
  
  ball.velocity.x = ball.velocity.x - 2 * dotProduct * n.x;
  ball.velocity.y = ball.velocity.y - 2 * dotProduct * n.y;
  
  // Сохраняем оригинальную скорость (энергию)
  const originalSpeed = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y);
  if (originalSpeed > 0) {
    const newSpeed = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y);
    if (Math.abs(newSpeed - originalSpeed) > 0.01) {
      ball.velocity.x = (ball.velocity.x / newSpeed) * originalSpeed;
      ball.velocity.y = (ball.velocity.y / newSpeed) * originalSpeed;
    }
  }
};

// Проверка выхода мяча за границы
export const checkBallBoundaryCollision = (ball: Ball, width: number, height: number, enableLogging: boolean = false): CollisionResult => {
  if (enableLogging) {
    console.log('Checking boundary collision:', {
      ballPos: { x: ball.position.x, y: ball.position.y },
      radius: ball.radius,
      boundaries: { width, height },
      checks: {
        left: ball.position.x - ball.radius,
        right: ball.position.x + ball.radius,
        top: ball.position.y - ball.radius,
        bottom: ball.position.y + ball.radius
      }
    });
  }

  if (ball.position.x - ball.radius <= 0) {
    if (enableLogging) console.log('Left boundary collision');
    ball.position.x = ball.radius; // Корректируем позицию
    return { hasCollision: true, normal: { x: 1, y: 0 } };
  }
  if (ball.position.x + ball.radius >= width) {
    if (enableLogging) console.log('Right boundary collision');
    ball.position.x = width - ball.radius; // Корректируем позицию
    return { hasCollision: true, normal: { x: -1, y: 0 } };
  }
  if (ball.position.y - ball.radius <= 0) {
    if (enableLogging) console.log('Top boundary collision');
    ball.position.y = ball.radius; // Корректируем позицию
    return { hasCollision: true, normal: { x: 0, y: 1 } };
  }
  if (ball.position.y - ball.radius >= height) {
    if (enableLogging) console.log('Ball fell below bottom boundary');
    // Мяч упал за нижнюю границу - это потеря жизни, не отскок
    return { hasCollision: true, normal: { x: 0, y: -1 } };
  }
  
  return { hasCollision: false };
}; 