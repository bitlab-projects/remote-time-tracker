import React, { useMemo, useState } from 'react';
import { getStoredSessions, saveSession, deleteSession } from '../utils/storage';
import { WorkSession } from '../types';
import SessionList from './SessionList';
import { startOfWeek, endOfWeek, format, addWeeks, subWeeks, addMonths, subMonths, parse } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SessionForm from './SessionForm';

// Helper to group sessions by week
function groupSessionsByWeek(sessions: WorkSession[]) {
  const weeks: { [key: string]: WorkSession[] } = {};
  sessions.forEach(session => {
    const weekStart = startOfWeek(session.date, { weekStartsOn: 1 });
    const weekKey = format(weekStart, 'dd/MM/yyyy');
    if (!weeks[weekKey]) weeks[weekKey] = [];
    weeks[weekKey].push(session);
  });
  return weeks;
}

// Helper to group sessions by month
function groupSessionsByMonth(sessions: WorkSession[]) {
  const months: { [key: string]: WorkSession[] } = {};
  sessions.forEach(session => {
    const monthKey = format(session.date, 'MM/yyyy');
    if (!months[monthKey]) months[monthKey] = [];
    months[monthKey].push(session);
  });
  return months;
}

function getSummary(sessions: WorkSession[]) {
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  return {
    totalHours: (totalMinutes / 60).toFixed(2),
    sessionCount: sessions.length,
  };
}

