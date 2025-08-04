import React, { useRef } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useICS } from '../../hooks/useICS';

interface Meeting {
  uid: string;
  summary: string;
  startTime: Date;
  endTime: Date;
  description?: string;
}

interface ICSFileUploadProps {
  onMeetingsLoaded: (meetings: Meeting[]) => void;
}

export const ICSFileUpload: React.FC<ICSFileUploadProps> = ({ onMeetingsLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { meetings, isLoading, error, loadICSFile, loadSampleMeetings, clearMeetings } = useICS();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await loadICSFile(file);
    }
  };

  const handleSampleLoad = () => {
    loadSampleMeetings();
  };

  const handleClear = () => {
    clearMeetings();
    onMeetingsLoaded([]);
  };

  // Уведомляем родительский компонент о загруженных встречах
  React.useEffect(() => {
    if (meetings.length > 0) {
      onMeetingsLoaded(meetings);
    }
  }, [meetings, onMeetingsLoaded]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Load Your Meetings
        </h3>
        <p className="text-sm text-muted-foreground">
          Upload your ICS calendar file or use sample meetings. E.g. export meetings from Google or Apple Calendar.
        </p>
      </div>

      {/* Загрузка файла */}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".ics"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors disabled:opacity-50"
        >
          <Upload className="w-5 h-5" />
          <span>{isLoading ? 'Loading...' : 'Choose ICS file'}</span>
        </button>
      </div>

      {/* Кнопка для загрузки примера */}
      <div className="text-center">
        <span className="text-sm text-muted-foreground">or</span>
      </div>

      <button
        onClick={handleSampleLoad}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50"
      >
        <FileText className="w-4 h-4" />
        <span>Load Sample Meetings</span>
      </button>

      {/* Ошибка */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}

      {/* Информация о загруженных встречах */}
      {meetings.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Loaded {meetings.length} meetings
            </span>
            <button
              onClick={handleClear}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
          
          <div className="max-h-32 overflow-y-auto space-y-1">
            {meetings.slice(0, 5).map((meeting, index) => (
              <div key={`${meeting.uid}-${index}`} className="text-xs text-muted-foreground truncate">
                {index + 1}. {meeting.summary}
              </div>
            ))}
            {meetings.length > 5 && (
              <div className="text-xs text-muted-foreground">
                ... and {meetings.length - 5} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 