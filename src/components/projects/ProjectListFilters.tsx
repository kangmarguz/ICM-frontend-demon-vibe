import { Search, X } from 'lucide-react';
import { ProjectStatusFilterControl } from './ProjectStatusFilter';
import type { ProjectStatusFilter } from './projectListControls';

type ProjectListFiltersProps = {
  searchTerm: string;
  statusFilter: ProjectStatusFilter;
  statusFilters: ProjectStatusFilter[];
  onSearchTermChange: (value: string) => void;
  onStatusFilterChange: (value: ProjectStatusFilter) => void;
};

export function ProjectListFilters({
  onSearchTermChange,
  onStatusFilterChange,
  searchTerm,
  statusFilter,
  statusFilters,
}: ProjectListFiltersProps) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
      <label className="relative block">
        <span className="sr-only">Search projects</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="Search projects"
          className="h-11 w-full rounded border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-500"
        />
        {searchTerm ? (
          <button
            type="button"
            onClick={() => onSearchTermChange('')}
            aria-label="Clear search"
            title="Clear search"
            className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-slate-500 hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        ) : null}
      </label>
      <ProjectStatusFilterControl filters={statusFilters} value={statusFilter} onChange={onStatusFilterChange} />
    </div>
  );
}
