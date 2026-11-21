import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import { dashboardApi } from '../../api/client';
import ProjectStatusBadge from '../../components/projects/ProjectStatusBadge';
import { 
  Microscope, 
  FolderGit2, 
  TrendingUp, 
  Calendar, 
  ArrowRight, 
  Clock, 
  AlertCircle, 
  Loader2, 
  FileClock,
  Layers
} from 'lucide-react';

export default function ResearcherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResearcherDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.getResearcher();
      // Server returns { success: true, dashboard: { totalProjects, projects } }
      if (res?.dashboard) {
        setDashboardData(res.dashboard);
      } else {
        setError('Failed to parse researcher dashboard metrics.');
      }
    } catch (err) {
      console.error('Failed to load researcher dashboard:', err);
      setError(err.message || 'Unable to retrieve dashboard information.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResearcherDashboard();
  }, [fetchResearcherDashboard]);

  // Derived metrics
  const projects = dashboardData?.projects || [];
  const totalAssignedProjects = projects.length;

  // Pending Reports: count projects where latestReport status is 'PENDING', or if no report exists for active projects
  const pendingReportsCount = projects.reduce((count, p) => {
    if (p.latestReport && p.latestReport.status === 'PENDING') {
      return count + 1;
    }
    // Also consider approved projects without any submitted reports as needing report action
    if (p.status === 'APPROVED' && !p.latestReport) {
      return count + 1;
    }
    return count;
  }, 0);

  // Progress Average across all assigned projects
  const progressAverage = totalAssignedProjects > 0
    ? Math.round(
        projects.reduce((acc, p) => acc + (p.latestReport?.progress || 0), 0) / totalAssignedProjects
      )
    : 0;

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

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Researcher Portal & Workspace
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Active Investigation
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Welcome back, <span className="text-cyan-400 font-semibold">{user?.name}</span>. Monitor your assigned S&T / R&D initiatives and progress deliverables.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-xl w-fit">
          <Microscope className="w-4 h-4 text-cyan-400" />
          <span>Principal Investigator</span>
        </div>
      </div>

      {/* Main Error View */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchResearcherDashboard}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="p-16 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading your researcher analytics and assigned projects...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Total Assigned Projects */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Assigned Projects
                </span>
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <FolderGit2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-100 font-mono">
                  {totalAssignedProjects}
                </span>
                <span className="text-xs text-slate-400">active portfolios</span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Directly attached to your account</span>
                <Link to="/projects" className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 font-semibold">
                  Browse <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: Pending Reports */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Pending Reports
                </span>
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <FileClock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-100 font-mono">
                  {pendingReportsCount}
                </span>
                <span className="text-xs text-amber-400/90 font-medium">awaiting review / filing</span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Quarterly deliverables</span>
                <Link to="/reports" className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 font-semibold">
                  Review <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3: Progress Average */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Progress Average
                </span>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-100 font-mono">
                  {progressAverage}%
                </span>
                <span className="text-xs text-slate-400">overall milestone completion</span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${progressAverage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Projects List / Grid Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  Your Assigned Research Projects
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click on any project to open the Comprehensive Project Detail Hub, upload documents, and track quarterly financials.
                </p>
              </div>

              <Link
                to="/projects"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
              >
                View in Directory <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-dashed border-slate-800">
                <Microscope className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-200">No Projects Currently Assigned</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  You have not been assigned as an investigator to any active research projects yet. Contact the system administrator for assignment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((proj) => {
                  const latestReport = proj.latestReport;
                  const progress = latestReport?.progress || 0;

                  return (
                    <div
                      key={proj.id}
                      onClick={() => navigate(`/projects/${proj.id}`)}
                      className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition flex flex-col justify-between group cursor-pointer shadow-md"
                    >
                      <div>
                        {/* Header Badges */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {proj.projectCode}
                          </span>
                          <ProjectStatusBadge
                            status={proj.status}
                            projectId={proj.id}
                            editable={false}
                          />
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-semibold text-slate-100 group-hover:text-cyan-400 transition line-clamp-2 leading-snug">
                          {proj.title}
                        </h3>

                        {/* Lifecycle Dates */}
                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
                          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">
                            {formatDate(proj.startDate)} — {formatDate(proj.endDate)}
                          </span>
                        </div>
                      </div>

                      {/* Latest Quarterly Progress Bar */}
                      <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            {latestReport
                              ? `Quarterly Progress (Q${latestReport.quarter} ${latestReport.year})`
                              : 'Quarterly Progress (No report)'}
                          </span>
                          <span className="font-mono text-xs font-bold text-cyan-400">{progress}%</span>
                        </div>

                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-slate-500">
                            {latestReport ? `Report ${latestReport.status}` : 'Pending submission'}
                          </span>
                          <span className="text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                            Open Details Hub <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
