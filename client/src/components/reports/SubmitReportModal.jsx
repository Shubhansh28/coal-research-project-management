import { useState, useEffect } from 'react';
import { reportsApi, projectsApi } from '../../api/client';
import { 
  X, 
  Send, 
  AlertCircle, 
  Loader2, 
  ClipboardCheck, 
  FileText, 
  Calendar, 
  TrendingUp, 
  MessageSquare,
  Building2
} from 'lucide-react';

export default function SubmitReportModal({ isOpen, onClose, onReportSubmitted, initialProjectId }) {
  const currentYear = new Date().getFullYear();

  const [assignedProjects, setAssignedProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [formData, setFormData] = useState({
    projectId: initialProjectId || '',
    title: '',
    quarter: 1,
    year: currentYear,
    progress: 50,
    completedWork: '',
    remarks: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadProjects() {
      try {
        setLoadingProjects(true);
        const res = await projectsApi.list();
        if (isMounted) {
          const list = res?.projects || [];
          setAssignedProjects(list);
          if (!formData.projectId && list.length > 0) {
            setFormData(prev => ({
              ...prev,
              projectId: initialProjectId || list[0].id
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load researcher projects:', err);
      } finally {
        if (isMounted) setLoadingProjects(false);
      }
    }

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, [isOpen, initialProjectId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quarter' || name === 'year' || name === 'progress' 
        ? Number(value) 
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.projectId) {
      setError('Please select an assigned project.');
      return;
    }
    if (!formData.title.trim()) {
      setError('Report title is required.');
      return;
    }
    if (!formData.completedWork.trim()) {
      setError('Completed work description is required.');
      return;
    }

    const quarterNum = Number(formData.quarter);
    if (![1, 2, 3, 4].includes(quarterNum)) {
      setError('Quarter must be between 1 and 4.');
      return;
    }

    const yearNum = Number(formData.year);
    if (!yearNum || yearNum < 2000 || yearNum > 2100) {
      setError('Please provide a valid year.');
      return;
    }

    const progressNum = Number(formData.progress);
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
      setError('Progress percentage must be between 0% and 100%.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        projectId: formData.projectId,
        title: formData.title.trim(),
        quarter: quarterNum,
        year: yearNum,
        progress: progressNum,
        completedWork: formData.completedWork.trim(),
        ...(formData.remarks && formData.remarks.trim() ? { remarks: formData.remarks.trim() } : {})
      };

      const res = await reportsApi.create(payload);
      if (onReportSubmitted) {
        onReportSubmitted(res.report);
      }
      onClose();
    } catch (err) {
      console.error('Failed to submit quarterly report:', err);
      if (err.status === 409) {
        setError('A report already exists for this project, quarter, and year.');
      } else if (err.status === 400) {
        setError(err.message || 'Validation failed. Please verify all required fields.');
      } else if (err.status === 404) {
        setError('Assigned project not found or access denied.');
      } else {
        setError(err.message || 'Quarterly report submission failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-slate-100 font-semibold text-base">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3>Submit Quarterly Progress Report</h3>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                Scientific milestones and progress metrics for official review
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-slate-400 hover:text-slate-200 transition p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Project Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              Assigned Research Project *
            </label>
            {loadingProjects ? (
              <div className="flex items-center gap-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                Loading your assigned projects...
              </div>
            ) : assignedProjects.length === 0 ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400">
                No assigned projects found. Only assigned researchers can submit reports.
              </div>
            ) : (
              <select
                name="projectId"
                required
                value={formData.projectId}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
              >
                {assignedProjects.map(proj => (
                  <option key={proj.id} value={proj.id}>
                    [{proj.projectCode}] {proj.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Report Title *
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g., Q1 Technical Benchmarking & Core Sample Characterization"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Quarter & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Quarter *
              </label>
              <select
                name="quarter"
                required
                value={formData.quarter}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
              >
                <option value={1}>Quarter 1 (Q1: Apr - Jun)</option>
                <option value={2}>Quarter 2 (Q2: Jul - Sep)</option>
                <option value={3}>Quarter 3 (Q3: Oct - Dec)</option>
                <option value={4}>Quarter 4 (Q4: Jan - Mar)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Financial / Calendar Year *
              </label>
              <input
                type="number"
                name="year"
                required
                min={2000}
                max={2100}
                value={formData.year}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Progress % Slider & Number Display */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                Progress Achieved (%):
              </label>
              <span className="font-mono text-sm font-bold text-amber-400">
                {formData.progress}%
              </span>
            </div>
            <input
              type="range"
              name="progress"
              min={0}
              max={100}
              step={1}
              value={formData.progress}
              onChange={handleChange}
              className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0% (Commenced)</span>
              <span>50% (Mid-term)</span>
              <span>100% (Completed)</span>
            </div>
          </div>

          {/* Completed Work Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Completed Work & Milestones Accomplished *
            </label>
            <textarea
              name="completedWork"
              required
              rows={4}
              placeholder="Outline specific experimental results, chemical tests, simulation runs, or field studies achieved during this quarter..."
              value={formData.completedWork}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition resize-none leading-relaxed"
            />
          </div>

          {/* Remarks (Optional) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              Additional Remarks (Optional)
            </label>
            <textarea
              name="remarks"
              rows={2}
              placeholder="Any operational challenges, equipment procurement delays, or notes for the review committee..."
              value={formData.remarks}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition resize-none leading-relaxed"
            />
          </div>

          {/* Actions */}
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
              disabled={submitting || assignedProjects.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Report...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  Submit Quarterly Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
