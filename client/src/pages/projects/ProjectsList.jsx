import { FolderGit2 } from 'lucide-react';

export default function ProjectsList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Projects Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Science & Technology (S&T) and Research & Development (R&D) coal initiatives.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-lg mx-auto mt-12">
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-amber-400">
          <FolderGit2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">Projects Directory Ready</h3>
        <p className="text-sm text-slate-400 mt-2">
          Project creation (Prompt 2) and full researcher project views (Prompt 3) will populate this section.
        </p>
      </div>
    </div>
  );
}

