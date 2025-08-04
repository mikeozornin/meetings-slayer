import React, { useState, useEffect } from 'react';

interface ExplosionProps {
  x: number;
  y: number;
  onComplete: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export const Explosion: React.FC<ExplosionProps> = ({ x, y, onComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // Создаем частицы взрыва
    const newParticles: Particle[] = [];
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * 2 * Math.PI;
      const speed = 2 + Math.random() * 3;
      const life = 0.8 + Math.random() * 0.4;
      
      newParticles.push({
        id: i,
        x: x + Math.random() * 20 - 10,
        y: y + Math.random() * 20 - 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: life,
        maxLife: life,
        size: 3 + Math.random() * 4,
        color: ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4d9de0'][Math.floor(Math.random() * 4)]
      });
    }
    
    setParticles(newParticles);
  }, [x, y]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setParticles(prev => {
        const updated = prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.1, // Гравитация
          life: particle.life - 0.02,
          size: particle.size * 0.98
        })).filter(particle => particle.life > 0);

        if (updated.length === 0) {
          setIsActive(false);
          onComplete();
        }

        return updated;
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="absolute pointer-events-none" style={{ zIndex: 1000 }}>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.life / particle.maxLife,
            transform: `translate(-50%, -50%) scale(${particle.life / particle.maxLife})`,
            transition: 'all 0.016s linear'
          }}
        />
      ))}
    </div>
  );
}; 