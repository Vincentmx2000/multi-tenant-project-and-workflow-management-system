import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectForm from '../components/projects/ProjectForm';
import { Project } from '../types';

export const Projects: React.FC = () => {
  const { role } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const canCreateProject = role && ['owner', 'admin'].includes(role.toLowerCase());

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/projects');
      // Backend returns { data: [...projects], total, page, totalPages }
      const list = response.data?.data || (Array.isArray(response.data) ? response.data : []);
      setProjects(list);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch projects';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectCreated = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <Link
                to="/dashboard"
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Company Projects</h1>
            <p className="text-sm text-slate-500">Manage and track your team projects and workflows</p>
          </div>

          {canCreateProject && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all hover:shadow-teal-100"
            >
              <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Project
            </button>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Main Content Area */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 animate-pulse"
              >
                <div className="flex justify-between items-start">
                  <div className="h-5 bg-slate-200 rounded-lg w-2/3"></div>
                  <div className="h-5 bg-slate-100 rounded-full w-16"></div>
                </div>
                <div className="h-3 bg-slate-100 rounded w-full"></div>
                <div className="h-3 bg-slate-100 rounded w-4/5"></div>
                <div className="pt-3 border-t border-slate-100 flex justify-between">
                  <div className="h-3 bg-slate-100 rounded w-24"></div>
                  <div className="h-3 bg-slate-100 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-teal-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Projects Found</h3>
            <p className="text-sm text-slate-500 mb-6">
              {canCreateProject
                ? 'Get started by creating your first project for your organization.'
                : 'No projects available in your organization yet.'}
            </p>
            {canCreateProject && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-all"
              >
                Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}

        {/* Create Modal */}
        {isModalOpen && (
          <ProjectForm
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleProjectCreated}
          />
        )}
      </div>
    </div>
  );
};

export default Projects;
