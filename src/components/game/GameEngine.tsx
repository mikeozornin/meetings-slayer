import React, { useState, useEffect, useCallback } from 'react';
import { GameBoard } from './GameBoard';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useGameLoop } from '../../hooks/useGameLoop';
import { soundManager } from '../../utils/soundEffects';
// import { 
//   Ball, 
//   Paddle, 
//   Brick, 
//   GameStateData, 
//   GameSettings,
//   Meeting 
// } from '../../types';
type Ball = any;
type Paddle = any;
type Brick = any;
type GameStateData = any;
type GameSettings = any;
type Meeting = any;
import { 
  createInitialGameState, 
  createInitialBall, 
  createInitialPaddle, 
  createBrickGrid,
  DEFAULT_GAME_SETTINGS,
  checkVictory,
  checkGameOver
} from '../../utils/gameState';

interface GameEngineProps {
  meetings: Meeting[];
  onGameStateChange?: (state: GameStateData) => void;
}

export const GameEngine: React.FC<GameEngineProps> = ({ 
  meetings, 
  onGameStateChange 
}) => {
  // Состояние игры
  const [gameState, setGameState] = useState<GameStateData>(createInitialGameState());
  const [settings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS);
  
  // Игровые объекты
  const [ball, setBall] = useState<Ball>(createInitialBall(createInitialPaddle(800, 600)));
  const [paddle, setPaddle] = useState<Paddle>(createInitialPaddle(800, 600));
  const [bricks, setBricks] = useState<Brick[]>([]);
  
  // Размеры игрового поля
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // Состояние логирования
  const [isLoggingEnabled, setIsLoggingEnabled] = useState(false);
  
  // Хуки
  const keyState = useKeyboard(gameState.state === 'playing');
  const { launchBall } = useGameLoop({
    ball,
    paddle,
    bricks,
    gameState,
    settings,
    dimensions,
    keyState,
    isLoggingEnabled,
    onBallUpdate: setBall,
    onPaddleUpdate: setPaddle,
    onBricksUpdate: setBricks,
    onGameStateUpdate: setGameState,
  });

  // Инициализация игры при загрузке встреч
  useEffect(() => {
    if (meetings.length > 0) {
      const newBricks = createBrickGrid(meetings, dimensions.width);
      setBricks(newBricks);
      setGameState((prev: GameStateData) => ({ ...prev, state: 'playing' }));
    }
  }, [meetings, dimensions.width]);

  // Обновление размеров игрового поля
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('game-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        // Вычитаем все отступы:
        // - border-2 на внешнем контейнере = 2px с каждой стороны
        // - border-4 на внутреннем контейнере = 4px с каждой стороны  
        // - inset-1 = 4px с каждой стороны
        // - margin: 4px = 4px с каждой стороны
        // - заголовок календаря = 40px сверху
        const outerBorder = 4; // border-2 = 2px с каждой стороны
        const innerBorder = 8; // border-4 = 4px с каждой стороны
        const insetMargin = 8; // inset-1 = 4px с каждой стороны
        const additionalMargin = 8; // margin: 4px = 4px с каждой стороны
        const headerHeight = 40; // высота заголовка календаря
        
        const totalHorizontalOffset = outerBorder + innerBorder + insetMargin + additionalMargin;
        const totalVerticalOffset = outerBorder + innerBorder + insetMargin + additionalMargin + headerHeight;
        
        const gameWidth = rect.width - totalHorizontalOffset;
        const gameHeight = rect.height - totalVerticalOffset;
        
        if (isLoggingEnabled) {
          console.log('Game dimensions updated:', {
            containerRect: { width: rect.width, height: rect.height },
            offsets: { horizontal: totalHorizontalOffset, vertical: totalVerticalOffset },
            gameSize: { width: gameWidth, height: gameHeight }
          });
        }
        
        setDimensions({ width: gameWidth, height: gameHeight });
        
        // Обновляем позиции объектов при изменении размеров
        setPaddle(createInitialPaddle(gameWidth, gameHeight));
        setBall(createInitialBall(createInitialPaddle(gameWidth, gameHeight)));
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isLoggingEnabled]);

  // Проверка победы/проигрыша
  useEffect(() => {
    if (gameState.state !== 'playing') return;

    if (checkVictory(bricks)) {
      setGameState((prev: GameStateData) => ({ ...prev, state: 'victory' }));
    } else if (checkGameOver(ball, dimensions.height, gameState.lives)) {
      setGameState((prev: GameStateData) => ({ ...prev, state: 'gameOver' }));
    }
  }, [bricks, ball, dimensions.height, gameState.lives, gameState.state]);

  // Удаляем разрушенные блоки из массива
  useEffect(() => {
    const destroyedBricks = bricks.filter(brick => brick.isDestroyed);
    if (destroyedBricks.length > 0) {
      // Удаляем разрушенные блоки через небольшую задержку
      const timer = setTimeout(() => {
        setBricks(prev => prev.filter(brick => !brick.isDestroyed));
      }, 1000); // Даем время на завершение анимации
      
      return () => clearTimeout(timer);
    }
  }, [bricks]);

  // Уведомляем родительский компонент об изменении состояния
  useEffect(() => {
    onGameStateChange?.(gameState);
  }, [gameState, onGameStateChange]);

  // Сброс игры
  const resetGame = useCallback(() => {
    setGameState(createInitialGameState());
    setBall(createInitialBall(paddle));
    setPaddle(createInitialPaddle(dimensions.width, dimensions.height));
    if (meetings.length > 0) {
      const newBricks = createBrickGrid(meetings, dimensions.width);
      setBricks(newBricks);
    }
  }, [meetings, dimensions, paddle]);

  // Обработка запуска мяча
  const handleLaunchBall = useCallback(() => {
    if (gameState.state === 'playing') {
      launchBall();
    }
  }, [gameState.state, launchBall]);

  // Обработка перезапуска игры
  const handleRestart = useCallback(() => {
    resetGame();
    setGameState((prev: GameStateData) => ({ ...prev, state: 'playing' }));
  }, [resetGame]);

  // Обработка переключения логирования по двойному клику
  const handleToggleLogging = useCallback(() => {
    setIsLoggingEnabled(prev => {
      const newState = !prev;
      console.log(`🐛 Debug logging ${newState ? 'ENABLED' : 'DISABLED'}`);
      return newState;
    });
  }, []);

  // Обработка переключения звука
  const handleToggleSound = useCallback(() => {
    soundManager.toggleSound();
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Информация о игре */}
      <div className="flex items-center justify-between p-4 bg-card border-b">
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Score: </span>
            <span className="font-semibold">{gameState.score}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Lives: </span>
            <span className="font-semibold">{gameState.lives}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              soundManager.isSoundEnabled() 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            🔊 {soundManager.isSoundEnabled() ? 'ON' : 'OFF'}
          </button>
          
          {(gameState.state === 'gameOver' || gameState.state === 'victory') && (
            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Play Again
            </button>
          )}
        </div>
      </div>

      {/* Игровое поле */}
      <div id="game-container" className="flex-1 p-4">
        <GameBoard
          ball={ball}
          paddle={paddle}
          bricks={bricks}
          gameState={gameState}
          onLaunchBall={handleLaunchBall}
          onToggleLogging={handleToggleLogging}
        />
      </div>
    </div>
  );
}; 