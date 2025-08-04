import React from 'react';
// import { Paddle as PaddleType } from '../../types';
type PaddleType = any;

interface PaddleProps {
  paddle: PaddleType;
}

export const Paddle: React.FC<PaddleProps> = ({ paddle }) => {
  return (
    <div
      className="absolute bg-primary rounded-md shadow-lg paddle"
      style={{
        left: paddle.position.x,
        top: paddle.position.y,
        width: paddle.width,
        height: paddle.height,
        transform: 'translateZ(0)', // Оптимизация для GPU
      }}
    />
  );
}; 