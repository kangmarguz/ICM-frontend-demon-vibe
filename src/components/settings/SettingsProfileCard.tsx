import { Camera, LoaderCircle, Trash2, UserRound } from 'lucide-react';
import { motion } from 'motion/react';
import type { ChangeEvent, RefObject } from 'react';
import type { AppUser } from '../../types/auth';

type SettingsProfileCardProps = {
  avatarInputRef: RefObject<HTMLInputElement>;
  isUploadingAvatar: boolean;
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveAvatar: () => void;
  user: AppUser;
};

export function SettingsProfileCard({
  avatarInputRef,
  isUploadingAvatar,
  onAvatarChange,
  onRemoveAvatar,
  user,
}: SettingsProfileCardProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
      className="rounded-lg border border-slate-200 bg-slate-50/60 p-5"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm shadow-slate-100">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="mx-auto h-28 w-28 rounded-3xl object-cover shadow-sm shadow-slate-200"
          />
        ) : (
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-sky-50 text-sky-700">
            <UserRound size={42} />
          </div>
        )}

        <div className="mt-5 space-y-1">
          <p className="text-lg font-semibold text-slate-950">{user.name}</p>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>

        <div className="mt-4 flex justify-center">
          <p className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 ring-1 ring-sky-100">
            {user.role}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onAvatarChange}
        />
        <button
          type="button"
          disabled={isUploadingAvatar}
          onClick={() => avatarInputRef.current?.click()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          {isUploadingAvatar ? <LoaderCircle size={16} className="animate-spin" /> : <Camera size={16} />}
          {user.avatarUrl ? 'Change avatar' : 'Upload avatar'}
        </button>
        {user.avatarUrl ? (
          <button
            type="button"
            disabled={isUploadingAvatar}
            onClick={onRemoveAvatar}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            {isUploadingAvatar ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Remove avatar
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-400"
          >
            <Trash2 size={16} />
            No avatar to remove
          </button>
        )}
      </div>
    </motion.aside>
  );
}
