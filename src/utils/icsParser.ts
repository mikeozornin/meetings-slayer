import ICAL from 'ical.js';

// Define proper types
interface Meeting {
  uid: string;
  summary: string;
  startTime: Date;
  endTime: Date;
  description?: string;
}

// Парсер ICS файлов с использованием ical.js
export const parseICSFile = (icsContent: string): Meeting[] => {
  console.log('📄 Starting ICS parsing with ical.js...');
  console.log('📄 ICS content length:', icsContent.length);
  console.log('📄 ICS content preview:', icsContent.substring(0, 200) + '...');
  
  try {
    // Парсим ICS контент в jCal формат
    const jcalData = ICAL.parse(icsContent);
    console.log('📄 jCal data parsed successfully');
    
    // Создаем объект календаря из jCal данных
    const calendar = new ICAL.Component(jcalData);
    console.log('📄 Calendar component created');
    
    const meetings: Meeting[] = [];
    
    // Получаем все события из календаря
    const eventComponents = calendar.getAllSubcomponents('vevent');
    console.log(`📅 Found ${eventComponents.length} events in calendar`);
    
    eventComponents.forEach((eventComponent: ICAL.Component, index: number) => {
      try {
        const event = new ICAL.Event(eventComponent);
        console.log(`📅 Processing event ${index + 1}:`, event.summary);
        
        const meeting: Meeting = {
          uid: event.uid,
          summary: event.summary,
          startTime: event.startDate.toJSDate(),
          endTime: event.endDate.toJSDate(),
          description: event.description
        };
        
        meetings.push(meeting);
        
        // Логируем первые 5 встреч для отладки
        if (index < 5) {
          console.log(`📅 Parsed meeting ${index + 1}:`, {
            summary: meeting.summary,
            startTime: meeting.startTime,
            endTime: meeting.endTime,
            uid: meeting.uid
          });
        }
      } catch (error) {
        console.warn('⚠️ Error parsing event:', error);
      }
    });
    
    console.log(`✅ Parsed ${meetings.length} meetings from ${eventComponents.length} events`);
    
    // Проверяем на дубликаты UID
    const uidCounts: { [key: string]: number } = {};
    meetings.forEach(meeting => {
      uidCounts[meeting.uid] = (uidCounts[meeting.uid] || 0) + 1;
    });
    
    const duplicates = Object.entries(uidCounts).filter(([, count]) => count > 1);
    if (duplicates.length > 0) {
      console.warn('⚠️ Found duplicate UIDs:', duplicates.map(([uid, count]) => `${uid} (${count} times)`));
    }
    
    return meetings;
  } catch (error) {
    console.error('❌ Error parsing ICS file:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return [];
  }
};

// Создание примера ICS файла для тестирования
export const createSampleICS = (): string => {
  // Получаем текущий понедельник
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);
  
  // Генерируем даты для текущей недели
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  };

  const mondayStr = formatDate(monday);
  const tuesday = new Date(monday);
  tuesday.setDate(monday.getDate() + 1);
  const tuesdayStr = formatDate(tuesday);
  
  const wednesday = new Date(monday);
  wednesday.setDate(monday.getDate() + 2);
  const wednesdayStr = formatDate(wednesday);
  
  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);
  const thursdayStr = formatDate(thursday);
  
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const fridayStr = formatDate(friday);

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Meetings Slayer//EN
BEGIN:VEVENT
UID:meeting-1@company.com
DTSTAMP:${mondayStr}T120000Z
DTSTART:${mondayStr}T090000Z
DTEND:${mondayStr}T093000Z
SUMMARY:Daily Standup - Team Phoenix
DESCRIPTION:Scrum daily standup meeting
END:VEVENT
BEGIN:VEVENT
UID:meeting-2@company.com
DTSTAMP:${mondayStr}T120000Z
DTSTART:${mondayStr}T100000Z
DTEND:${mondayStr}T110000Z
SUMMARY:Code Review: Auth Module
DESCRIPTION:Code review session
END:VEVENT
BEGIN:VEVENT
UID:meeting-3@company.com
DTSTAMP:${mondayStr}T120000Z
DTSTART:${mondayStr}T140000Z
DTEND:${mondayStr}T153000Z
SUMMARY:Sprint Planning - Q1 2025
DESCRIPTION:Planning meeting for Q1 2025
END:VEVENT
BEGIN:VEVENT
UID:meeting-4@company.com
DTSTAMP:${tuesdayStr}T120000Z
DTSTART:${tuesdayStr}T090000Z
DTEND:${tuesdayStr}T100000Z
SUMMARY:Product Demo
DESCRIPTION:Demo to stakeholders
END:VEVENT
BEGIN:VEVENT
UID:meeting-5@company.com
DTSTAMP:${tuesdayStr}T120000Z
DTSTART:${tuesdayStr}T110000Z
DTEND:${tuesdayStr}T120000Z
SUMMARY:Tech Debt Discussion
DESCRIPTION:Review technical debt items
END:VEVENT
BEGIN:VEVENT
UID:meeting-6@company.com
DTSTAMP:${tuesdayStr}T120000Z
DTSTART:${tuesdayStr}T160000Z
DTEND:${tuesdayStr}T170000Z
SUMMARY:Security Audit Meeting
DESCRIPTION:Security vulnerabilities discussion
END:VEVENT
BEGIN:VEVENT
UID:meeting-7@company.com
DTSTAMP:${wednesdayStr}T120000Z
DTSTART:${wednesdayStr}T090000Z
DTEND:${wednesdayStr}T100000Z
SUMMARY:API Design Review
DESCRIPTION:Review new REST API endpoints
END:VEVENT
BEGIN:VEVENT
UID:meeting-8@company.com
DTSTAMP:${wednesdayStr}T120000Z
DTSTART:${wednesdayStr}T140000Z
DTEND:${wednesdayStr}T150000Z
SUMMARY:Performance Optimization
DESCRIPTION:Application bottlenecks discussion
END:VEVENT
BEGIN:VEVENT
UID:meeting-9@company.com
DTSTAMP:${thursdayStr}T120000Z
DTSTART:${thursdayStr}T090000Z
DTEND:${thursdayStr}T100000Z
SUMMARY:Database Migration Planning
DESCRIPTION:PostgreSQL to MongoDB migration
END:VEVENT
BEGIN:VEVENT
UID:meeting-10@company.com
DTSTAMP:${thursdayStr}T120000Z
DTSTART:${thursdayStr}T140000Z
DTEND:${thursdayStr}T150000Z
SUMMARY:Release Planning
DESCRIPTION:Upcoming v2.0 release cycle
END:VEVENT
BEGIN:VEVENT
UID:meeting-11@company.com
DTSTAMP:${fridayStr}T120000Z
DTSTART:${fridayStr}T090000Z
DTEND:${fridayStr}T100000Z
SUMMARY:UX Research Findings
DESCRIPTION:User experience research results
END:VEVENT
BEGIN:VEVENT
UID:meeting-12@company.com
DTSTAMP:${fridayStr}T120000Z
DTSTART:${fridayStr}T160000Z
DTEND:${fridayStr}T170000Z
SUMMARY:End of Week Wrap-up
DESCRIPTION:Weekly team wrap-up
END:VEVENT
END:VCALENDAR`;
};

// Валидация ICS файла
export const validateICSFile = (icsContent: string): { isValid: boolean; error?: string } => {
  if (!icsContent.includes('BEGIN:VCALENDAR')) {
    return { isValid: false, error: 'Invalid ICS file: missing VCALENDAR header' };
  }
  
  if (!icsContent.includes('END:VCALENDAR')) {
    return { isValid: false, error: 'Invalid ICS file: missing VCALENDAR footer' };
  }
  
  const events = icsContent.match(/BEGIN:VEVENT/g);
  if (!events || events.length === 0) {
    return { isValid: false, error: 'No events found in ICS file' };
  }
  
  return { isValid: true };
};

// Test function to verify parsing works
export const testParsing = (): void => {
  console.log('🧪 Testing ICS parsing...');
  const sampleICS = createSampleICS();
  const meetings = parseICSFile(sampleICS);
  console.log('🧪 Test result:', meetings.length, 'meetings parsed');
  if (meetings.length > 0) {
    console.log('🧪 First meeting:', meetings[0]);
  }
}; 