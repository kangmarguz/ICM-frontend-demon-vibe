import type { ProjectStatusFilter } from './projectListControls';

type ProjectStatusFilterProps = {
  filters: ProjectStatusFilter[];
  value: ProjectStatusFilter;
  onChange: (value: ProjectStatusFilter) => void;
};

export function ProjectStatusFilterControl({ filters, value, onChange }: ProjectStatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onChange(filter)}
          className={[
            'rounded border px-3 py-1.5 text-xs font-semibold uppercase transition',
            value === filter
              ? 'border-sky-600 bg-sky-50 text-sky-700'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
          ].join(' ')}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
