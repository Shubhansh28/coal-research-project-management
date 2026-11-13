import { BarChart3 } from 'lucide-react';

export default function FundTracker() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Fund Utilization & Monitoring
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tracking received grants, expenditure statements, and financial burn rates.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-lg mx-auto mt-12">
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-emerald-400">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">Financial Tracker Ready</h3>
        <p className="text-sm text-slate-400 mt-2">
          Quarterly fund expenditure tables, financial gauges, and comparisons (Prompt 4) will populate here.
        </p>
      </div>
    </div>
  );
}
