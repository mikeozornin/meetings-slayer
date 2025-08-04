import React from 'react';
// import { Ball as BallType } from '../../types';
type BallType = any;

interface BallProps {
  ball: BallType;
}

export const Ball: React.FC<BallProps> = ({ ball }) => {
  return (
    <div
      className="absolute bg-destructive rounded-full shadow-lg ball"
      style={{
        left: ball.position.x - ball.radius,
        top: ball.position.y - ball.radius,
        width: ball.radius * 2,
        height: ball.radius * 2,
        transform: 'translateZ(0)', // Оптимизация для GPU
      }}
    />
  );
}; 