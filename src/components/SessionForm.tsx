import React, { useState } from 'react';
import { WorkSession } from '../types';
import { X, Clock, Calendar, FileText, Tag, Briefcase } from 'lucide-react';

interface SessionFormProps {
  session?: WorkSession;
  onSave: (session: WorkSession) => void;
  onCancel: () => void;
  selectedDate?: Date;
}

const SessionForm: React.FC<SessionFormProps> = ({ session, onSave, onCancel, selectedDate }) => {
  const [title, setTitle] = useState(session?.title || '');
  const [description, setDescription] = useState(session?.description || '');
  const [startTime, setStartTime] = useState(
    session?.startTime ? session.startTime.toTimeString().slice(0, 5) : '09:00'
  );
  const [endTime, setEndTime] = useState(
    session?.endTime ? session.endTime.toTimeString().slice(0, 5) : '17:00'
  );
  const getDate = (date: Date) => {
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - (offset*60*1000));
    return date.toISOString().split('T')[0];
  }
  const [date, setDate] = useState(
    getDate(session?.date || selectedDate || new Date())
  );
  console.log('date', date);
  const [project, setProject] = useState(session?.project || '');
  const [tagsString, setTagsString] = useState(session?.tags?.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const sessionDate = new Date(date);
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startDateTime = new Date(sessionDate);
    startDateTime.setHours(startHour, startMin, 0, 0);

    const endDateTime = new Date(sessionDate);
    endDateTime.setHours(endHour, endMin, 0, 0);

    const duration = Math.max(0, (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60));

    const newSession: WorkSession = {
      id: session?.id || Date.now().toString(),
      title: title.trim(),
      description: description.trim() || undefined,
      startTime: startDateTime,
      endTime: endDateTime,
      date: sessionDate,
      duration,
      project: project.trim() || undefined,
      tags: tagsString.trim() ? tagsString.split(',').map(tag => tag.trim()).filter(Boolean) : undefined
    };

    onSave(newSession);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {session ? 'Edit Session' : 'New Work Session'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="mr-2" />
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What did you work on?"
              required
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="mr-2" />
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional details..."
              rows={3}
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="mr-2" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} className="mr-2" />
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} className="mr-2" />
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Briefcase size={16} className="mr-2" />
              Project
            </label>
            <input
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Project name"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Tag size={16} className="mr-2" />
              Tags
            </label>
            <input
              type="text"
              value={tagsString}
              onChange={(e) => setTagsString(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Separate tags with commas"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {session ? 'Update' : 'Create'} Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionForm;