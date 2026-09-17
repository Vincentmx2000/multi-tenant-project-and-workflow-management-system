import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import TaskDetailModal from '../tasks/TaskDetailModal';
import { Task } from '../../types';

export interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    data: { task },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

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

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const handleCardClick = (): void => {
    if (!isDragging) {
      setModalOpen(true);
    }
  };

  return (
    <>
      {/* Whole card is draggable & clickable */}
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={handleCardClick}
        className={`bg-white rounded-xl shadow-sm hover:shadow border border-slate-200 p-4 cursor-grab active:cursor-grabbing transition-all select-none ${
          isDragging ? 'shadow-lg border-teal-300 ring-2 ring-teal-500/20 z-50' : ''
        }`}
      >
        <div className="flex justify-between items-start mb-2 gap-2">
          <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
            {task.title}
          </h4>
          {task.priority && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border shrink-0 ${getPriorityBadge(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          )}
        </div>

        {task.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.labels.map((label, index) => (
              <span
                key={index}
                className="bg-teal-50 text-teal-700 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-teal-100"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          {formattedDueDate ? (
            <div className="flex items-center space-x-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formattedDueDate}</span>
            </div>
          ) : (
            <div />
          )}

          <span className="text-teal-600 font-semibold flex items-center gap-0.5 text-[10px]">
            View
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>

      {/* Task detail modal */}
      {modalOpen && (
        <TaskDetailModal task={task} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
};

export default TaskCard;
