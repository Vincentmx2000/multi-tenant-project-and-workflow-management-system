import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Comment } from '../../types';

export interface CommentSectionProps {
  taskId: string;
}

interface EnrichedComment extends Comment {
  _authorName?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ taskId }) => {
  const { user, role } = useAuth();
  const [comments, setComments] = useState<EnrichedComment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [text, setText] = useState<string>('');
  const [posting, setPosting] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  // ----- Fetch comments on mount -----
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/comments/task/${taskId}`);
        setComments(res.data || []);
      } catch (_err) {
        setError('Failed to load comments.');
      } finally {
        setLoading(false);
      }
    };
    if (taskId) fetchComments();
  }, [taskId]);

  // ----- Post a new comment -----
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setPosting(true);
    setError('');
    try {
      const res = await api.post('/comments', { taskId, text: trimmed });
      // Backend returns the comment with userId as ObjectId (not populated).
      // We enrich it client-side with the current user's name so it displays immediately.
      const enriched: EnrichedComment = {
        ...res.data,
        _authorName: user?.name || 'You',
      };
      setComments((prev) => [...prev, enriched]);
      setText('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setPosting(false);
    }
  };

  // ----- Delete a comment -----
  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete comment.');
    } finally {
      setDeletingId(null);
    }
  };

  // ----- Permission check -----
  const canDelete = (comment: EnrichedComment) => {
    const authorId =
      typeof comment.userId === 'object' && comment.userId !== null
        ? comment.userId._id
        : comment.userId;
    const isAuthor = authorId?.toString() === user?._id?.toString();
    const isPrivileged = role && ['owner', 'admin'].includes(role.toLowerCase());
    return isAuthor || isPrivileged;
  };

  // ----- Format timestamp -----
  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ----- Author display name -----
  const authorName = (comment: EnrichedComment) => {
    if (comment._authorName) return comment._authorName;
    const authorId =
      typeof comment.userId === 'object' && comment.userId !== null
        ? comment.userId._id
        : comment.userId;
    if (authorId?.toString() === user?._id?.toString()) return user?.name || 'You';
    if (typeof comment.userId === 'object' && comment.userId !== null && 'name' in comment.userId) {
      return comment.userId.name;
    }
    return 'Team Member';
  };

  return (
    <div className="border-t border-slate-100 pt-4 mt-2">
      <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        Comments
        {comments.length > 0 && (
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
            {comments.length}
          </span>
        )}
      </h4>

      {/* Error banner */}
      {error && (
        <div className="mb-3 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-600 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Comment list */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
        {loading ? (
          // Loading skeleton
          <div className="space-y-3 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-slate-200 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 bg-slate-200 rounded w-24" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          // Empty state
          <div className="text-center py-6">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-xs text-slate-400 font-medium">No comments yet. Be the first!</p>
          </div>
        ) : (
          // Rendered comments
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-2.5 group">
              {/* Avatar */}
              <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0 uppercase select-none">
                {authorName(comment)[0] || '?'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">{authorName(comment)}</span>
                    <span className="text-[10px] text-slate-400">{formatTime(comment.createdAt)}</span>
                  </div>

                  {/* Delete button — shown on hover if user has permission */}
                  {canDelete(comment) && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      disabled={deletingId === comment._id}
                      title="Delete comment"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 disabled:opacity-40"
                    >
                      {deletingId === comment._id ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap break-words bg-slate-50 px-3 py-2 rounded-xl rounded-tl-sm border border-slate-100">
                  {comment.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post comment input */}
      <form onSubmit={handlePost} className="flex gap-2 items-start">
        {/* Current user avatar */}
        <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0 uppercase select-none mt-0.5">
          {user?.name?.[0] || 'U'}
        </div>

        <div className="flex-1 flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handlePost(e);
              }
            }}
            placeholder="Write a comment… (Enter to post, Shift+Enter for new line)"
            rows={2}
            className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none text-slate-900 placeholder-slate-400 transition-all"
          />
          <button
            type="submit"
            disabled={posting || !text.trim()}
            className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-sm disabled:opacity-40 transition-all self-end"
          >
            {posting ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              'Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
