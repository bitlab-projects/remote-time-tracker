'use client';

import React, { useState, useEffect } from 'react';
import { WorkSession } from '@/types';
import { getStoredSessions, saveSession, deleteSession, clearSessions } from '@/utils/storage';
import { generateCalendarDays } from '@/utils/calendar';
import { exportToCSV } from '@/utils/csv';
import Calendar from '@/components/Calendar';
import SessionForm from '@/components/SessionForm';
import SessionList from '@/components/SessionList';
import ImportDialog from '@/components/ImportDialog';
import { Plus, BrushCleaning, Download, Upload, Clock, Calendar as CalendarIcon, List } from 'lucide-react';
import { addMonths, subMonths } from 'date-fns';

export default function Home() {
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingSession, setEditingSession] = useState<WorkSession | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    setSessions(getStoredSessions());
  }, []);

  const handleSaveSession = (session: WorkSession) => {
    saveSession(session);
    setSessions(getStoredSessions());
    setShowForm(false);
    setEditingSession(undefined);
    setSelectedDate(undefined);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      deleteSession(sessionId);
      setSessions(getStoredSessions());
    }
  };

  const handleClearSessions = () => {
    if (confirm('Are you sure you want to clear all sessions?')) {
      clearSessions();
      setSessions(getStoredSessions());
    }
  };

  const handleImportSessions = (importedSessions: WorkSession[]) => {
    // Save all imported sessions
    importedSessions.forEach(session => saveSession(session));
    setSessions(getStoredSessions());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowForm(true);
  };

  const handleSessionClick = (session: WorkSession) => {
    setEditingSession(session);
    setShowForm(true);
  };

  const handleExportCSV = () => {
    if (sessions.length === 0) {
      alert('No sessions to export');
      return;
    }
    exportToCSV(sessions);
  };

  const calendarDays = generateCalendarDays(currentDate, sessions);
  const totalHours = sessions.reduce((acc, session) => acc + session.duration, 0) / 60;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Time Tracker</h1>
              <p className="text-gray-600">Track your remote work sessions</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock size={16} className="mr-2" />
                  Total: {totalHours.toFixed(1)} hours
                </div>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                New Session
              </button>
              <button
                onClick={() => handleClearSessions()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <BrushCleaning size={16} className="mr-2" />
                Clear Sessions
              </button>
              <button
                onClick={() => setShowImport(true)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Upload size={16} className="mr-2" />
                Import CSV
              </button>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={16} className="mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('calendar')}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'calendar'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CalendarIcon size={16} className="mr-2" />
              Calendar
            </button>
            <button
              onClick={() => setView('list')}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'list'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List size={16} className="mr-2" />
              List
            </button>
          </div>
        </div>

        {view === 'calendar' ? (
          <Calendar
            days={calendarDays}
            currentDate={currentDate}
            onPreviousMonth={() => setCurrentDate(subMonths(currentDate, 1))}
            onNextMonth={() => setCurrentDate(addMonths(currentDate, 1))}
            onDateClick={handleDateClick}
            onSessionClick={handleSessionClick}
          />
        ) : (
          <SessionList
            sessions={sessions}
            onEditSession={handleSessionClick}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {showForm && (
          <SessionForm
            session={editingSession}
            selectedDate={selectedDate}
            onSave={handleSaveSession}
            onCancel={() => {
              setShowForm(false);
              setEditingSession(undefined);
              setSelectedDate(undefined);
            }}
          />
        )}

        {showImport && (
          <ImportDialog
            existingSessions={sessions}
            onImport={handleImportSessions}
            onClose={() => setShowImport(false)}
          />
        )}
      </div>
    </div>
  );
}