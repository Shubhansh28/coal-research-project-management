import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import { projectsApi } from '../../api/client';
import ProjectStatusBadge from '../../components/projects/ProjectStatusBadge';
import CreateProjectModal from '../../components/projects/CreateProjectModal';
import { 
  FolderGit2, 
  Search, 
  Plus, 
  LayoutGrid, 
  Table as TableIcon, 
  Users, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  FolderSearch
} from 'lucide-react';

export default function ProjectsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [fundingFilter, setFundingFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectsApi.list();
      setProjects(res?.projects || []);
    } catch (err) {
      console.error('Failed to fetch projects list:', err);
      setError(err.message || 'Unable to load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filtering Logic
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Search matching title or projectCode
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        (project.title && project.title.toLowerCase().includes(query)) ||
        (project.projectCode && project.projectCode.toLowerCase().includes(query));

      // Funding Type filter
      const matchesFunding = fundingFilter === 'ALL' || project.fundingType === fundingFilter;

      // Status filter
      const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;

      return matchesSearch && matchesFunding && matchesStatus;
    });
  }, [projects, searchQuery, fundingFilter, statusFilter]);

  const formatDate = (isoString) => {
    if (!isoString) return 'Not specified';
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <FolderGit2 className="w-6 h-6 text-amber-500" />
            Projects Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Centrally monitor Coal S&T and R&D projects with financial, milestone, and documentation tracking.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            New Research Project
          </button>
        )}
      </div>

      {/* Search Bar & Filter Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search projects by title or project code (e.g. CR-2026-001)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Funding Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">Funding:</span>
              <select
                value={fundingFilter}
                onChange={(e) => setFundingFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 transition"
              >
                <option value="ALL">All Funding Types</option>
                <option value="ST">Science & Technology (ST)</option>
                <option value="RD">Research & Development (RD)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 transition"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved / Active</option>
                <option value="REJECTED">Rejected</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'grid'
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'table'
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-16 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading projects directory...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Failed to Retrieve Projects</h3>
          <p className="text-xs text-slate-400 mt-1">{error}</p>
          <button
            onClick={fetchProjects}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl transition"
          >
            Retry
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-slate-900 border border-slate-800 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <FolderSearch className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">No Projects Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || fundingFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'No projects match your active search terms and filter criteria.'
              : 'There are currently no research projects registered in the system.'}
          </p>
          {(searchQuery || fundingFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFundingFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="mt-4 text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => {
            const latestRpt = proj.reports && proj.reports.length > 0 
              ? [...proj.reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] 
              : null;
            const progress = latestRpt?.progress || 0;

            return (
              <div
                key={proj.id}
                onClick={() => navigate(`/projects/${proj.id}`)}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 transition flex flex-col justify-between group cursor-pointer shadow-md"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {proj.projectCode}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        proj.fundingType === 'ST'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      }`}>
                        {proj.fundingType}
                      </span>
                      <ProjectStatusBadge
                        status={proj.status}
                        projectId={proj.id}
                        editable={false}
                      />
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-base font-semibold text-slate-100 group-hover:text-amber-400 transition line-clamp-2 leading-snug">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {proj.description || 'No detailed project description recorded.'}
                  </p>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <div>
                      <span className="text-slate-500 block">Sanctioned Budget</span>
                      <span className="font-semibold text-slate-200 font-mono mt-0.5 block">
                        {formatCurrency(proj.budget)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Team Assigned</span>
                      <span className="font-semibold text-slate-200 mt-0.5 block flex items-center gap-1">
                        <Users className="w-3 h-3 text-cyan-400" />
                        {(proj.researchers || []).length} Researchers
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Quarterly Progress & Link Action */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      Progress {latestRpt ? `(Q${latestRpt.quarter})` : ''}
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-400">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500">
                      {proj.startDate ? formatDate(proj.startDate) : 'No start date'}
                    </span>
                    <span className="text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      View Hub <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Project Code</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Budget</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Progress</th>
                  <th className="py-3.5 px-4">Researchers</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProjects.map((proj) => {
                  const latestRpt = proj.reports && proj.reports.length > 0 
                    ? [...proj.reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] 
                    : null;
                  const progress = latestRpt?.progress || 0;

                  return (
                    <tr
                      key={proj.id}
                      onClick={() => navigate(`/projects/${proj.id}`)}
                      className="hover:bg-slate-800/40 transition cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                        {proj.projectCode}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200 max-w-xs truncate" title={proj.title}>
                        {proj.title}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          proj.fundingType === 'ST'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}>
                          {proj.fundingType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                        {formatCurrency(proj.budget)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <ProjectStatusBadge
                          status={proj.status}
                          projectId={proj.id}
                          editable={false}
                        />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-amber-500 h-1.5 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-slate-300">{progress}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {(proj.researchers || []).length} assigned
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300">
                          Details <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Create Project Modal */}
      {isAdmin && isCreateModalOpen && (
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onProjectCreated={() => {
            fetchProjects();
            setIsCreateModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
