import { useState, useEffect } from 'react';
import useAuth from '../../context/useAuth';
import { dashboardApi } from '../../api/client';
import ProjectStatusBadge from '../../components/projects/ProjectStatusBadge';
import CreateProjectModal from '../../components/projects/CreateProjectModal';
import EditProjectModal from '../../components/projects/EditProjectModal';
import ResearcherAssignModal from '../../components/projects/ResearcherAssignModal';

import {
  FolderGit2,
  FolderPlus,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  ClipboardList,
  IndianRupee,
  TrendingUp,
  CreditCard,
  Users,
  Edit,
  Search,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

function formatINR(amount) {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editTargetProject, setEditTargetProject] = useState(null);
  const [assignTargetProject, setAssignTargetProject] = useState(null);

  // Initial load
  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      try {
        const res = await dashboardApi.getAdmin();
        if (isMounted && res?.success && res?.dashboard) {
          setDashboardData(res.dashboard);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load dashboard intelligence.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, []);

  // Manual or post-action refresh
  const reloadData = async () => {
    try {
      setRefreshing(true);
      setError('');
      const res = await dashboardApi.getAdmin();
      if (res?.success && res?.dashboard) {
        setDashboardData(res.dashboard);
      }
    } catch (err) {
      setError(err.message || 'Unable to refresh dashboard intelligence.');
    } finally {
      setRefreshing(false);
    }
  };

  const projects = dashboardData?.projects || [];
  const statusCounts = dashboardData?.projectsByStatus || {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    COMPLETED: 0,
  };
  const financials = dashboardData?.financialSummary || {
    totalBudget: 0,
    totalAmountReceived: 0,
    totalAmountSpent: 0,
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.projectCode?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner / Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
            <span>Ministry of Coal • Science & Technology Wing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            Administrative Cockpit
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Welcome back, <span className="text-slate-200 font-semibold">{user?.name}</span>. Real-time R&D surveillance and fiscal monitoring.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={reloadData}
            disabled={refreshing || loading}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 flex items-start space-x-3 text-red-200 text-sm">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Section 1: KPI Metrics & Financial Overviews */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-900 border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status Breakdown Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Total Projects */}
            <div className="col-span-2 sm:col-span-1 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Portfolio</span>
                <FolderGit2 className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-100">
                {dashboardData?.totalProjects ?? 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Managed projects</div>
            </div>

            {/* Pending */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-amber-500/20 shadow-sm">
              <div className="flex items-center justify-between text-amber-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">
                {statusCounts.PENDING ?? 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Awaiting approval</div>
            </div>

            {/* Approved / Active */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/20 shadow-sm">
              <div className="flex items-center justify-between text-emerald-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Approved</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300">
                {statusCounts.APPROVED ?? 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">In active research</div>
            </div>

            {/* Rejected */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-red-500/20 shadow-sm">
              <div className="flex items-center justify-between text-red-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Rejected</span>
                <XCircle className="w-4 h-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-red-300">
                {statusCounts.REJECTED ?? 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Declined proposals</div>
            </div>

            {/* Completed */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/20 shadow-sm">
              <div className="flex items-center justify-between text-indigo-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
                <Award className="w-4 h-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-300">
                {statusCounts.COMPLETED ?? 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Final reports filed</div>
            </div>
          </div>

          {/* Fiscal Overview + Actionable Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Budget */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Sanctioned Budget</span>
                <IndianRupee className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-100">
                {formatINR(financials.totalBudget)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Across all coal S&T allocations</p>
            </div>

            {/* Total Amount Received */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Grants Disbursed</span>
                <CreditCard className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-cyan-300">
                {formatINR(financials.totalAmountReceived)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Received by executing agencies</p>
            </div>

            {/* Total Amount Spent */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Utilised</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-300">
                {formatINR(financials.totalAmountSpent)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Reported expenditures</p>
            </div>

            {/* Pending Report Reviews */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/30 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-amber-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Pending Reviews</span>
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-amber-300">
                  {dashboardData?.pendingReportReviews ?? 0}
                </div>
              </div>
              <a
                href="/reports"
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4 mt-2 inline-block"
              >
                Inspect pending progress reports →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Projects Overview Table with Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Projects Administration Registry</h2>
            <p className="text-xs text-slate-400">Track and manage active research assignments and approvals</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title or code..."
                className="w-full sm:w-56 pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
              Fetching project registry...
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <FolderGit2 className="w-8 h-8 mx-auto text-slate-600 mb-3" />
              <p className="font-medium text-slate-300">No projects found</p>
              <p className="text-slate-500 mt-1">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try adjusting your search criteria or status filter.'
                  : 'Get started by creating your first coal research project.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Project Details</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Budget & Utilization</th>
                    <th className="px-5 py-3.5">Latest Progress</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredProjects.map((p) => {
                    const budget = p.budget || 0;
                    const spent = p.amountSpent || 0;
                    const spentPct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
                    const latestReport = p.latestReport;

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition">
                        {/* Title & Code */}
                        <td className="px-5 py-4 max-w-xs sm:max-w-sm">
                          <div className="font-semibold text-slate-100 truncate text-sm">
                            {p.title}
                          </div>
                          <div className="font-mono text-[11px] text-amber-400/90 mt-0.5">
                            {p.projectCode}
                          </div>
                        </td>

                        {/* Status (Interactive for Admin) */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <ProjectStatusBadge
                            status={p.status}
                            projectId={p.id}
                            editable={true}
                            onStatusUpdated={reloadData}
                          />
                        </td>

                        {/* Budget & Utilization */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-200">
                            {formatINR(budget)}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Spent: <span className="text-emerald-400">{formatINR(spent)}</span> ({spentPct}%)
                          </div>
                        </td>

                        {/* Latest Progress */}
                        <td className="px-5 py-4 min-w-[180px]">
                          {latestReport ? (
                            <div>
                              <div className="flex items-center justify-between text-[11px] mb-1">
                                <span className="text-slate-400">
                                  Q{latestReport.quarter} {latestReport.year}
                                </span>
                                <span className="font-semibold text-slate-200">
                                  {latestReport.progress}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-amber-400 to-emerald-400 h-1.5 rounded-full"
                                  style={{ width: `${Math.min(latestReport.progress, 100)}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px] italic">
                              No reports filed yet
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Assign Researchers Button */}
                            <button
                              type="button"
                              onClick={() => setAssignTargetProject(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                              title="Assign / Manage Researchers"
                            >
                              <Users className="w-4 h-4" />
                            </button>

                            {/* Edit Project Button */}
                            <button
                              type="button"
                              onClick={() => setEditTargetProject(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
                              title="Edit Project Specifications"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* Modal 1: Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={reloadData}
      />

      {/* Modal 2: Edit Project Modal */}
      <EditProjectModal
        isOpen={Boolean(editTargetProject)}
        project={editTargetProject}
        onClose={() => setEditTargetProject(null)}
        onProjectUpdated={reloadData}
      />

      {/* Modal 3: Researcher Assignment Modal */}
      <ResearcherAssignModal
        isOpen={Boolean(assignTargetProject)}
        project={assignTargetProject}
        onClose={() => setAssignTargetProject(null)}
        onResearchersUpdated={reloadData}
      />
    </div>
  );
}
