import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';
import { Task } from '../../types';

export interface KanbanColumnProps {
  status: string;
  title: string;
  tasks?: Task[];
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  tasks = [],
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  const getHeaderColor = (colStatus: string): string => {
    switch (colStatus) {
      case 'todo':
        return 'border-t-slate-400 bg-slate-100/70 text-slate-800';
      case 'in-progress':
        return 'border-t-amber-500 bg-amber-50/50 text-amber-900';
      case 'done':
        return 'border-t-teal-600 bg-teal-50/50 text-teal-900';
      default:
        return 'border-t-slate-400 bg-slate-100/70 text-slate-800';
    }
  };

  return (
    <div className="flex flex-col bg-slate-100/70 rounded-2xl border border-slate-200/80 min-h-[500px] overflow-hidden">
      {/* Column Header */}
      <div
        className={`p-4 border-t-4 border-b border-slate-200/80 flex items-center justify-between ${getHeaderColor(
          status
        )}`}
      >
        <h3 className="font-bold text-sm tracking-wide">{title}</h3>
        <span className="bg-white/80 backdrop-blur-sm text-slate-700 font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-slate-200">
          {tasks.length}
        </span>
      </div>

      {/* Droppable Task Container */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 space-y-3 transition-colors ${
          isOver ? 'bg-teal-50/60 ring-2 ring-teal-500 ring-inset' : ''
        }`}
      >
        {tasks.length === 0 ? (
          <div className="h-32 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs font-medium text-slate-400">
            Drop task here
          </div>
        ) : (
          tasks.map((task) => <TaskCard key={task._id} task={task} />)
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
