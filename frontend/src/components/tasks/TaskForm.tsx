import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Task, User } from '../../types';

export interface TaskFormProps {
  projectId: string;
  onClose?: () => void;
  onSuccess?: (task: Task) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ projectId, onClose, onSuccess }) => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    labels: '',
    assignedTo: currentUser?._id || '',
  });

  const [members, setMembers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get('/company/users');
        setMembers(res.data || []);
      } catch (err) {
        console.error('Failed to fetch company members:', err);
      }
    };
    fetchMembers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const labelsArray = formData.labels
        ? formData.labels.split(',').map((l) => l.trim()).filter(Boolean)
        : [];

      const payload = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate || undefined,
        labels: labelsArray,
        projectId,
        assignedTo: formData.assignedTo || undefined,
      };

      const response = await api.post('/tasks', payload);
      setIsSubmitting(false);

      if (onSuccess) {
        onSuccess(response.data);
      }
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      setIsSubmitting(false);
      const message = err.response?.data?.message || 'Failed to create task';
      setError(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">Add New Task</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Implement user login API"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm outline-none transition-all text-slate-900 placeholder-slate-400"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Task details and acceptance criteria..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm outline-none transition-all resize-none text-slate-900 placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm outline-none transition-all bg-white text-slate-900"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label htmlFor="assignedTo" className="block text-sm font-semibold text-slate-700 mb-1">
                Assignee
              </label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm outline-none transition-all bg-white text-slate-900"
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-semibold text-slate-700 mb-1">
                Due Date
              </label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm outline-none transition-all text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="labels" className="block text-sm font-semibold text-slate-700 mb-1">
                Labels <span className="text-xs text-slate-400 font-normal">(comma-separated)</span>
              </label>
              <input
                id="labels"
                name="labels"
                type="text"
                value={formData.labels}
                onChange={handleChange}
                placeholder="e.g. backend, auth, urgent"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm outline-none transition-all text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
