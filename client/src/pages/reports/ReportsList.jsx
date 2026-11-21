import { useState, useEffect, useMemo, useCallback } from 'react';
import useAuth from '../../context/useAuth';
import { reportsApi, projectsApi } from '../../api/client';
import SubmitReportModal from '../../components/reports/SubmitReportModal';
import ReviewReportModal from '../../components/reports/ReviewReportModal';
import { 
  ClipboardCheck, 
  Search, 
  Plus, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  AlertCircle, 
  Eye, 
  ShieldCheck, 
  User, 
  MessageSquare, 
  X
} from 'lucide-react';

export default function ReportsList() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [selectedQuarter, setSelectedQuarter] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [reviewReportTarget, setReviewReportTarget] = useState(null);
  const [inspectReport, setInspectReport] = useState(null);

  // Load projects list for dropdown filter
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await projectsApi.list();
        setProjects(res?.projects || []);
      } catch (err) {
        console.error('Failed to load projects filter options:', err);
      }
    }
    loadProjects();
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedProject !== 'ALL') params.projectId = selectedProject;
      if (selectedQuarter !== 'ALL') params.quarter = selectedQuarter;
      if (selectedYear !== 'ALL') params.year = selectedYear;

      const res = await reportsApi.list(params);
      setReports(res?.reports || []);
    } catch (err) {
      console.error('Failed to load quarterly reports:', err);
      setError(err.message || 'Unable to retrieve progress reports.');
    } finally {
      setLoading(false);
    }
  }, [selectedProject, selectedQuarter, selectedYear]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Handle Inspect Details
  const handleOpenInspect = async (reportId) => {
    try {
      const res = await reportsApi.getById(reportId);
      if (res?.report) {
        setInspectReport(res.report);
      }
    } catch (err) {
      console.error('Failed to inspect report:', err);
    }
  };

  // Client-side filtering for status and search query
  const filteredReports = useMemo(() => {
    return reports.filter((rpt) => {
      // Status Filter
      if (selectedStatus !== 'ALL' && rpt.status !== selectedStatus) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = rpt.title?.toLowerCase().includes(query);
        const matchesProj = rpt.project?.title?.toLowerCase().includes(query) ||
                            rpt.project?.projectCode?.toLowerCase().includes(query);
        const matchesResearcher = rpt.researcher?.name?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesProj && !matchesResearcher) {
          return false;
        }
      }

      return true;
    });
  }, [reports, selectedStatus, searchQuery]);

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <ClipboardCheck className="w-6 h-6 text-amber-500" />
            Quarterly Progress Reports Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Centrally audit milestone completions, scientific outputs, and review committee verdicts.
          </p>
        </div>

        {!isAdmin && (
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Submit Quarterly Report
          </button>
        )}
      </div>

      {/* Filter Chips & Search Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search reports by title, project code, or researcher name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Project Filter */}
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 transition max-w-[200px] truncate"
            >
              <option value="ALL">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.projectCode}] {p.title}
                </option>
              ))}
            </select>

            {/* Quarter Filter */}
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 transition"
            >
              <option value="ALL">All Quarters</option>
              <option value="1">Quarter 1 (Q1)</option>
              <option value="2">Quarter 2 (Q2)</option>
              <option value="3">Quarter 3 (Q3)</option>
              <option value="4">Quarter 4 (Q4)</option>
            </select>

            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 transition"
            >
              <option value="ALL">All Years</option>
              {[2024, 2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr}>
                  Year {yr}
                </option>
              ))}
            </select>

            {/* Review Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 transition"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      {loading ? (
        <div className="p-16 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading progress reports registry...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Unable to Fetch Reports</h3>
          <p className="text-xs text-slate-400 mt-1">{error}</p>
          <button
            onClick={fetchReports}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl transition"
          >
            Retry
          </button>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-slate-900 border border-slate-800 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">No Reports Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            No quarterly progress reports matched the chosen filters.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Period</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Report Title</th>
                  <th className="py-3.5 px-4">Investigator</th>
                  <th className="py-3.5 px-4">Milestone Progress</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredReports.map((rpt) => (
                  <tr key={rpt.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                      Q{rpt.quarter} {rpt.year}
                    </td>

                    <td className="py-3.5 px-4 max-w-[200px]">
                      <span className="font-mono text-[11px] font-bold text-slate-300 block">
                        {rpt.project?.projectCode}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate block" title={rpt.project?.title}>
                        {rpt.project?.title}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-200 max-w-xs truncate" title={rpt.title}>
                      {rpt.title}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold flex items-center justify-center text-[10px]">
                          {rpt.researcher?.name?.charAt(0) || 'R'}
                        </div>
                        <span className="text-xs">{rpt.researcher?.name || 'Researcher'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${rpt.progress}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-300">{rpt.progress}%</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        rpt.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : rpt.status === 'REJECTED'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {rpt.status === 'APPROVED' ? <CheckCircle2 className="w-3 h-3" /> :
                         rpt.status === 'REJECTED' ? <XCircle className="w-3 h-3" /> :
                         <Clock className="w-3 h-3" />}
                        {rpt.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenInspect(rpt.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition"
                          title="Inspect Completed Work Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </button>

                        {isAdmin && rpt.status === 'PENDING' && (
                          <button
                            onClick={() => setReviewReportTarget(rpt)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-semibold rounded-lg transition"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Review
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submit Report Modal */}
      {isSubmitModalOpen && (
        <SubmitReportModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          onReportSubmitted={() => {
            fetchReports();
            setIsSubmitModalOpen(false);
          }}
        />
      )}

      {/* Review Report Modal (Admin) */}
      {reviewReportTarget && (
        <ReviewReportModal
          isOpen={!!reviewReportTarget}
          report={reviewReportTarget}
          onClose={() => setReviewReportTarget(null)}
          onReportReviewed={(updatedRpt) => {
            setReports(prev => prev.map(r => r.id === updatedRpt.id ? { ...r, ...updatedRpt } : r));
            setReviewReportTarget(null);
          }}
        />
      )}

      {/* Inspect Report Modal / Drawer */}
      {inspectReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-slate-100 font-semibold text-base">
                <FileText className="w-5 h-5 text-amber-500" />
                <h3>Progress Report Inspection</h3>
              </div>
              <button
                onClick={() => setInspectReport(null)}
                className="text-slate-400 hover:text-slate-200 transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Top Banner metadata */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                      Q{inspectReport.quarter} {inspectReport.year}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      [{inspectReport.project?.projectCode}]
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 mt-1">
                    {inspectReport.title}
                  </h4>
                </div>

                <div className="flex flex-col items-end">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    inspectReport.status === 'APPROVED'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : inspectReport.status === 'REJECTED'
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {inspectReport.status}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 mt-1">
                    Submitted: {formatDate(inspectReport.createdAt)}
                  </span>
                </div>
              </div>

              {/* Progress Bar Gauge */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Reported Progress Metric</span>
                  <span className="font-mono font-bold text-amber-400">{inspectReport.progress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-emerald-400 h-2 rounded-full"
                    style={{ width: `${inspectReport.progress}%` }}
                  />
                </div>
              </div>

              {/* Completed Work Content */}
              <div>
                <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Completed Work & Technical Accomplishments
                </h5>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                  {inspectReport.completedWork || 'No narrative provided.'}
                </div>
              </div>

              {/* Remarks */}
              {inspectReport.remarks && (
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                    Review Remarks / Researcher Notes
                  </h5>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 italic">
                    "{inspectReport.remarks}"
                  </div>
                </div>
              )}

              {/* Researcher Details */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>Investigator: <strong className="text-slate-200">{inspectReport.researcher?.name}</strong></span>
                </div>
                <span className="text-slate-500 font-mono text-[11px]">{inspectReport.researcher?.email}</span>
              </div>
            </div>

            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-800 bg-slate-950/40">
              <button
                onClick={() => setInspectReport(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
