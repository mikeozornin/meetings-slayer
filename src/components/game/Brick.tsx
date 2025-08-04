import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../../utils/soundEffects';
// import { Brick as BrickType } from '../../types';
type BrickType = any;

interface BrickProps {
  brick: BrickType;
  onExplosionComplete?: () => void;
}

export const Brick: React.FC<BrickProps> = ({ brick, onExplosionComplete }) => {
  const [isExploding, setIsExploding] = useState(false);
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });
  const [isHit, setIsHit] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const brickRef = useRef<HTMLDivElement>(null);

  // Убираем этот useEffect, так как логика перенесена в следующий useEffect

  // Функция создания частиц
  const createParticles = (x: number, y: number) => {
    const particleCount = 20;
    // Находим контейнер игровых объектов (внутренний контейнер с отступами)
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;
    
    // Ищем внутренний контейнер с игровыми объектами
    const innerContainer = gameContainer.querySelector('.absolute.inset-1');
    if (!innerContainer) return;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.width = `${Math.random() * 4 + 2}px`;
      particle.style.height = particle.style.width;
      particle.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
      particle.style.borderRadius = '50%';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '1000';
      innerContainer.appendChild(particle);

      // Анимация частиц
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 80 + 40;
      const duration = Math.random() * 0.6 + 0.4;
      
      particle.animate([
        { transform: 'translate(0, 0)', opacity: 1 },
        { 
          transform: `translate(${Math.cos(angle) * speed}px, ${Math.sin(angle) * speed}px)`, 
          opacity: 0 
        }
      ], {
        duration: duration * 1000,
        easing: 'ease-out',
        fill: 'forwards'
      }).onfinish = () => particle.remove();
    }
  };

  // Отдельный эффект для обработки isExploding
  useEffect(() => {
    if (brick.isExploding && !isExploding) {
      console.log('Brick isExploding triggered:', {
        summary: brick.meeting.summary,
        uid: brick.uid
      });
      setIsExploding(true);
      // Воспроизводим звук взрыва
      soundManager.playExplosion();
      
      // Добавляем эффект дрожания
      const shakeInterval = setInterval(() => {
        setShakeOffset({
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 4
        });
      }, 50);
      
      // Останавливаем дрожание через 300мс
      setTimeout(() => {
        clearInterval(shakeInterval);
        setShakeOffset({ x: 0, y: 0 });
      }, 300);

      // Создаем частицы и скрываем блок
      setTimeout(() => {
        // Используем позицию блока из данных, а не из DOM
        const centerX = brick.position.x + brick.width / 2;
        const centerY = brick.position.y + brick.height / 2;
        createParticles(centerX, centerY);
        setIsVisible(false);
        onExplosionComplete?.();
      }, 300);
    }
  }, [brick.isExploding, isExploding, onExplosionComplete]);

  // Эффект попадания мяча
  useEffect(() => {
    if (brick.isExploding && !isHit) {
      setIsHit(true);
      // Сбрасываем эффект попадания через 200мс
      setTimeout(() => setIsHit(false), 200);
    }
  }, [brick.isExploding, isHit]);





  // Если блок не видим, не отображаем его
  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Блок */}
      <div
        ref={brickRef}
        className={`absolute rounded border-2 transition-all duration-300 ${
          isExploding 
            ? 'animate-pulse bg-destructive scale-110 opacity-50' 
            : isHit
            ? 'animate-pulse bg-orange-500 scale-105'
            : 'bg-accent hover:bg-accent/80'
        }`}
        style={{
          left: brick.position.x + shakeOffset.x,
          top: brick.position.y + shakeOffset.y,
          width: brick.width,
          height: brick.height,
          transform: 'translateZ(0)', // Оптимизация для GPU
        }}
        title={`${brick.meeting.summary} - isDestroyed: ${brick.isDestroyed}, isExploding: ${brick.isExploding}`}
      >
        <div className="flex items-center justify-center h-full p-1">
          <div className="text-xs font-medium text-center text-foreground truncate">
            {brick.meeting.summary}
          </div>
        </div>
      </div>

    </>
  );
}; 