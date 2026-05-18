import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProjectDetailHeader() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Projects</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-950">Project detail</h2>
        <p className="mt-1 text-sm text-slate-500">View and edit project information.</p>
      </div>
      <Link
        to="/projects"
        className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <ArrowLeft size={16} />
        Back
      </Link>
    </div>
  );
}