const Report: React.FC = () => {
  const [sessions, setSessions] = useState<WorkSession[]>(getStoredSessions());
  const weeks = useMemo(() => groupSessionsByWeek(sessions), [sessions]);
  const months = useMemo(() => groupSessionsByMonth(sessions), [sessions]);
  const weekKeys = useMemo(() => Object.keys(weeks).sort((a, b) => b.localeCompare(a)), [weeks]);
  const monthKeys = useMemo(() => Object.keys(months).sort((a, b) => b.localeCompare(a)), [months]);

  const [weekPages, setWeekPages] = useState<{ [key: string]: number }>({});
  const [monthPages, setMonthPages] = useState<{ [key: string]: number }>({});
  const pageSize = 5;
  const [reportType, setReportType] = useState<'week' | 'month'>('week');

  // Track current week/month index
  const [currentWeekIdx, setCurrentWeekIdx] = useState(0);
  const [currentMonthIdx, setCurrentMonthIdx] = useState(0);

  // Edit/delete handlers
  const [editingSession, setEditingSession] = useState<WorkSession | null>(null);
  const handleEditSession = (session: WorkSession) => {
    setEditingSession(session);
  };
  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      deleteSession(sessionId);
      setSessions(getStoredSessions());
    }
  };
  const handleSaveSession = (session: WorkSession) => {
    saveSession(session);
    setSessions(getStoredSessions());
    setEditingSession(null);
  };

  // Handlers for period navigation
  const handlePrevPeriod = () => {
    if (reportType === 'week') {
      setCurrentWeekIdx(idx => Math.min(idx + 1, weekKeys.length - 1));
    } else {
      setCurrentMonthIdx(idx => Math.min(idx + 1, monthKeys.length - 1));
    }
  };
  const handleNextPeriod = () => {
    if (reportType === 'week') {
      setCurrentWeekIdx(idx => Math.max(idx - 1, 0));
    } else {
      setCurrentMonthIdx(idx => Math.max(idx - 1, 0));
    }
  };

  // Reset index when switching report type
  React.useEffect(() => {
    setCurrentWeekIdx(0);
    setCurrentMonthIdx(0);
  }, [reportType, weekKeys.length, monthKeys.length]);

  // Pagination handlers
  const handleWeekPageChange = (weekKey: string, page: number) => {
    setWeekPages(prev => ({ ...prev, [weekKey]: page }));
  };
  const handleMonthPageChange = (monthKey: string, page: number) => {
    setMonthPages(prev => ({ ...prev, [monthKey]: page }));
  };

  // Get current period key and sessions
  const currentWeekKey = weekKeys[currentWeekIdx] || '';
  const currentMonthKey = monthKeys[currentMonthIdx] || '';
  const currentWeekSessions = weeks[currentWeekKey] || [];
  const currentMonthSessions = months[currentMonthKey] || [];
  const weekPage = weekPages[currentWeekKey] || 1;
  const monthPage = monthPages[currentMonthKey] || 1;

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-8 px-2 sm:px-0">
      <div className="flex flex-wrap gap-2 sm:gap-4 items-center mb-6 sm:mb-8">
        <button
          className={`px-3 py-2 sm:px-4 sm:py-2 rounded font-medium border transition-colors text-xs sm:text-base ${
            reportType === 'week'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
          onClick={() => setReportType('week')}
        >
          Weekly
        </button>
        <button
          className={`px-3 py-2 sm:px-4 sm:py-2 rounded font-medium border transition-colors text-xs sm:text-base ${
            reportType === 'month'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
          onClick={() => setReportType('month')}
        >
          Monthly
        </button>
      </div>

      {reportType === 'week' && weekKeys.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handlePrevPeriod}
              disabled={currentWeekIdx === weekKeys.length - 1}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
              aria-label="Previous week"
            >
              <ChevronLeft />
            </button>
            <h3 className="text-lg font-semibold">
              Week: {currentWeekKey} → {format(endOfWeek(parse(currentWeekKey, 'dd/MM/yyyy', new Date()), { weekStartsOn: 1 }), 'dd/MM/yyyy')}
            </h3>
            <button
              onClick={handleNextPeriod}
              disabled={currentWeekIdx === 0}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
              aria-label="Next week"
            >
              <ChevronRight />
            </button>
          </div>
          <div className="flex items-center justify-end mb-2 text-sm text-gray-600">
            <span className="mr-4">Total hours: <b>{getSummary(currentWeekSessions).totalHours}</b></span>
            <span>Sessions: <b>{getSummary(currentWeekSessions).sessionCount}</b></span>
          </div>
          <SessionList
            sessions={currentWeekSessions}
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
            page={weekPage}
            pageSize={pageSize}
            onPageChange={p => handleWeekPageChange(currentWeekKey, p)}
          />
        </div>
      )}

      {reportType === 'month' && monthKeys.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handlePrevPeriod}
              disabled={currentMonthIdx === monthKeys.length - 1}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
              aria-label="Previous month"
            >
              <ChevronLeft />
            </button>
            <h3 className="text-lg font-semibold">
              Month: {currentMonthKey}
            </h3>
            <button
              onClick={handleNextPeriod}
              disabled={currentMonthIdx === 0}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
              aria-label="Next month"
            >
              <ChevronRight />
            </button>
          </div>
          <div className="flex items-center justify-end mb-2 text-sm text-gray-600">
            <span className="mr-4">Total hours: <b>{getSummary(currentMonthSessions).totalHours}</b></span>
            <span>Sessions: <b>{getSummary(currentMonthSessions).sessionCount}</b></span>
          </div>
          <SessionList
            sessions={currentMonthSessions}
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
            page={monthPage}
            pageSize={pageSize}
            onPageChange={p => handleMonthPageChange(currentMonthKey, p)}
          />
        </div>
      )}

      {/* Edit form modal */}
      {editingSession && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Edit Session</h2>
            <SessionForm
              session={editingSession}
              onSave={handleSaveSession}
              onCancel={() => setEditingSession(null)}
            />
          </div>
        </div>
      )}

      {/* No data message */}
      {((reportType === 'week' && weekKeys.length === 0) || (reportType === 'month' && monthKeys.length === 0)) && (
        <div className="text-center py-12 text-gray-500">
          <p>No sessions found for this report type.</p>
        </div>
      )}
    </div>
  );
};

export default Report; 