import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import { projectsApi } from '../../api/client';
import ProjectStatusBadge from '../../components/projects/ProjectStatusBadge';
import ProjectDocuments from '../../components/projects/ProjectDocuments';
import ResearcherAssignModal from '../../components/projects/ResearcherAssignModal';
import EditProjectModal from '../../components/projects/EditProjectModal';
import { 
  ArrowLeft, 
  Calendar, 
  IndianRupee, 
  Users, 
  FileText, 
  BarChart3, 
  Layers, 
  Loader2, 
  AlertCircle, 
  Edit3, 
  UserPlus, 
  Mail, 
  TrendingUp, 
  Coins, 
  FileCheck2,
  PieChart
} from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals for Admin operations
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectsApi.getById(id);
      if (res?.project) {
        setProject(res.project);
      } else {
        setError('Project details could not be retrieved.');
      }
    } catch (err) {
      console.error('Failed to fetch project details:', err);
      if (err.status === 404) {
        setError('Project not found or you do not have permission to view it.');
      } else {
        setError(err.message || 'Error loading project.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id, fetchProjectDetails]);

  const formatDate = (isoString) => {
    if (!isoString) return 'Not set';
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

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt || 0);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-sm font-medium text-slate-400">Loading comprehensive project hub...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Project Not Found</h2>
        <p className="text-sm text-slate-400 mt-2">{error || 'The requested project could not be found.'}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects Directory
          </button>
          <button
            onClick={fetchProjectDetails}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-xl transition"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  // Calculations for Financials and Reports
  const totalBudget = project.budget || 0;
  const totalSpent = (project.fundReports || []).reduce((sum, f) => sum + (f.amountSpent || 0), 0);
  const totalReceived = (project.fundReports || []).reduce((sum, f) => sum + (f.amountReceived || 0), 0);
  const spendPercentage = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;

  // Latest Progress Report
  const reportsList = [...(project.reports || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const latestReport = reportsList[0];

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-amber-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects Directory
        </Link>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition border border-slate-700"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              Edit Project Details
            </button>
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold rounded-xl transition"
            >
              <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
              Manage Researchers
            </button>
          </div>
        )}
      </div>

      {/* Hero Header Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 relative z-10">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                {project.projectCode}
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${
                project.fundingType === 'ST'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
              }`}>
                {project.fundingType === 'ST' ? 'S&T (Science & Technology)' : 'R&D (Research & Dev)'}
              </span>
              <ProjectStatusBadge
                status={project.status}
                projectId={project.id}
                editable={isAdmin}
                onStatusUpdated={(updatedProj) => setProject(prev => ({ ...prev, ...updatedProj }))}
              />
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 tracking-tight leading-snug">
              {project.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>
                  Duration: <strong className="text-slate-200">{formatDate(project.startDate)}</strong> — <strong className="text-slate-200">{formatDate(project.endDate)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-emerald-500" />
                <span>
                  Sanctioned Budget: <strong className="text-slate-200">{formatCurrency(project.budget)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-500" />
                <span>
                  Team: <strong className="text-slate-200">{(project.researchers || []).length} assigned</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Progress Badge / Mini Gauge */}
          <div className="lg:w-64 p-4 rounded-xl bg-slate-950/70 border border-slate-800 shrink-0 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Quarterly Progress</span>
              <span className="font-bold text-amber-400 font-mono">
                {latestReport ? `${latestReport.progress}%` : '0%'}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${latestReport ? latestReport.progress : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{latestReport ? `Q${latestReport.quarter} ${latestReport.year}` : 'No report submitted'}</span>
              <span>{latestReport ? latestReport.status : 'Awaiting'}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation bar */}
        <div className="flex items-center gap-2 mt-8 pt-4 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'overview'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            Overview & Financials
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'documents'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            Documents ({(project.documents || []).length})
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'reports'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Quarterly Reports & Funds Preview ({(project.reports || []).length})
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Description Card */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-amber-400" />
                Project Description & Objectives
              </h3>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 min-h-[140px]">
                {project.description || 'No detailed scope or project description has been provided for this coal research initiative.'}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Initiative Type</span>
                  <span className="text-xs font-semibold text-slate-200 mt-1 block">
                    {project.fundingType === 'ST' ? 'S&T (Grant-in-aid)' : 'R&D (CIL Funded)'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Project State</span>
                  <span className="text-xs font-semibold text-slate-200 mt-1 block">
                    {project.status}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Lifecycle Period</span>
                  <span className="text-xs font-semibold text-slate-200 mt-1 block">
                    {project.startDate ? new Date(project.startDate).getFullYear() : '—'} - {project.endDate ? new Date(project.endDate).getFullYear() : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Budget vs Total Spent Gauge Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-400" />
                Budget vs. Expenditure Gauge
              </h3>

              {/* Visual Meter / Comparison Gauge */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Spent Utilization</span>
                  <span className={`font-mono font-bold ${spendPercentage > 90 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {spendPercentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-700 ${
                      spendPercentage > 90 ? 'bg-red-500' : spendPercentage > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${spendPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100% Sanction</span>
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/50">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                    Sanctioned Budget
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {formatCurrency(totalBudget)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/50">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-blue-400" />
                    Funds Received
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-400">
                    {formatCurrency(totalReceived)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/50">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    Total Expenditure Spent
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {formatCurrency(totalSpent)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/50">
                  <span className="text-xs text-slate-400">Remaining Balance</span>
                  <span className={`text-xs font-mono font-bold ${
                    totalBudget - totalSpent < 0 ? 'text-red-400' : 'text-slate-300'
                  }`}>
                    {formatCurrency(totalBudget - totalSpent)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Researchers Section */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  Assigned Research Investigators & Scientists
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Institutional researchers responsible for milestone delivery and quarterly reporting.
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition border border-slate-700"
                >
                  <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                  Assign / Remove
                </button>
              )}
            </div>

            {(project.researchers || []).length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-950/50 border border-slate-800/80">
                <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No researchers assigned to this project yet.</p>
                {isAdmin && (
                  <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    + Assign Researchers Now
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.researchers.map((res) => (
                  <div
                    key={res.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm shrink-0">
                      {res.name?.charAt(0)?.toUpperCase() || 'R'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-semibold text-slate-200 truncate" title={res.name}>
                          {res.name}
                        </h4>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {res.role}
                        </span>
                      </div>
                      <a
                        href={`mailto:${res.email}`}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 transition truncate mt-1"
                        title={res.email}
                      >
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{res.email}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Documents Management */}
      {activeTab === 'documents' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <ProjectDocuments projectId={project.id} />
        </div>
      )}

      {/* Tab: Reports & Funds Preview */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Quarterly Progress Reports Section */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  Quarterly Technical Progress Reports
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Scientific milestones submitted by the lead investigation team.
                </p>
              </div>
              <Link
                to="/reports"
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
              >
                Go to Reports Hub →
              </Link>
            </div>

            {(!project.reports || project.reports.length === 0) ? (
              <div className="p-8 text-center rounded-xl bg-slate-950/50 border border-slate-800/80">
                <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No quarterly progress reports submitted yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4">Report Title</th>
                      <th className="py-3 px-4">Progress Metric</th>
                      <th className="py-3 px-4">Review Status</th>
                      <th className="py-3 px-4">Completed Work Summary</th>
                      <th className="py-3 px-4 text-right">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {reportsList.map((rpt) => (
                      <tr key={rpt.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-4 font-mono font-semibold text-amber-400">
                          Q{rpt.quarter} {rpt.year}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-200">
                          {rpt.title}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-400 h-1.5 rounded-full"
                                style={{ width: `${rpt.progress}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] text-slate-300">{rpt.progress}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            rpt.status === 'APPROVED' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : rpt.status === 'REJECTED'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {rpt.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={rpt.completedWork}>
                          {rpt.completedWork || '—'}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500 font-mono text-[11px]">
                          {formatDate(rpt.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Linked Fund Reports Section */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  Quarterly Fund Utilization Statements
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Financial dispatches, grants received, and audit expenditures.
                </p>
              </div>
              <Link
                to="/funds"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
              >
                Go to Fund Tracker →
              </Link>
            </div>

            {(!project.fundReports || project.fundReports.length === 0) ? (
              <div className="p-8 text-center rounded-xl bg-slate-950/50 border border-slate-800/80">
                <Coins className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No quarterly fund statements registered yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4">Amount Received</th>
                      <th className="py-3 px-4">Amount Spent</th>
                      <th className="py-3 px-4 text-right">Net Quarterly Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {project.fundReports.map((fr) => {
                      const net = (fr.amountReceived || 0) - (fr.amountSpent || 0);
                      return (
                        <tr key={fr.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3 px-4 font-mono font-semibold text-slate-300">
                            Q{fr.quarter} {fr.year}
                          </td>
                          <td className="py-3 px-4 font-mono text-blue-400">
                            {formatCurrency(fr.amountReceived)}
                          </td>
                          <td className="py-3 px-4 font-mono text-emerald-400">
                            {formatCurrency(fr.amountSpent)}
                          </td>
                          <td className={`py-3 px-4 text-right font-mono font-semibold ${
                            net < 0 ? 'text-red-400' : 'text-slate-300'
                          }`}>
                            {formatCurrency(net)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Modals */}
      {isAdmin && isEditModalOpen && (
        <EditProjectModal
          project={project}
          onClose={() => setIsEditModalOpen(false)}
          onProjectUpdated={(updated) => {
            setProject(prev => ({ ...prev, ...updated }));
            setIsEditModalOpen(false);
          }}
        />
      )}

      {isAdmin && isAssignModalOpen && (
        <ResearcherAssignModal
          project={project}
          onClose={() => setIsAssignModalOpen(false)}
          onResearchersUpdated={() => {
            fetchProjectDetails();
            setIsAssignModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
