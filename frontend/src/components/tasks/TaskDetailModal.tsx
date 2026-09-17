import React from 'react';
import CommentSection from './CommentSection';
import { Task } from '../../types';

export interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
}

// Priority badge helper (matches TaskCard colour system)
const getPriorityBadge = (priority?: string): string => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'medium':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'low':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

// Status badge helper
const getStatusBadge = (status?: string): string => {
  switch (status?.toLowerCase()) {
    case 'in-progress':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'done':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    default:
      return 'bg-slate-100 text-slate-500 border-slate-200';
  }
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  if (!task) return null;

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal panel */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg font-extrabold text-slate-900 leading-snug">{task.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label="Close task detail"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Badges row */}
          <div className="flex flex-wrap gap-2">
            {task.status && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                  task.status
                )}`}
              >
                {task.status}
              </span>
            )}
            {task.priority && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide border ${getPriorityBadge(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
            )}
          </div>

          {/* Description */}
          {task.description ? (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Description
              </p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No description provided.</p>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            {formattedDueDate && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Due Date
                </p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {formattedDueDate}
                </div>
              </div>
            )}

            {task.createdAt && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Created
                </p>
                <p className="text-xs font-semibold text-slate-700">
                  {new Date(task.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Labels
              </p>
              <div className="flex flex-wrap gap-1.5">
                {task.labels.map((label, i) => (
                  <span
                    key={i}
                    className="bg-teal-50 text-teal-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-100"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <CommentSection taskId={task._id} />
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
