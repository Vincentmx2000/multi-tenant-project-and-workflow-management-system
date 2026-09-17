import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { ActivityLogItem } from '../../types';

interface ActivityLogProps {
  projectId?: string;
}

const timeAgo = (dateString?: string): string => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
};

export const ActivityLog: React.FC<ActivityLogProps> = ({ projectId }) => {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchActivities = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/activities/project/${projectId}?page=${targetPage}&limit=10`);
      const data = response.data?.data || (Array.isArray(response.data) ? response.data : []);
      const totalP = response.data?.totalPages || 1;
      setLogs(data);
      setTotalPages(totalP);
      setPage(targetPage);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch activity logs';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchActivities(1);
    }
  }, [projectId, fetchActivities]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Activity Log</h3>
            <p className="text-xs text-slate-500">Recent actions and updates on this project</p>
          </div>
        </div>

        <button
          onClick={() => fetchActivities(page)}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Refresh activities"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700 font-bold ml-2">
            &times;
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3 animate-pulse py-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-7 h-7 bg-slate-200 rounded-full shrink-0"></div>
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                <div className="h-2.5 bg-slate-100 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700">No activity yet</p>
          <p className="text-xs text-slate-400">Actions taken on this project will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="divide-y divide-slate-100">
            {logs.map((log) => {
              const userName =
                typeof log.userId === 'object' && log.userId !== null
                  ? log.userId.name || log.userId.email
                  : 'System / User';
              const initial = userName.charAt(0).toUpperCase();

              return (
                <div key={log._id} className="py-3 first:pt-0 last:pb-0 flex items-start space-x-3 group">
                  <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 select-none">
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="font-bold text-slate-800 truncate">{userName}</span>
                      <span
                        className="text-[10px] text-slate-400 shrink-0 font-medium"
                        title={log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}
                      >
                        {timeAgo(log.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug mt-0.5 break-words">
                      {log.action}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                Page <span className="font-semibold text-slate-700">{page}</span> of{' '}
                <span className="font-semibold text-slate-700">{totalPages}</span>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fetchActivities(page - 1)}
                  disabled={page <= 1}
                  className="px-2.5 py-1 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                >
                  Prev
                </button>
                <button
                  onClick={() => fetchActivities(page + 1)}
                  disabled={page >= totalPages}
                  className="px-2.5 py-1 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
