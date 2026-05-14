import { ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const roleIcon = {
  USER: UserRound,
  GUEST: UsersRound,
  ADMIN: ShieldCheck,
};

export function UsersPage() {
  const currentUser = useAuthStore((state) => state.user)!;
  const Icon = roleIcon[currentUser.role];

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-950">Users</h2>
        <p className="text-sm text-slate-500">User data will be loaded from backend API in the next step.</p>
      </div>

      <div className="p-6">
        <article className="max-w-md rounded-lg border border-slate-200 p-4">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded bg-slate-100 text-slate-700">
            <Icon size={20} />
          </div>
          <p className="font-semibold text-slate-950">{currentUser.name}</p>
          <p className="mt-1 text-sm text-slate-500">{currentUser.email}</p>
          <p className="mt-3 w-fit rounded bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            {currentUser.role}
          </p>
        </article>
      </div>
    </section>
  );
}
