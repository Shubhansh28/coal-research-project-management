import { useState, useEffect } from 'react';
import { projectsApi } from '../../api/client';
import { X, UserPlus, UserMinus, Search, AlertCircle, Loader2, Check, Users } from 'lucide-react';

function ResearcherAssignContent({ project, onClose, onResearchersUpdated }) {
  const [availableResearchers, setAvailableResearchers] = useState([]);
  const [assignedResearchers, setAssignedResearchers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [detailsRes, availRes] = await Promise.all([
          projectsApi.getById(project.id),
          projectsApi.getAvailableResearchers(project.id)
        ]);

        if (isMounted) {
          if (detailsRes?.project) {
            setAssignedResearchers(detailsRes.project.researchers || []);
          }
          if (availRes?.data) {
            setAvailableResearchers(availRes.data);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load researchers list.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [project.id]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (selectedIds.length === 0 || assigning) return;
    try {
      setAssigning(true);
      setError('');
      const res = await projectsApi.assignResearchers(project.id, selectedIds);
      if (res?.project) {
        setSelectedIds([]);
        // Refresh local lists
        const [detailsRes, availRes] = await Promise.all([
          projectsApi.getById(project.id),
          projectsApi.getAvailableResearchers(project.id)
        ]);
        if (detailsRes?.project) {
          setAssignedResearchers(detailsRes.project.researchers || []);
        }
        if (availRes?.data) {
          setAvailableResearchers(availRes.data);
        }
        if (onResearchersUpdated) {
          onResearchersUpdated(res.project);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to assign researchers.');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (userId, userName) => {
    const confirmRemove = window.confirm(
      `Are you sure you want to remove researcher "${userName}" from project ${project.projectCode}?`
    );
    if (!confirmRemove || removingId) return;

    try {
      setRemovingId(userId);
      setError('');
      const res = await projectsApi.removeResearcher(project.id, userId);
      if (res?.project) {
        const [detailsRes, availRes] = await Promise.all([
          projectsApi.getById(project.id),
          projectsApi.getAvailableResearchers(project.id)
        ]);
        if (detailsRes?.project) {
          setAssignedResearchers(detailsRes.project.researchers || []);
        }
        if (availRes?.data) {
          setAvailableResearchers(availRes.data);
        }
        if (onResearchersUpdated) {
          onResearchersUpdated(res.project);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to remove researcher.');
    } finally {
      setRemovingId(null);
    }
  };

  const filteredAvailable = availableResearchers.filter(
    (r) =>
      r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Manage Project Researchers</h2>
            <p className="text-xs text-slate-400">
              Allocation for <span className="text-amber-400 font-mono">{project.projectCode}</span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mx-6 mt-4 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 flex items-start space-x-3 text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Section 1: Currently Assigned Researchers */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
            Assigned Researchers ({assignedResearchers.length})
          </h3>

          {loading ? (
            <div className="py-6 flex items-center justify-center text-slate-400 text-xs">
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-amber-500" />
              Loading assignments...
            </div>
          ) : assignedResearchers.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 text-center text-xs text-slate-400">
              No researchers are currently assigned to this project.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {assignedResearchers.map((researcher) => (
                <div
                  key={researcher.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                >
                  <div className="overflow-hidden pr-2">
                    <div className="font-semibold text-slate-200 truncate">
                      {researcher.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {researcher.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(researcher.id, researcher.name)}
                    disabled={removingId === researcher.id}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition shrink-0"
                    title="Remove from project"
                  >
                    {removingId === researcher.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UserMinus className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Assign Available Researchers */}
        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
            Allocate New Researchers
          </h3>

          {/* Search Input */}
          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search eligible researchers by name or email..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition"
            />
          </div>

          {loading ? (
            <div className="py-6 flex items-center justify-center text-slate-400 text-xs">
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-amber-500" />
              Loading available researchers...
            </div>
          ) : filteredAvailable.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 text-center text-xs text-slate-400">
              {searchQuery
                ? 'No matching researchers found.'
                : 'All registered researchers are already assigned to this project.'}
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredAvailable.map((researcher) => {
                const isSelected = selectedIds.includes(researcher.id);
                return (
                  <div
                    key={researcher.id}
                    onClick={() => toggleSelect(researcher.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer select-none transition ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="font-medium text-slate-200 truncate">
                        {researcher.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {researcher.email}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition shrink-0 ${
                        isSelected
                          ? 'bg-amber-500 border-amber-500 text-slate-950'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {selectedIds.length} researcher(s) selected
        </span>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={assigning}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={selectedIds.length === 0 || assigning}
            className="flex items-center px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 disabled:opacity-50 transition"
          >
            {assigning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                Assign Selected
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResearcherAssignModal({ isOpen, onClose, project, onResearchersUpdated }) {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <ResearcherAssignContent
        key={project.id}
        project={project}
        onClose={onClose}
        onResearchersUpdated={onResearchersUpdated}
      />
    </div>
  );
}
