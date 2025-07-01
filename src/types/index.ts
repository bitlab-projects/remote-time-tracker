export interface WorkSession {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  date: Date;
  duration: number; // in minutes
  project?: string;
  tags?: string[];
}

export interface CalendarDay {
  date: Date;
  sessions: WorkSession[];
  isCurrentMonth: boolean;
  isToday: boolean;
}
