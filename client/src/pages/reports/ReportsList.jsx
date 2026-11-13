import { ClipboardCheck } from 'lucide-react';

export default function ReportsList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Quarterly Progress Reports
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Quarterly milestone submissions, review workflows, and approval histories.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-lg mx-auto mt-12">
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-amber-400">
          <ClipboardCheck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">Reports Module Ready</h3>
        <p className="text-sm text-slate-400 mt-2">
          Quarterly report submissions and administrative reviews (Prompt 4) will populate here.
        </p>
      </div>
    </div>
  );
}
