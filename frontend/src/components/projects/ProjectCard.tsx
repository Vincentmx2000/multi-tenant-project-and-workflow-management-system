import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../types';

export interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status?: string): string => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'in-progress':
      case 'active':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'on-hold':
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formattedDeadline = project.deadline
    ? new Date(project.deadline).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'No deadline';

  return (
    <div
      onClick={() => navigate(`/projects/${project._id}`)}
      className="bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-slate-900 truncate pr-2" title={project.title}>
            {project.title}
          </h3>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
              project.status
            )}`}
          >
            {project.status || 'Active'}
          </span>
        </div>

        {project.description && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-4">
            {project.description}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Due: {formattedDeadline}</span>
        </div>

        {project.members && project.members.length > 0 && (
          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
            {project.members.length} {project.members.length === 1 ? 'member' : 'members'}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
