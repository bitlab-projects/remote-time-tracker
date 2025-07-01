import React from 'react';
import { WorkSession } from '../types';
import { Clock, Edit, Trash2, Tag, Briefcase } from 'lucide-react';

interface SessionListProps {
  sessions: WorkSession[];
  onEditSession: (session: WorkSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

const SessionList: React.FC<SessionListProps> = ({ sessions, onEditSession, onDeleteSession }) => {
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const sortedSessions = [...sessions].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-4">
      {sortedSessions.map(session => (
        <div key={session.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-medium text-gray-900">{session.title}</h3>
                {session.project && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    <Briefcase size={10} className="mr-1" />
                    {session.project}
                  </span>
                )}
              </div>
              
              {session.description && (
                <p className="text-sm text-gray-600 mb-2">{session.description}</p>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{session.date.toLocaleDateString()}</span>
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
            
            <div className="flex items-center space-x-2 ml-4">
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
    </div>
  );
};

export default SessionList;