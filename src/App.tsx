import { useState } from 'react';
import { GameEngine } from './components/game/GameEngine';
import { ICSFileUpload } from './components/calendar/ICSFileUpload';
import { useTheme } from './hooks/useTheme';
// import { GameStateData, Meeting } from './types';
type GameStateData = any;
type Meeting = any;
import { Gamepad, Calendar, Trophy } from 'lucide-react';

function App() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [gameState, setGameState] = useState<GameStateData | null>(null);
  
  // Инициализируем системную тему
  useTheme();

  const handleMeetingsLoaded = (loadedMeetings: Meeting[]) => {
    setMeetings(loadedMeetings);
  };

  const handleGameStateChange = (state: GameStateData) => {
    setGameState(state);
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Заголовок */}
      <header className="bg-card border-b flex-shrink-0">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gamepad className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Meetings Slayer
                </h1>
              </div>
            </div>
            
            {gameState && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">
                    Score: {gameState.score}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">
                    Meetings: {meetings.length}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="container mx-auto px-4 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Панель загрузки встреч */}
          <div className="lg:col-span-1 h-full">
            <div className="bg-card border rounded-lg p-6 h-full">
              <ICSFileUpload onMeetingsLoaded={handleMeetingsLoaded} />
            </div>
          </div>

          {/* Игровое поле */}
          <div className="lg:col-span-2">
            <div className="bg-card border rounded-lg h-full">
              {meetings.length > 0 ? (
                <GameEngine 
                  meetings={meetings} 
                  onGameStateChange={handleGameStateChange}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Gamepad className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Ready to Slay Some Meetings?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Upload your ICS file or load sample meetings to start playing
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
