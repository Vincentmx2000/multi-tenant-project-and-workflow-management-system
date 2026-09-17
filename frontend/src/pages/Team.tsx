import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Role, User } from '../types';

const ROLES: Role[] = ['Owner', 'Admin', 'Manager', 'Member'];

export const Team: React.FC = () => {
  const { user, role, company, companyName } = useAuth();
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const isOwner = role && role.toLowerCase() === 'owner';

  const fetchMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/company/users');
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setMembers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    setError('');
    setSuccessMessage('');
    try {
      const res = await api.patch(`/company/users/${userId}/role`, { role: newRole });
      setMembers((prev) =>
        prev.map((m) => (m._id === userId ? { ...m, role: res.data.role } : m))
      );
      setSuccessMessage(`Role updated to ${res.data.role} successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCopyCompanyId = () => {
    if (!company) return;
    navigator.clipboard.writeText(company);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getRoleBadgeClass = (r?: string): string => {
    switch ((r || '').toLowerCase()) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'manager':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Team Management</h1>
            <p className="text-sm text-slate-500">
              Manage team members and permissions for{' '}
              <span className="font-semibold text-slate-700">{companyName}</span>
            </p>
          </div>

          {/* Company ID Card for inviting teammates */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center space-x-3 text-xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Company ID (for Registration)
              </p>
              <p className="font-mono font-bold text-slate-700 select-all">{company || 'N/A'}</p>
            </div>
            <button
              onClick={handleCopyCompanyId}
              className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors flex items-center space-x-1 shrink-0"
              title="Copy Company ID"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback banners */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-teal-50 border border-teal-200 text-teal-800 px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-2">
            <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Team Members List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Members ({members.length})
            </h2>
            {!isOwner && (
              <span className="text-xs text-slate-400 italic">
                Only Owners can modify teammate roles.
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No team members found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {members.map((m) => {
                const isSelf = m._id === user?._id;
                return (
                  <div
                    key={m._id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    {/* User Profile */}
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm uppercase shrink-0">
                        {m.name?.[0] || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {m.name}
                          </p>
                          {isSelf && (
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{m.email}</p>
                      </div>
                    </div>

                    {/* Role Control / Badge */}
                    <div className="flex items-center space-x-3">
                      {isOwner ? (
                        <div className="relative">
                          <select
                            value={m.role}
                            disabled={updatingId === m._id}
                            onChange={(e) => handleRoleChange(m._id, e.target.value)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${getRoleBadgeClass(
                              m.role
                            )}`}
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r} className="bg-white text-slate-900 font-medium">
                                {r}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <span
                          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border ${getRoleBadgeClass(
                            m.role
                          )}`}
                        >
                          {m.role}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Team;
