import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import KanbanBoard from '../components/kanban/KanbanBoard';
import TaskForm from '../components/tasks/TaskForm';
import ActivityLog from '../components/activity/ActivityLog';
import { Project, Task } from '../types';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);

  const canAddTask = role && ['owner', 'admin', 'manager'].includes(role.toLowerCase());

  const fetchProjectData = async () => {
    setLoading(true);
    setError('');
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?projectId=${id}&limit=100`),
      ]);

      setProject(projRes.data);

      const fetchedTasks: Task[] =
        tasksRes.data?.data || (Array.isArray(tasksRes.data) ? tasksRes.data : []);
      // Filter client-side as safety fallback
      const projectTasks = fetchedTasks.filter(
        (t) =>
          t.projectId === id ||
          (typeof t.projectId === 'object' && (t.projectId as any)?._id === id)
      );
      setTasks(projectTasks);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch project details';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectData();
    }
  }, [id]);

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    // Save previous tasks state for rollback
    const previousTasks = [...tasks];

    // Optimistic UI update
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
    } catch (err: any) {
      // Revert optimistic update on failure
      setTasks(previousTasks);
      const message = err.response?.data?.message || 'Failed to update task status';
      setError(message);
      // Auto-clear error after 4 seconds
      setTimeout(() => setError(''), 4000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
          {/* Header skeleton */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="h-3 bg-slate-200 rounded w-32"></div>
            <div className="h-7 bg-slate-200 rounded w-64"></div>
            <div className="h-3 bg-slate-100 rounded w-full max-w-lg"></div>
            <div className="pt-4 border-t border-slate-100 flex gap-8">
              <div className="h-3 bg-slate-100 rounded w-32"></div>
              <div className="h-3 bg-slate-100 rounded w-24"></div>
            </div>
          </div>
          {/* Kanban columns skeleton */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="h-5 bg-slate-200 rounded w-32 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-slate-100 rounded-xl p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-20 mb-4"></div>
                  {Array.from({ length: 2 }).map((__, j) => (
                    <div key={j} className="bg-white rounded-lg p-3 shadow-sm space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md text-center shadow-sm">
          <h2 className="text-xl font-bold text-rose-600 mb-2">Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <Link
            to="/projects"
            className="inline-block px-4 py-2 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const formattedDeadline = project?.deadline
    ? new Date(project.deadline).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not set';

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Error Alert for transient failures */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700 font-bold">
              &times;
            </button>
          </div>
        )}

        {/* Header Navigation & Project Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-600 mb-3">
            <Link to="/projects" className="hover:underline flex items-center">
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Projects
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 font-normal">{project?.title}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl font-extrabold text-slate-900">{project?.title}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                  {project?.status || 'Active'}
                </span>
              </div>
              <p className="text-sm text-slate-600 max-w-3xl">
                {project?.description || 'No description provided.'}
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              {canAddTask && (
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="inline-flex items-center px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Task
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-500">
            <div>
              <span className="font-semibold text-slate-700">Deadline:</span> {formattedDeadline}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Total Tasks:</span> {tasks.length}
            </div>
          </div>
        </div>

        {/* Kanban Board Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Task Board</h2>
              <p className="text-xs text-slate-500">Drag and drop tasks between columns to update their status</p>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-teal-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">No tasks yet</h3>
              <p className="text-sm text-slate-500 mb-5 max-w-xs">
                {canAddTask
                  ? 'This project has no tasks. Add your first task to start tracking work on the Kanban board.'
                  : 'This project has no tasks logged yet.'}
              </p>
              {canAddTask && (
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-all"
                >
                  Add First Task
                </button>
              )}
            </div>
          ) : (
            <KanbanBoard tasks={tasks} onStatusChange={handleTaskStatusChange} />
          )}
        </div>

        {/* Activity Log Section */}
        {id && <ActivityLog projectId={id} />}

        {/* Task Form Modal */}
        {isTaskModalOpen && id && (
          <TaskForm
            projectId={id}
            onClose={() => setIsTaskModalOpen(false)}
            onSuccess={handleTaskCreated}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
