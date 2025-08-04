// import { GameState } from '../types';
// type GameState = any;
type Ball = any;
type Paddle = any;
type Brick = any;
type GameStateData = any;
type GameSettings = any;
// type Vector2D = any;

// Настройки по умолчанию
export const DEFAULT_GAME_SETTINGS: GameSettings = {
  ballSpeed: 300,
  paddleSpeed: 1600, // Увеличено с 800 до 1600 (в 2 раза)
  paddleAcceleration: 1600, // Увеличено с 800 до 1600 (в 2 раза)
  lives: 3,
};

// Множитель скорости для каждого уровня
export const LEVEL_SPEED_MULTIPLIER = 1.25;

// Получение настроек для конкретного уровня
export const getLevelSettings = (level: number): GameSettings => {
  const speedMultiplier = Math.pow(LEVEL_SPEED_MULTIPLIER, level - 1);
  return {
    ballSpeed: DEFAULT_GAME_SETTINGS.ballSpeed * speedMultiplier,
    paddleSpeed: DEFAULT_GAME_SETTINGS.paddleSpeed * speedMultiplier,
    paddleAcceleration: DEFAULT_GAME_SETTINGS.paddleAcceleration * speedMultiplier,
    lives: DEFAULT_GAME_SETTINGS.lives,
  };
};

// Начальное состояние игры
export const createInitialGameState = (): GameStateData => ({
  state: 'menu',
  score: 0,
  lives: DEFAULT_GAME_SETTINGS.lives,
  level: 1,
});

// Создание начального мяча
export const createInitialBall = (paddle: Paddle): Ball => ({
  position: {
    x: paddle.position.x + paddle.width / 2,
    y: paddle.position.y - 10,
  },
  velocity: { x: 0, y: 0 },
  radius: 8,
});

// Создание начальной ракетки
export const createInitialPaddle = (width: number, height: number): Paddle => ({
  position: { x: width / 2 - 50, y: height - 24 },
  width: 100,
  height: 10,
  velocity: 0,
  acceleration: 0,
});

// Получение дат для конкретной недели (неделя 1 = текущая, неделя 2 = предыдущая и т.д.)
export const getWeekDates = (weekOffset: number = 0): Date[] => {
  const today = new Date();
  const monday = new Date(today);
  
  // Вычисляем понедельник текущей недели
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  monday.setDate(today.getDate() - daysToMonday);
  
  // Переходим к нужной неделе (неделя 1 = текущая, неделя 2 = предыдущая)
  monday.setDate(monday.getDate() - (weekOffset - 1) * 7);
  
  const weekDays: Date[] = [];
  for (let i = 0; i < 5; i++) { // Только 5 рабочих дней
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    weekDays.push(date);
  }
  
  return weekDays;
};

// Фильтрация встреч по неделе
export const filterMeetingsByWeek = (meetings: any[], weekOffset: number = 1): any[] => {
  const weekDates = getWeekDates(weekOffset);
  const weekStart = new Date(weekDates[0]);
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekDates[4]);
  weekEnd.setHours(23, 59, 59, 999);
  
  return meetings.filter(meeting => {
    const meetingDate = new Date(meeting.startTime);
    return meetingDate >= weekStart && meetingDate <= weekEnd;
  });
};

// Создание сетки блоков в формате календаря с временными swimlanes
export const createBrickGrid = (meetings: any[], width: number, level: number = 1): Brick[] => {
  const bricks: Brick[] = [];
  const topMargin = 50;
  const timeColumnWidth = 64; // Ширина колонки времени (16px * 4)
  const dayColumnWidth = (width - timeColumnWidth) / 5; // 5 рабочих дней - равномерное распределение
  const hourHeight = 25; // Высота каждого часа
  
  // Получаем рабочие дни для текущего уровня
  const weekDates = getWeekDates(level);

  // Группируем встречи по дням и часам
  const meetingsByDayHour: { [key: string]: any[] } = {};
  
  let processedMeetings = 0;
  
  meetings.forEach(meeting => {
    const meetingDate = new Date(meeting.startTime);
    const dayIndex = weekDates.findIndex(day => 
      day.toDateString() === meetingDate.toDateString()
    );
    
    if (dayIndex >= 0) {
      const startHour = Math.max(8, meetingDate.getHours()); // Начинаем с 8:00
      const endHour = Math.min(20, new Date(meeting.endTime).getHours()); // Заканчиваем в 20:00
      
      // Создаем уникальный ключ для встречи
      const meetingKey = `${meeting.uid}-${dayIndex}-${startHour}`;
      
      // Добавляем встречу только один раз в первый час
      const key = `${dayIndex}-${startHour}`;
      if (!meetingsByDayHour[key]) {
        meetingsByDayHour[key] = [];
      }
      meetingsByDayHour[key].push({
        ...meeting,
        meetingKey: meetingKey,
        duration: endHour - startHour + 1 // Продолжительность в часах
      });
    }
    
    processedMeetings++;
  });

  // Создаем кирпичи для каждого временного слота
  let totalBricks = 0;
  for (let hour = 8; hour < 20; hour++) { // Рабочие часы 8:00-20:00
    for (let dayIndex = 0; dayIndex < 5; dayIndex++) { // Только рабочие дни
      const key = `${dayIndex}-${hour}`;
      const hourMeetings = meetingsByDayHour[key] || [];
      
      // Если в этом слоте есть встречи, создаем кирпич
      if (hourMeetings.length > 0) {
        const meeting = hourMeetings[0]; // Берем первую встречу из слота
        
        // Создаем уникальный ключ, комбинируя UID с позицией
        const uniqueKey = meeting.meetingKey || `${meeting.uid}-${dayIndex}-${hour}`;
        
        // Вычисляем высоту кирпича на основе продолжительности встречи
        const meetingDuration = meeting.duration || 1;
        const brickHeight = Math.min(meetingDuration * hourHeight, hourHeight * 3); // Максимум 3 часа
        
        bricks.push({
          uid: uniqueKey, // Добавляем uid для блока
          meeting: {
            ...meeting,
            summary: hourMeetings.length > 1 
              ? `${meeting.summary} (+${hourMeetings.length - 1})` 
              : meeting.summary,
            uniqueKey: uniqueKey // Добавляем уникальный ключ
          },
          position: {
            x: timeColumnWidth + dayIndex * dayColumnWidth,
            y: topMargin + (hour - 8) * (hourHeight + 2),
          },
          width: dayColumnWidth - 2,
          height: brickHeight,
          isDestroyed: false,
          isExploding: false,
        });
        
        totalBricks++;
      }
    }
  }

  return bricks;
};

// Обновление состояния игры
export const updateGameState = (
  currentState: GameStateData,
  updates: Partial<GameStateData>
): GameStateData => ({
  ...currentState,
  ...updates,
});

// Проверка победы
export const checkVictory = (bricks: Brick[]): boolean => {
  return bricks.every(brick => brick.isDestroyed);
};

// Проверка проигрыша
export const checkGameOver = (ball: Ball, height: number, lives: number): boolean => {
  return ball.position.y > height && lives <= 0;
};

// Подсчет очков
export const calculateScore = (bricks: Brick[]): number => {
  return bricks.filter(brick => brick.isDestroyed).length * 10;
}; 