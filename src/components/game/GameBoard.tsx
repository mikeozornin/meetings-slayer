import React from 'react';
import { Ball, Paddle, Brick } from './';
// import { GameStateData } from '../../types';
type GameStateData = any;

interface GameBoardProps {
  ball: any; // Using component Ball type
  paddle: any; // Using component Paddle type  
  bricks: any[]; // Using component Brick type
  gameState: GameStateData;
  onLaunchBall: () => void;
  onToggleLogging: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  ball,
  paddle,
  bricks,
  gameState,
  onLaunchBall,
  onToggleLogging,
}) => {
  const handleClick = () => {
    if (gameState.state === 'playing' && ball.velocity.x === 0 && ball.velocity.y === 0) {
      onLaunchBall();
    }
  };

  const handleDoubleClick = () => {
    onToggleLogging();
  };

  // Получаем дни недели для заголовков
  const getWeekDayHeaders = () => {
    const today = new Date();
    const monday = new Date(today);
    // Исправляем вычисление понедельника: getDay() возвращает 0 для воскресенья
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 = воскресенье, 1 = понедельник
    monday.setDate(today.getDate() - daysToMonday);
    
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']; // Только рабочие дни
    return dayNames.map((name, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return {
        name,
        number: date.getDate()
      };
    });
  };

  const weekDays = getWeekDayHeaders();

  return (
    <div 
      className="relative w-full h-full bg-background border-2 border-border rounded-lg overflow-hidden cursor-pointer"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Границы игрового поля */}
      <div className="absolute inset-0 border-4 border-primary/20 pointer-events-none" />
      
      {/* Контейнер для игровых объектов с отступом от границ */}
      <div className="absolute inset-1" style={{ margin: '4px' }}>
        {/* Заголовки дней недели */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-muted/30 border-b border-border flex">
          {/* Пустая ячейка для колонки времени */}
          <div className="w-16 h-full border-r border-border flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-muted-foreground">Время</span>
          </div>
          
          {/* Дни недели */}
          {weekDays.map((day) => (
            <div 
              key={day.name}
              className="h-full border-r border-border flex flex-col items-center justify-center flex-1"
            >
              <span className="text-xs font-medium text-foreground">{day.name}</span>
              <span className="text-xs text-muted-foreground">{day.number}</span>
            </div>
          ))}
        </div>

        {/* Метки времени */}
        {Array.from({ length: 12 }, (_, index) => {
          const hour = index + 8; // Часы с 8:00 до 19:00
          return (
            <div
              key={hour}
              className="absolute left-0 w-16 border-r border-border flex items-center justify-center"
              style={{
                top: 50 + index * 27, // 40px для заголовка + отступы
                height: 25
              }}
            >
              <span className="text-xs font-medium text-muted-foreground">
                {hour.toString().padStart(2, '0')}:00
              </span>
            </div>
          );
        })}
        
        {/* Блоки */}
        {bricks.map((brick) => (
          <Brick 
            key={`${brick.uid}-${brick.isDestroyed}-${brick.isExploding}`} 
            brick={brick} 
          />
        ))}
        
        {/* Мяч */}
        <Ball ball={ball} />
        
        {/* Ракетка */}
        <Paddle paddle={paddle} />
      </div>
      
      {/* Инструкция для запуска мяча */}
      {gameState.state === 'playing' && ball.velocity.x === 0 && ball.velocity.y === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground mb-2">
              Click to launch ball
            </div>
            <div className="text-sm text-muted-foreground">
              Use ← → keys to move paddle
            </div>
          </div>
        </div>
      )}
      
      {/* Состояние игры */}
      {gameState.state === 'gameOver' && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90">
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive mb-2">
              Game Over!
            </div>
            <div className="text-lg text-foreground">
              Score: {gameState.score}
            </div>
          </div>
        </div>
      )}
      
      {gameState.state === 'victory' && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              Victory!
            </div>
            <div className="text-lg text-foreground">
              All meetings destroyed!
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Score: {gameState.score}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 