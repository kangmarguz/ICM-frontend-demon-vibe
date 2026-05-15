import { ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import { motion } from 'motion/react';
import type { Role } from '../../types/auth';

const roleContent: Record<Role, { title: string; description: string; icon: typeof UserRound }> = {
  USER: {
    title: 'User workspace',
    description: 'Create projects and manage only projects created by your account.',
    icon: UserRound,
  },
  GUEST: {
    title: 'Guest workspace',
    description: 'View projects shared under the assigned owner account.',
    icon: UsersRound,
  },
  ADMIN: {
    title: 'Admin workspace',
    description: 'View and manage projects across the workspace.',
    icon: ShieldCheck,
  },
};

type HomeWorkspaceSummaryProps = {
  projectCount: number;
  role: Role;
};

export function HomeWorkspaceSummary({ projectCount, role }: HomeWorkspaceSummaryProps) {
  const RoleIcon = roleContent[role].icon;

  return (
    <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.3, ease: 'easeOut' }}
        className="rounded-lg border border-slate-200 bg-white p-6"
      >
        <div className="flex items-start gap-4">
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.16, duration: 0.25, ease: 'easeOut' }}
            className="flex h-12 w-12 items-center justify-center rounded bg-sky-50 text-sky-700"
          >
            <RoleIcon size={24} />
          </motion.div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{role}</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">{roleContent[role].title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{roleContent[role].description}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.3, ease: 'easeOut' }}
        className="rounded-lg border border-slate-200 bg-white p-5"
      >
        <p className="text-sm text-slate-500">Visible projects</p>
        <p className="mt-2 text-3xl font-semibold text-slate-950">{projectCount}</p>
      </motion.div>
    </section>
  );
}
