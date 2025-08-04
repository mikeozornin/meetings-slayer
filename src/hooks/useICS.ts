import { useState, useCallback } from 'react';

interface Meeting {
  uid: string;
  summary: string;
  startTime: Date;
  endTime: Date;
  description?: string;
}

import { parseICSFile, validateICSFile, createSampleICS } from '../utils/icsParser';

interface UseICSReturn {
  meetings: Meeting[];
  isLoading: boolean;
  error: string | null;
  loadICSFile: (file: File) => Promise<void>;
  loadSampleMeetings: () => void;
  clearMeetings: () => void;
}

export const useICS = (): UseICSReturn => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadICSFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    console.log('📁 Loading ICS file:', file.name, 'Size:', file.size, 'bytes');

    try {
      const content = await file.text();
      console.log('📄 File content length:', content.length, 'characters');
      
      // Валидируем файл
      const validation = validateICSFile(content);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid ICS file');
      }

      console.log('✅ File validation passed');

      // Парсим встречи
      const parsedMeetings = parseICSFile(content);
      
      console.log('📊 Parsing results:', {
        totalMeetings: parsedMeetings.length,
        firstMeeting: parsedMeetings[0],
        lastMeeting: parsedMeetings[parsedMeetings.length - 1]
      });
      
      if (parsedMeetings.length === 0) {
        throw new Error('No meetings found in the file');
      }

      setMeetings(parsedMeetings);
      console.log('✅ Meetings loaded successfully');
    } catch (err) {
      console.error('❌ Error loading ICS file:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ICS file');
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSampleMeetings = useCallback(() => {
    setIsLoading(true);
    setError(null);

    try {
      const sampleContent = createSampleICS();
      const parsedMeetings = parseICSFile(sampleContent);
      setMeetings(parsedMeetings);
    } catch (err) {
      setError('Failed to load sample meetings');
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMeetings = useCallback(() => {
    setMeetings([]);
    setError(null);
  }, []);

  return {
    meetings,
    isLoading,
    error,
    loadICSFile,
    loadSampleMeetings,
    clearMeetings,
  };
}; 