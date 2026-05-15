import { LogOut, PanelLeft, Settings, Users, FolderKanban, Home, PlusSquare, MapPin } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const menuItems = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/projects', label: 'Projects', icon: FolderKanban, end: true },
  { to: '/projects/new', label: 'Add Project', icon: PlusSquare, end: true, hiddenForRoles: ['GUEST'] },
  { to: '/sites', label: 'Sites', icon: MapPin, end: true, hiddenForRoles: ['USER', 'GUEST'] },
  { to: '/users', label: 'Users', icon: Users, end: true, hiddenForRoles: ['USER', 'GUEST'] },
  { to: '/settings', label: 'Settings', icon: Settings, end: true },
];

export function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const actionLogout = useAuthStore((state) => state.actionLogout);
  const navigate = useNavigate();

  const handleLogout = () => {
    actionLogout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200 bg-white md:flex md:flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-indigo-600 text-white">
            <PanelLeft size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold">Task Manager</p>
            <p className="text-xs text-slate-500">Project workspace</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems
            .filter((item) => !user?.role || !item.hiddenForRoles?.includes(user.role))
            .map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                  ].join(' ')
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 rounded border border-slate-200 bg-slate-50 p-3">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.role}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workspace</p>
            <h1 className="text-lg font-semibold">Project Task Management</h1>
          </div>
          <div className="rounded border border-slate-200 px-3 py-1 text-sm font-medium text-slate-700">
            {user?.role}
          </div>
        </header>

        <main className="px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
