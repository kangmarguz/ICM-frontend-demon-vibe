import { Building2, LogOut, PanelLeft, Settings, Users, FolderKanban, Home, PlusSquare, MapPin, UserRound } from 'lucide-react';
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

const sidebarWidthClass = 'md:w-72';
const sidebarOffsetClass = 'md:pl-72';
const shellGutterClass = 'px-4 md:px-6 lg:px-8';
const shellBarHeightClass = 'min-h-20';

export function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const actionLogout = useAuthStore((state) => state.actionLogout);
  const navigate = useNavigate();
  const mustResetPassword = Boolean(user?.forceResetPassword);
  const siteName = user?.site?.name ?? (user?.siteId ? `Site ${user.siteId}` : 'No site assigned');

  const handleLogout = () => {
    actionLogout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-20 hidden border-r border-slate-200 bg-white md:flex md:flex-col ${sidebarWidthClass}`}>
        <div className={`flex items-center gap-3 border-b border-slate-200 ${shellBarHeightClass} px-6`}>
          <div className="flex h-10 w-10 items-center justify-center rounded bg-indigo-600 text-white">
            <PanelLeft size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold">Task Manager</p>
            <p className="text-xs text-slate-500">Project workspace</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-5">
          {menuItems
            .filter((item) => (!mustResetPassword || item.to === '/settings') && (!user?.role || !item.hiddenForRoles?.includes(user.role)))
            .map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
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

        <div className="border-t border-slate-200 p-5">
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

      <div className={sidebarOffsetClass}>
        <header className={`sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 backdrop-blur ${shellBarHeightClass} ${shellGutterClass}`}>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workspace</p>
            <h1 className="truncate text-lg font-semibold">Project Task Management</h1>
          </div>
          <div className="flex min-w-[180px] max-w-[min(360px,55vw)] items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white shadow-sm shadow-indigo-100">
              <UserRound size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate text-sm font-semibold text-slate-950">{user?.name}</p>
                <span className="shrink-0 rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                  {user?.role}
                </span>
              </div>
              <div className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-slate-500">
                <Building2 size={13} className="shrink-0" />
                <span className="truncate">{siteName}</span>
              </div>
            </div>
          </div>
        </header>

        <main className={`py-6 ${shellGutterClass}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
