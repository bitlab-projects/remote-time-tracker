import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { importFromCSV, ImportResult } from '@/utils/csv';
import { WorkSession } from '@/types';
import { clearSessions } from '@/utils/storage';

interface ImportDialogProps {
  existingSessions: WorkSession[];
  onImport: (sessions: WorkSession[]) => void;
  onClose: () => void;
}

const ImportDialog: React.FC<ImportDialogProps> = ({ existingSessions, onImport, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setImportResult({
        success: false,
        sessions: [],
        errors: ['Please select a CSV file'],
        imported: 0,
        skipped: 0
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const text = await file.text();
      const result = importFromCSV(text, existingSessions);
      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: false,
        sessions: [],
        errors: [`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`],
        imported: 0,
        skipped: 0
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (importResult && importResult.success) {
      clearSessions();
      onImport(importResult.sessions);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Import CSV File</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {!importResult && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Supported CSV Format</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Info size={20} className="text-blue-600 mr-3 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="mb-2">Your CSV should include these columns (flexible naming):</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>Date</strong> - Required (YYYY-MM-DD format preferred)</li>
                        <li><strong>Title/Task</strong> - Required (description of work)</li>
                        <li><strong>Start Time</strong> - Optional (HH:MM format)</li>
                        <li><strong>End Time</strong> - Optional (HH:MM format)</li>
                        <li><strong>Duration</strong> - Optional (decimal hours or "8h 30m" format)</li>
                        <li><strong>Project</strong> - Optional</li>
                        <li><strong>Tags</strong> - Optional (comma or semicolon separated)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                {isProcessing ? (
                  <p className="text-gray-600">Processing file...</p>
                ) : (
                  <>
                    <p className="text-gray-600 mb-4">
                      Drag and drop your CSV file here, or click to select
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Upload size={16} className="mr-2" />
                      Select CSV File
                    </button>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </>
          )}

          {importResult && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${
                importResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center">
                  {importResult.success ? (
                    <CheckCircle size={20} className="text-green-600 mr-3" />
                  ) : (
                    <AlertCircle size={20} className="text-red-600 mr-3" />
                  )}
                  <div>
                    <h3 className={`font-medium ${
                      importResult.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {importResult.success ? 'Import Preview' : 'Import Failed'}
                    </h3>
                    <p className={`text-sm ${
                      importResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {importResult.success
                        ? `Found ${importResult.imported} sessions to import, ${importResult.skipped} duplicates skipped`
                        : 'Unable to import sessions from the CSV file'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Warnings & Errors:</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {importResult.errors.map((error, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {importResult.success && importResult.sessions.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Sessions to Import:</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {importResult.sessions.slice(0, 10).map((session, index) => (
                      <div key={index} className="bg-white p-3 rounded border text-sm">
                        <div className="font-medium">{session.title}</div>
                        <div className="text-gray-600">
                          {session.date.toLocaleDateString()} • 
                          {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {session.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 
                          {(session.duration / 60).toFixed(1)}h
                          {session.project && ` • ${session.project}`}
                        </div>
                      </div>
                    ))}
                    {importResult.sessions.length > 10 && (
                      <div className="text-center text-gray-500 text-sm">
                        ... and {importResult.sessions.length - 10} more sessions
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setImportResult(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Try Again
                </button>
                {importResult.success && (
                  <button
                    onClick={handleConfirmImport}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                  >
                    Import {importResult.imported} Sessions
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportDialog;