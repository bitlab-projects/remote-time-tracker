import { WorkSession } from '@/types';

export const exportToCSV = (sessions: WorkSession[]): void => {
  const headers = [
    'Date',
    'Title',
    'Description',
    'Start Time',
    'End Time',
    'Duration (Hours)',
    'Project',
    'Tags'
  ];

  const rows = sessions.map(session => [
    session.date.toISOString().split('T')[0],
    session.title,
    session.description || '',
    session.startTime.toLocaleTimeString(),
    session.endTime.toLocaleTimeString(),
    (session.duration / 60).toFixed(2),
    session.project || '',
    session.tags?.join('; ') || ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `time-tracking-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export interface ImportResult {
  success: boolean;
  sessions: WorkSession[];
  errors: string[];
  imported: number;
  skipped: number;
}

const parseTime = (timeStr: string, date: Date): Date => {
  const time = new Date(date);
  
  // Handle different time formats
  if (timeStr.includes(':')) {
    const [hours, minutes] = timeStr.split(':').map(str => parseInt(str.replace(/\D/g, '')));
    if (!isNaN(hours) && !isNaN(minutes)) {
      time.setHours(hours, minutes, 0, 0);
      return time;
    }
  }
  
  // If parsing fails, return current time
  return new Date(date);
};

const parseDuration = (durationStr: string): number => {
  // Try to parse as decimal hours first
  const decimalHours = parseFloat(durationStr);
  if (!isNaN(decimalHours)) {
    return Math.round(decimalHours * 60); // Convert to minutes
  }
  
  // Try to parse formats like "8h 30m" or "8:30"
  const hourMinMatch = durationStr.match(/(\d+)h?\s*(\d+)?m?/i);
  if (hourMinMatch) {
    const hours = parseInt(hourMinMatch[1]) || 0;
    const minutes = parseInt(hourMinMatch[2]) || 0;
    return hours * 60 + minutes;
  }
  
  return 0;
};

export const importFromCSV = (csvText: string, existingSessions: WorkSession[]): ImportResult => {
  const result: ImportResult = {
    success: false,
    sessions: [],
    errors: [],
    imported: 0,
    skipped: 0
  };

  try {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      result.errors.push('CSV file appears to be empty or has no data rows');
      return result;
    }

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
    
    // Map possible header variations to our expected format
    const headerMap: { [key: string]: string } = {
      'date': 'date',
      'title': 'title',
      'task': 'title',
      'work': 'title',
      'description': 'description',
      'desc': 'description',
      'notes': 'description',
      'start time': 'startTime',
      'start': 'startTime',
      'begin': 'startTime',
      'end time': 'endTime',
      'end': 'endTime',
      'finish': 'endTime',
      'duration': 'duration',
      'duration (hours)': 'duration',
      'hours': 'duration',
      'time': 'duration',
      'project': 'project',
      'client': 'project',
      'tags': 'tags',
      'categories': 'tags',
      'labels': 'tags'
    };

    const columnMap: { [key: string]: number } = {};
    headers.forEach((header, index) => {
      const mappedHeader = headerMap[header];
      if (mappedHeader) {
        columnMap[mappedHeader] = index;
      }
    });

    // Check for required columns
    if (columnMap.title === undefined) {
      result.errors.push('Required column "Title" not found. Please ensure your CSV has a title/task column.');
      return result;
    }

    if (columnMap.date === undefined) {
      result.errors.push('Required column "Date" not found. Please ensure your CSV has a date column.');
      return result;
    }

    const existingSessionIds = new Set(existingSessions.map(s => `${s.date.toDateString()}-${s.title}-${s.startTime.toTimeString()}`));

    for (let i = 1; i < lines.length; i++) {
      try {
        const row = lines[i].split(',').map(cell => cell.replace(/"/g, '').trim());
        
        if (row.length < Math.max(...Object.values(columnMap)) + 1) {
          result.errors.push(`Row ${i + 1}: Insufficient columns`);
          continue;
        }

        const title = row[columnMap.title];
        const dateStr = row[columnMap.date];

        if (!title || !dateStr) {
          result.errors.push(`Row ${i + 1}: Missing required title or date`);
          continue;
        }

        // Parse date
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          result.errors.push(`Row ${i + 1}: Invalid date format "${dateStr}"`);
          continue;
        }

        // Parse times
        let startTime = new Date(date);
        let endTime = new Date(date);
        let duration = 0;

        if (columnMap.startTime !== undefined && row[columnMap.startTime]) {
          startTime = parseTime(row[columnMap.startTime], date);
        } else {
          startTime.setHours(9, 0, 0, 0); // Default to 9 AM
        }

        if (columnMap.endTime !== undefined && row[columnMap.endTime]) {
          endTime = parseTime(row[columnMap.endTime], date);
        } else if (columnMap.duration !== undefined && row[columnMap.duration]) {
          duration = parseDuration(row[columnMap.duration]);
          endTime = new Date(startTime.getTime() + duration * 60000);
        } else {
          endTime.setHours(17, 0, 0, 0); // Default to 5 PM
        }

        // Calculate duration if not already set
        if (duration === 0) {
          duration = Math.max(0, (endTime.getTime() - startTime.getTime()) / (1000 * 60));
        }

        // Parse optional fields
        const description = columnMap.description !== undefined ? row[columnMap.description] : undefined;
        const project = columnMap.project !== undefined ? row[columnMap.project] : undefined;
        const tagsStr = columnMap.tags !== undefined ? row[columnMap.tags] : undefined;
        const tags = tagsStr ? tagsStr.split(/[;,|]/).map(tag => tag.trim()).filter(Boolean) : undefined;

        // Create session ID to check for duplicates
        const sessionId = `${date.toDateString()}-${title}-${startTime.toTimeString()}`;
        
        if (existingSessionIds.has(sessionId)) {
          result.skipped++;
          continue;
        }

        const session: WorkSession = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title,
          description: description || undefined,
          startTime,
          endTime,
          date,
          duration,
          project: project || undefined,
          tags: tags && tags.length > 0 ? tags : undefined
        };

        result.sessions.push(session);
        existingSessionIds.add(sessionId);
        result.imported++;

      } catch (error) {
        result.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    result.success = result.imported > 0;
    
  } catch (error) {
    result.errors.push(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};