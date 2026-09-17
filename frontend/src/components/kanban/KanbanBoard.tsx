import React from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import KanbanColumn from './KanbanColumn';
import { Task } from '../../types';

export interface ColumnDefinition {
  id: string;
  title: string;
}

const COLUMNS: ColumnDefinition[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

export interface KanbanBoardProps {
  tasks?: Task[];
  onStatusChange?: (taskId: string, newStatus: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks = [],
  onStatusChange,
}) => {
  // Configure sensors to avoid triggering drag on slight clicks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (!over) return;

    const taskId = String(active.id);
    const newStatus = String(over.id); // column status

    const currentTask = tasks.find((t) => t._id === taskId);

    if (currentTask && currentTask.status !== newStatus) {
      if (onStatusChange) {
        onStatusChange(taskId, newStatus);
      }
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {/* Mobile: horizontal scroll with snap. md+: 3-column grid */}
      <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto pb-2 md:overflow-visible md:pb-0 snap-x snap-mandatory md:snap-none">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter(
            (t) => (t.status || 'todo').toLowerCase() === col.id
          );
          return (
            <div key={col.id} className="min-w-[280px] sm:min-w-[300px] md:min-w-0 flex-shrink-0 snap-start">
              <KanbanColumn
                status={col.id}
                title={col.title}
                tasks={colTasks}
              />
            </div>
          );
        })}
      </div>
    </DndContext>
  );
};

export default KanbanBoard;
