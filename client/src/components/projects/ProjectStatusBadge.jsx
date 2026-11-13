import { useState } from 'react';
import { projectsApi } from '../../api/client';
import { Clock, CheckCircle2, XCircle, Award, ChevronDown, Loader2 } from 'lucide-react';

const statusConfig = {
  PENDING: {
    label: 'Pending Approval',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    icon: Clock,
  },
  APPROVED: {
    label: 'Approved / Active',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30',
    icon: XCircle,
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    icon: Award,
  },
};

const allowedTransitions = {
  PENDING: ['APPROVED', 'REJECTED'],
  APPROVED: ['COMPLETED'],
  REJECTED: ['PENDING'],
  COMPLETED: [],
};

export default function ProjectStatusBadge({
  status,
  projectId,
  editable = false,
  onStatusUpdated,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const currentConfig = statusConfig[status] || statusConfig.PENDING;
  const Icon = currentConfig.icon;
  const nextOptions = editable ? (allowedTransitions[status] || []) : [];

  const handleSelectStatus = async (nextStatus) => {
    if (nextStatus === status || updating) return;
    try {
      setUpdating(true);
      setError('');
      const res = await projectsApi.updateStatus(projectId, nextStatus);
      setIsOpen(false);
      if (onStatusUpdated) {
        onStatusUpdated(res.project);
      }
    } catch (err) {
      setError(err.message || 'Status transition failed.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <div
        onClick={() => editable && nextOptions.length > 0 && setIsOpen(!isOpen)}
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${currentConfig.bg} ${currentConfig.text} ${currentConfig.border} ${
          editable && nextOptions.length > 0 ? 'cursor-pointer hover:opacity-85 select-none' : ''
        }`}
        title={editable && nextOptions.length > 0 ? 'Click to change status' : undefined}
      >
        {updating ? (
          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
        ) : (
          <Icon className="w-3.5 h-3.5 mr-1.5 shrink-0" />
        )}
        <span>{currentConfig.label}</span>
        {editable && nextOptions.length > 0 && (
          <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />
        )}
      </div>

      {/* Dropdown for Admin Status Transitions */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-40 p-1.5 backdrop-blur-md">
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-1">
              Transition Status
            </div>

            {error && (
              <div className="px-2 py-1 text-xs text-red-400 bg-red-950/30 rounded mb-1">
                {error}
              </div>
            )}

            {nextOptions.map((opt) => {
              const optCfg = statusConfig[opt];
              const OptIcon = optCfg.icon;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelectStatus(opt)}
                  disabled={updating}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs rounded-lg text-slate-200 hover:bg-slate-800 transition text-left"
                >
                  <OptIcon className={`w-3.5 h-3.5 ${optCfg.text}`} />
                  <span>Mark as {optCfg.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

