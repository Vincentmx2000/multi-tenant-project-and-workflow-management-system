import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/dashboard/StatsCard';
import StatusChart from '../components/dashboard/StatusChart';
import NotificationBell from '../components/layout/NotificationBell';
import { DashboardStats } from '../types';

export const Dashboard: React.FC = () => {
  const { user, role, company, companyName, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyId = () => {
    if (company) {
      navigator.clipboard.writeText(company);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch dashboard statistics';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalProjects = stats?.totalProjects || 0;
  const totalTasks = stats?.totalTasks || 0;
  const overdueTasks = stats?.overdueTasks || 0;
  const tasksByStatus = stats?.tasksByStatus || {};
  const completedTasks = tasksByStatus.done || tasksByStatus.completed || 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navbar / Top Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
              {companyName} &bull; {role || 'Member'} Workspace
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-sm text-slate-500">
              Overview of your company's projects, workflow tasks, and performance.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <NotificationBell align="right" direction="down" />
            <button
              onClick={logout}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* User & Company Metadata Header Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-teal-50/70 p-4 rounded-xl border border-teal-100 flex flex-col justify-center">
            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">User Account</span>
            <p className="text-base font-bold text-slate-900 mt-0.5">{user?.name}</p>
            <p className="text-xs text-slate-600">{user?.email}</p>
          </div>

          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-100 flex flex-col justify-center">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Role Permission</span>
            <p className="text-base font-bold text-slate-900 mt-0.5">{role || 'Member'}</p>
          </div>

          <div className="bg-slate-100/80 p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Company</span>
            <p className="text-base font-bold text-slate-900 mt-0.5 truncate">{companyName}</p>
            {company && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <span className="truncate">
                  <span className="font-medium text-slate-500">ID:</span>{' '}
                  <code className="font-mono text-[11px] text-slate-600 bg-slate-200/70 px-1 py-0.5 rounded">
                    {company}
                  </code>
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-1 text-slate-400 hover:text-teal-600 hover:bg-slate-200 rounded transition-colors shrink-0 flex items-center gap-1"
                  title="Copy Company ID (for inviting teammates)"
                >
                  {copied ? (
                    <span className="text-[10px] text-teal-600 font-bold">Copied!</span>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Metrics Grid */}
        {loading ? (
          <>
            {/* Stats card skeletons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm animate-pulse flex items-center justify-between"
                >
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-24"></div>
                    <div className="h-7 bg-slate-200 rounded w-16"></div>
                    <div className="h-3 bg-slate-100 rounded w-32"></div>
                  </div>
                  <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
                </div>
              ))}
            </div>
            {/* Chart / nav skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-pulse space-y-4">
                <div className="h-5 bg-slate-200 rounded w-48"></div>
                <div className="h-64 bg-slate-100 rounded-xl"></div>
              </div>
              <div className="bg-slate-200 rounded-2xl animate-pulse"></div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Projects"
                value={totalProjects}
                subtitle="Active projects count"
                color="teal"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                }
              />

              <StatsCard
                title="Total Tasks"
                value={totalTasks}
                subtitle="Logged tasks across board"
                color="slate"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                }
              />

              <StatsCard
                title="Completed Tasks"
                value={completedTasks}
                subtitle="Tasks marked as done"
                color="teal"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />

              <StatsCard
                title="Overdue Tasks"
                value={overdueTasks}
                subtitle="Past due date & uncompleted"
                color="rose"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
            </div>

            {/* Charts & Quick Links Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <StatusChart tasksByStatus={tasksByStatus} />
              </div>

              <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-6 text-white shadow-md flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-100">
                    Quick Navigation
                  </span>
                  <h3 className="text-xl font-bold mt-1">Manage Workflows</h3>
                  <p className="text-xs text-teal-100 mt-2 leading-relaxed">
                    View your company projects directory, create tasks, and manage Kanban boards seamlessly.
                  </p>
                </div>

                <div className="pt-6 space-y-3">
                  <Link
                    to="/projects"
                    className="w-full flex items-center justify-between px-4 py-3 bg-white text-teal-700 hover:bg-teal-50 font-bold rounded-xl text-sm transition-colors shadow-sm"
                  >
                    <span>View All Projects</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
