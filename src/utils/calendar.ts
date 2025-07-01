import { WorkSession, CalendarDay } from '../types';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';

export const generateCalendarDays = (currentDate: Date, sessions: WorkSession[]): CalendarDay[] => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return days.map(date => ({
    date,
    sessions: sessions.filter(session => isSameDay(session.date, date)),
    isCurrentMonth: isSameMonth(date, currentDate),
    isToday: isToday(date)
  }));
};