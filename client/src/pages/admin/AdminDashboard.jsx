import useAuth from '../../context/useAuth';
import { ShieldCheck } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Admin Monitoring Cockpit
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Welcome back, <span className="text-amber-400 font-semibold">{user?.name}</span>. Science & Technology project administration center.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl w-fit">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Full Administrative Privileges</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Foundation Active</h3>
          <p className="text-2xl font-bold text-slate-100 mt-2">Ready for Prompt 2</p>
          <p className="text-xs text-slate-500 mt-2">
            Metrics, project registration, status workflows, and researcher allocation modules will attach here.
          </p>
        </div>
      </div>
    </div>
  );
}
