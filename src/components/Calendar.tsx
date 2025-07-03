import React from 'react';
import { CalendarDay, WorkSession } from '../types';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface CalendarProps {
  days: CalendarDay[];
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onDateClick: (date: Date) => void;
  onSessionClick: (session: WorkSession) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  days,
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onDateClick,
  onSessionClick
}) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={onPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button
          onClick={onNextMonth}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {weekDays.map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center text-xs font-medium text-gray-700">
            {day}
          </div>
        ))}
        
        {days.map((day, index) => (
          <div
            key={index}
            className={`bg-white min-h-[120px] p-2 ${
              !day.isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''
            } ${day.isToday ? 'bg-blue-50' : ''} hover:bg-gray-50 cursor-pointer transition-colors`}
            onClick={() => onDateClick(day.date)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm ${day.isToday ? 'font-semibold text-blue-600' : ''}`}>
                {day.date.getDate()}
              </span>
              {day.isCurrentMonth && (
                <Plus size={12} className="text-gray-400 hover:text-blue-500" />
              )}
            </div>
            
            <div className="space-y-1">
              {day.sessions.slice(0, 3).map(session => (
                <div
                  key={session.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSessionClick(session);
                  }}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 cursor-pointer transition-colors"
                >
                  <div className="flex items-center">
                    <Clock size={10} className="mr-1" />
                    {format(session.startTime, 'HH:mm')} - {format(session.endTime, 'HH:mm')}
                  </div>
                  <div className="truncate font-medium">{session.title}</div>
                </div>
              ))}
              {day.sessions.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{day.sessions.length - 3} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;