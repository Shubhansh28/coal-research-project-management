import { useState } from 'react';
import { reportsApi } from '../../api/client';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  MessageSquare
} from 'lucide-react';

export default function ReviewReportModal({ isOpen, onClose, report, onReportReviewed }) {
  const [status, setStatus] = useState('APPROVED');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !report) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      setError('Please select an approval decision (APPROVED or REJECTED).');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        status,
        remarks: remarks.trim()
      };

      const res = await reportsApi.review(report.id, payload);
      if (onReportReviewed) {
        onReportReviewed(res.report || { ...report, status, remarks: remarks.trim() });
      }
      onClose();
    } catch (err) {
      console.error('Failed to review quarterly report:', err);
      if (err.status === 400) {
        setError(err.message || 'This report has already been reviewed or status is invalid.');
      } else if (err.status === 403) {
        setError('Unauthorized: Only administrators are authorized to review reports.');
      } else {
        setError(err.message || 'Report review action failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-slate-100 font-semibold text-base">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3>Review Progress Report</h3>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                Official administrative verdict for milestone submission
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-slate-400 hover:text-slate-200 transition p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Report Summary Pill */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-amber-400">
                Q{report.quarter} {report.year}
              </span>
              <span className="text-xs font-mono font-semibold text-slate-300">
                Progress: {report.progress}%
              </span>
            </div>
            <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{report.title}</h4>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              {report.completedWork}
            </p>
          </div>

          {/* Decision Selection Radio Group */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Review Decision *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('APPROVED')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  status === 'APPROVED'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-100">Approve Report</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Satisfies research milestones</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStatus('REJECTED')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  status === 'REJECTED'
                    ? 'bg-red-500/15 border-red-500/40 text-red-400'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <XCircle className="w-5 h-5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-100">Reject Report</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Deficiencies or rework required</div>
                </div>
              </button>
            </div>
          </div>

          {/* Remarks Textarea */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              Administrative Review Remarks
            </label>
            <textarea
              rows={3}
              placeholder={status === 'APPROVED' ? 'Approved by scientific review board. Excellent milestone pacing.' : 'Clarification needed on core sample calibration...'}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition resize-none leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center gap-2 px-5 py-2.5 font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50 ${
                status === 'APPROVED'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  : 'bg-red-500 hover:bg-red-400 text-slate-950'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Verdict...
                </>
              ) : (
                `Confirm ${status === 'APPROVED' ? 'Approval' : 'Rejection'}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
