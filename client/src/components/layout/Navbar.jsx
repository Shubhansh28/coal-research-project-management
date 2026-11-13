import useAuth from '../../context/useAuth';
import { Flame, LogOut, ShieldCheck, UserCheck, Menu, X } from 'lucide-react';

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 border-b border-slate-800/80 backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Branding & Mobile toggle */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 lg:hidden focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-md shadow-amber-500/10">
              <Flame className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-bold text-slate-100 tracking-tight text-base sm:text-lg block leading-tight">
                Coal Research <span className="text-amber-400">S&T</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 hidden sm:block">
                Project Monitoring System
              </span>
            </div>
          </div>
        </div>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {user && (
            <div className="flex items-center space-x-3">
              {/* Role Badge */}
              <div
                className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border ${
                  isAdmin
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                }`}
              >
                {isAdmin ? (
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-400" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                )}
                {user.role}
              </div>

              {/* User Identity */}
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-slate-200 leading-tight">
                  {user.name}
                </div>
                <div className="text-xs text-slate-400 leading-tight">
                  {user.email}
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={logout}
                title="Log out"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-300 hover:bg-red-950/30 border border-transparent hover:border-red-800/40 transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
