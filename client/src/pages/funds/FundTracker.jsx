import { useState, useEffect, useMemo, useCallback } from 'react';
import useAuth from '../../context/useAuth';
import { fundReportsApi, projectsApi } from '../../api/client';
import { 
  BarChart3, 
  Plus, 
  IndianRupee, 
  Coins, 
  Building2, 
  Loader2, 
  AlertCircle, 
  X, 
  FilePlus2, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight
} from 'lucide-react';

export default function FundTracker() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const currentYear = new Date().getFullYear();

  const [fundReports, setFundReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [selectedQuarter, setSelectedQuarter] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');

  // Modal State for Submitting Fund Report (Researchers)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    amountReceived: '',
    amountSpent: '',
    quarter: 1,
    year: currentYear
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Load Projects for Dropdowns
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await projectsApi.list();
        const list = res?.projects || [];
        setProjects(list);
        if (list.length > 0 && !formData.projectId) {
          setFormData(prev => ({ ...prev, projectId: list[0].id }));
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    }
    loadProjects();
  }, []);

  const fetchFundReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedProject !== 'ALL') params.projectId = selectedProject;
      if (selectedQuarter !== 'ALL') params.quarter = selectedQuarter;
      if (selectedYear !== 'ALL') params.year = selectedYear;

      const res = await fundReportsApi.list(params);
      setFundReports(res?.fundReports || []);
    } catch (err) {
      console.error('Failed to fetch fund reports:', err);
      setError(err.message || 'Unable to retrieve fund statements.');
    } finally {
      setLoading(false);
    }
  }, [selectedProject, selectedQuarter, selectedYear]);

  useEffect(() => {
    fetchFundReports();
  }, [fetchFundReports]);

  // Aggregate Financial Analytics across filtered results
  const analytics = useMemo(() => {
    let totalReceived = 0;
    let totalSpent = 0;

    fundReports.forEach(fr => {
      totalReceived += (fr.amountReceived || 0);
      totalSpent += (fr.amountSpent || 0);
    });

    const netBalance = totalReceived - totalSpent;
    const utilizationRate = totalReceived > 0 
      ? Math.min(Math.round((totalSpent / totalReceived) * 100), 100) 
      : 0;

    return {
      totalReceived,
      totalSpent,
      netBalance,
      utilizationRate
    };
  }, [fundReports]);

  // Grouped per-project summary for utilization progress bars
  const projectSummaries = useMemo(() => {
    const map = {};

    fundReports.forEach(fr => {
      const pId = fr.projectId;
      const pCode = fr.project?.projectCode || 'CR';
      const pTitle = fr.project?.title || 'Unknown Project';

      if (!map[pId]) {
        map[pId] = {
          id: pId,
          projectCode: pCode,
          title: pTitle,
          received: 0,
          spent: 0,
          statementsCount: 0
        };
      }

      map[pId].received += (fr.amountReceived || 0);
      map[pId].spent += (fr.amountSpent || 0);
      map[pId].statementsCount += 1;
    });

    return Object.values(map);
  }, [fundReports]);

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt || 0);
  };

  const handleOpenSubmit = () => {
    setModalError('');
    if (!formData.projectId && projects.length > 0) {
      setFormData(prev => ({ ...prev, projectId: projects[0].id }));
    }
    setIsSubmitModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quarter' || name === 'year' 
        ? Number(value) 
        : value
    }));
  };

  const handleSubmitFundReport = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.projectId) {
      setModalError('Please select a project.');
      return;
    }

    const spent = Number(formData.amountSpent);
    const received = Number(formData.amountReceived);

    if (isNaN(spent) || spent < 0 || isNaN(received) || received < 0) {
      setModalError('Amount Received and Amount Spent must be valid non-negative numbers.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        projectId: formData.projectId,
        amountSpent: spent,
        amountReceived: received,
        quarter: Number(formData.quarter),
        year: Number(formData.year)
      };

      await fundReportsApi.create(payload);
      await fetchFundReports();
      setIsSubmitModalOpen(false);
      setFormData(prev => ({
        ...prev,
        amountReceived: '',
        amountSpent: ''
      }));
    } catch (err) {
      console.error('Failed to submit fund report:', err);
      if (err.status === 409) {
        setModalError('A fund report already exists for this project, quarter, and year.');
      } else if (err.status === 404) {
        setModalError('Project not found or not assigned to your account.');
      } else {
        setModalError(err.message || 'Fund report submission failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-emerald-500" />
            Fund Utilization & Expenditure Tracker
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Reconcile grant disbursements, field research expenditures, and quarterly cash balances.
          </p>
        </div>

        {!isAdmin && (
          <button
            onClick={handleOpenSubmit}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Record Quarterly Fund Statement
          </button>
        )}
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Funds Received */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Grants Received
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-100 font-mono">
              {formatCurrency(analytics.totalReceived)}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Disbursed to projects in scope</p>
          </div>
        </div>

        {/* Total Expenditure Spent */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Expenditure Spent
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {formatCurrency(analytics.totalSpent)}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Utilized on equipment, labs & testing</p>
          </div>
        </div>

        {/* Remaining Net Balance */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Remaining Fund Balance
            </span>
            <div className={`p-2 rounded-xl ${analytics.netBalance < 0 ? 'bg-red-500/10 text-red-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-extrabold font-mono ${analytics.netBalance < 0 ? 'text-red-400' : 'text-slate-100'}`}>
              {formatCurrency(analytics.netBalance)}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Liquid balance remaining in projects</p>
          </div>
        </div>

        {/* Overall Utilization Rate */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Burn / Utilization Rate
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-amber-400 font-mono">
                {analytics.utilizationRate}%
              </span>
              <span className="text-xs text-slate-400">utilization</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-amber-400 h-1.5 rounded-full"
                style={{ width: `${analytics.utilizationRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-wrap items-center gap-4">
        {/* Project Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Project:</span>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 transition max-w-xs truncate"
          >
            <option value="ALL">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                [{p.projectCode}] {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* Quarter Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Quarter:</span>
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="ALL">All Quarters</option>
            <option value="1">Quarter 1 (Q1)</option>
            <option value="2">Quarter 2 (Q2)</option>
            <option value="3">Quarter 3 (Q3)</option>
            <option value="4">Quarter 4 (Q4)</option>
          </select>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="ALL">All Years</option>
            {[2024, 2025, 2026, 2027].map(yr => (
              <option key={yr} value={yr}>
                Year {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Project-by-Project Fund Utilization & Balance Progress Bars */}
      {projectSummaries.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            Project Fund Utilization Balances
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectSummaries.map((ps) => {
              const balance = ps.received - ps.spent;
              const pct = ps.received > 0 ? Math.min(Math.round((ps.spent / ps.received) * 100), 100) : 0;

              return (
                <div key={ps.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {ps.projectCode}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-200 line-clamp-1 mt-0.5" title={ps.title}>
                        {ps.title}
                      </h4>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {pct}% Spent
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        pct > 90 ? 'bg-red-500' : pct > 75 ? 'bg-amber-500' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                    <span>Received: <strong className="text-blue-400">{formatCurrency(ps.received)}</strong></span>
                    <span>Spent: <strong className="text-emerald-400">{formatCurrency(ps.spent)}</strong></span>
                    <span>Bal: <strong className={balance < 0 ? 'text-red-400' : 'text-slate-200'}>{formatCurrency(balance)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Quarterly Comparison Table */}
      {loading ? (
        <div className="p-16 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading fund utilization records...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Unable to Fetch Fund Statements</h3>
          <p className="text-xs text-slate-400 mt-1">{error}</p>
          <button
            onClick={fetchFundReports}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl transition"
          >
            Retry
          </button>
        </div>
      ) : fundReports.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-slate-900 border border-slate-800 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <Coins className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">No Fund Statements Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            There are no fund statements filed for the selected project and period filters.
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
                  <th className="py-3.5 px-4">Amount Received</th>
                  <th className="py-3.5 px-4">Amount Spent</th>
                  <th className="py-3.5 px-4">Quarterly Net</th>
                  <th className="py-3.5 px-4 text-right">Burn Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {fundReports.map((fr) => {
                  const net = (fr.amountReceived || 0) - (fr.amountSpent || 0);
                  const rate = fr.amountReceived > 0 
                    ? Math.round((fr.amountSpent / fr.amountReceived) * 100) 
                    : 0;

                  return (
                    <tr key={fr.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-200 whitespace-nowrap">
                        Q{fr.quarter} {fr.year}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-mono text-xs font-bold text-amber-400 block">
                          {fr.project?.projectCode}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate block" title={fr.project?.title}>
                          {fr.project?.title}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-blue-400 whitespace-nowrap">
                        {formatCurrency(fr.amountReceived)}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400 whitespace-nowrap">
                        {formatCurrency(fr.amountSpent)}
                      </td>

                      <td className={`py-3.5 px-4 font-mono font-bold whitespace-nowrap ${net < 0 ? 'text-red-400' : 'text-slate-200'}`}>
                        {formatCurrency(net)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          rate > 100 ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          rate > 80 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {rate}%
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

      {/* Submission Modal for Researchers */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-slate-100 font-semibold text-base">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <FilePlus2 className="w-5 h-5" />
                </div>
                <div>
                  <h3>Record Quarterly Fund Statement</h3>
                  <p className="text-xs text-slate-400 font-normal mt-0.5">
                    File grant receipts and research expenditures
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                disabled={submitting}
                className="text-slate-400 hover:text-slate-200 transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitFundReport} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Project select */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  Assigned Research Project *
                </label>
                <select
                  name="projectId"
                  required
                  value={formData.projectId}
                  onChange={handleFormChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                >
                  {projects.map(proj => (
                    <option key={proj.id} value={proj.id}>
                      [{proj.projectCode}] {proj.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quarter & Year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Quarter *
                  </label>
                  <select
                    name="quarter"
                    required
                    value={formData.quarter}
                    onChange={handleFormChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                  >
                    <option value={1}>Q1 (Apr - Jun)</option>
                    <option value={2}>Q2 (Jul - Sep)</option>
                    <option value={3}>Q3 (Oct - Dec)</option>
                    <option value={4}>Q4 (Jan - Mar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Year *
                  </label>
                  <input
                    type="number"
                    name="year"
                    required
                    min={2000}
                    max={2100}
                    value={formData.year}
                    onChange={handleFormChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Amount Received */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-blue-400" />
                  Amount Received (₹) *
                </label>
                <input
                  type="number"
                  name="amountReceived"
                  required
                  min={0}
                  step="any"
                  placeholder="e.g., 500000"
                  value={formData.amountReceived}
                  onChange={handleFormChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Amount Spent */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                  Amount Spent (₹) *
                </label>
                <input
                  type="number"
                  name="amountSpent"
                  required
                  min={0}
                  step="any"
                  placeholder="e.g., 345000"
                  value={formData.amountSpent}
                  onChange={handleFormChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || projects.length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Filing Statement...
                    </>
                  ) : (
                    'Save Fund Statement'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
