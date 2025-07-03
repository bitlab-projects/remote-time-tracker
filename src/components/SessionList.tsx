import React from 'react';
import { WorkSession } from '../types';
import { Clock, Edit, Trash2, Tag, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

interface SessionListProps {
  sessions: WorkSession[];
  onEditSession: (session: WorkSession) => void;
  onDeleteSession: (sessionId: string) => void;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

const SessionList: React.FC<SessionListProps> = ({ sessions, onEditSession, onDeleteSession, page = 1, pageSize = 5, onPageChange }) => {
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const sortedSessions = [...sessions].sort((a, b) => b.date.getTime() - a.date.getTime());

  // Pagination logic
  const totalPages = Math.ceil(sortedSessions.length / pageSize);
  const pagedSessions = sortedSessions.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      {pagedSessions.map(session => (
        <div key={session.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex-1">
              <div className="flex flex-wrap items-center space-x-2 mb-2">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">{session.title}</h3>
                {session.project && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    <Briefcase size={10} className="mr-1" />
                    {session.project}
                  </span>
                )}
              </div>
              {session.description && (
                <p className="text-xs sm:text-sm text-gray-600 mb-2">{session.description}</p>
              )}
              <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                <span>{format(session.date, 'dd/MM/yyyy')}</span>
                <span className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {session.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="font-medium text-green-600">
                  {formatDuration(session.duration)}
                </span>
              </div>
              {session.tags && session.tags.length > 0 && (
                <div className="flex items-center mt-2">
                  <Tag size={14} className="text-gray-400 mr-2" />
                  <div className="flex flex-wrap gap-1">
                    {session.tags.map(tag => (
                      <span key={tag} className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 ml-0 sm:ml-4">
              <button
                onClick={() => onEditSession(session)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDeleteSession(session.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {sessions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Clock size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No work sessions recorded yet.</p>
          <p className="text-sm">Click on a date in the calendar to add your first session.</p>
        </div>
      )}
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => onPageChange && onPageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => onPageChange && onPageChange(i + 1)}
              className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => onPageChange && onPageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionList;