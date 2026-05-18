import { MessageSquare, RefreshCw, Send, UserRound } from 'lucide-react';
import { motion } from 'motion/react';
import { FormEvent, useEffect, useState } from 'react';
import { getApiErrorMessage, toastAsync } from '../../../lib/toast';
import { createProjectComment, fetchProjectActivities } from '../../../services/projectActivityApi';
import type { ProjectActivity } from '../../../types/activity';

type ProjectActivityPanelProps = {
  projectId: string;
  refreshKey: number;
};

const actionLabel: Record<string, string> = {
  PROJECT_CREATED: 'Created project',
  PROJECT_UPDATED: 'Updated project',
  STATUS_CHANGED: 'Changed status',
  PROJECT_DELETED: 'Deleted project',
  IMAGES_UPDATED: 'Updated images',
  IMAGE_DELETED: 'Deleted image',
  COMMENT: 'Commented',
};

export function ProjectActivityPanel({ projectId, refreshKey }: ProjectActivityPanelProps) {
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadActivities = async ({ showLoading = true }: { showLoading?: boolean } = {}) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }

      setError('');
      const nextActivities = await fetchProjectActivities(projectId);
      setActivities(nextActivities);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Cannot load project activity.'));
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadActivities();
  }, [projectId, refreshKey]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message = comment.trim();

    if (!message) {
      return;
    }

    try {
      setIsSubmitting(true);
      const activity = await toastAsync(() => createProjectComment(projectId, message), {
        pending: 'Adding comment...',
        success: 'Comment added.',
        error: 'Cannot add comment.',
      });

      if (activity) {
        setActivities((current) => [activity, ...current]);
      }

      setComment('');
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Cannot add comment.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.3, ease: 'easeOut' }}
      className="rounded-lg border border-slate-200 bg-white p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-950">Activity</h3>
          <p className="mt-1 text-sm text-slate-500">Project changes and comments.</p>
        </div>
        <button
          type="button"
          onClick={() => loadActivities({ showLoading: false })}
          className="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-label="Refresh activity"
          title="Refresh activity"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <label className="sr-only" htmlFor="project-comment">Add comment</label>
        <input
          id="project-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          disabled={isSubmitting}
          placeholder="Add a comment"
          className="min-w-0 flex-1 rounded border border-slate-300 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-sky-500 disabled:bg-slate-100"
        />
        <button
          type="submit"
          disabled={isSubmitting || !comment.trim()}
          className="inline-flex items-center gap-2 rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Send size={15} />
          Send
        </button>
      </form>

      {error ? <div className="mt-4 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <div className="rounded border border-slate-200 px-3 py-4 text-sm text-slate-500">Loading activity...</div>
        ) : activities.length === 0 ? (
          <div className="flex items-center gap-2 rounded border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500">
            <MessageSquare size={16} />
            No activity yet
          </div>
        ) : (
          activities.map((activity) => (
            <article key={activity.id} className="flex gap-3 rounded border border-slate-200 px-3 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-600">
                <UserRound size={16} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-sm font-semibold text-slate-950">{activity.user?.name ?? 'System'}</p>
                  <span className="text-xs text-slate-400">{activity.createdAt}</span>
                </div>
                <p className="mt-1 text-xs font-semibold uppercase text-sky-700">
                  {actionLabel[activity.action] ?? activity.action}
                </p>
                {activity.message ? <p className="mt-1 text-sm leading-6 text-slate-600">{activity.message}</p> : null}
              </div>
            </article>
          ))
        )}
      </div>
    </motion.section>
  );
}
