import { NavLink } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import {
  LayoutDashboard,
  FolderGit2,
  ClipboardCheck,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Shield,
  Microscope,
  FileText
} from 'lucide-react';

export default function Sidebar({ isOpen, isCollapsed, onToggleCollapse, onCloseMobile }) {
  const { user, isAdmin } = useAuth();

  const adminNav = [
    {
      name: 'Admin Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Projects Directory',
      path: '/projects',
      icon: FolderGit2,
    },
    {
      name: 'Report Approvals',
      path: '/reports',
      icon: ClipboardCheck,
    },
    {
      name: 'Fund Monitoring',
      path: '/funds',
      icon: BarChart3,
    },
  ];

  const researcherNav = [
    {
      name: 'Researcher Dashboard',
      path: '/researcher/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'My Assigned Projects',
      path: '/projects',
      icon: FolderGit2,
    },
    {
      name: 'Progress Reports',
      path: '/reports',
      icon: FileText,
    },
    {
      name: 'Fund Utilization',
      path: '/funds',
      icon: BarChart3,
    },
  ];

  const navItems = isAdmin ? adminNav : researcherNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64 pt-16`}
      >
        {/* Role Portal Header */}
        <div className="p-4 border-b border-slate-800/80">
          <div
            className={`flex items-center space-x-3 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            {isAdmin ? (
              <Shield className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <Microscope className="w-5 h-5 text-cyan-400 shrink-0" />
            )}
            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  {isAdmin ? 'Administration' : 'Research Wing'}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {user?.role} Workspace
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center rounded-xl font-medium transition-all ${
                    isCollapsed
                      ? 'justify-center px-3 py-2.5'
                      : 'px-3.5 py-2.5 space-x-3'
                  } ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="text-sm truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Collapse Toggle (Desktop only) */}
        <div className="p-3 border-t border-slate-800 hidden lg:block">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <div className="flex items-center space-x-2 text-xs font-medium text-slate-400">
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Navigation</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
