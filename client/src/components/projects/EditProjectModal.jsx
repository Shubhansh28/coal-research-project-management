import { useState } from 'react';
import { projectsApi } from '../../api/client';
import { X, Edit3, AlertCircle, Loader2, Calendar, IndianRupee } from 'lucide-react';

function EditProjectForm({ project, onClose, onProjectUpdated }) {
  const [formData, setFormData] = useState({
    title: project.title || '',
    projectCode: project.projectCode || '',
    description: project.description || '',
    fundingType: project.fundingType || 'ST',
    budget: project.budget !== undefined ? String(project.budget) : '',
    startDate: project.startDate ? project.startDate.split('T')[0] : '',
    endDate: project.endDate ? project.endDate.split('T')[0] : '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericBudget = Number(formData.budget);
    if (isNaN(numericBudget) || numericBudget < 0) {
      setError('Budget must be a non-negative number.');
      return;
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        setError('End Date cannot be earlier than Start Date.');
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        projectCode: formData.projectCode.trim().toUpperCase(),
        description: formData.description.trim() || null,
        fundingType: formData.fundingType,
        budget: numericBudget,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };

      const res = await projectsApi.update(project.id, payload);
      if (res?.success) {
        onProjectUpdated(res.project);
        onClose();
      }
    } catch (err) {
      if (err.status === 409) {
        setError('A project with this Project Code already exists.');
      } else if (err.status === 400) {
        setError(err.message || 'Validation error. Please verify the project fields.');
      } else {
        setError(err.message || 'Failed to update project. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Edit Project Specifications</h2>
            <p className="text-xs text-slate-400">Modify registered details for {project.projectCode}</p>
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Title */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Project Title
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition"
            />
          </div>

          {/* Project Code */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Project Code
            </label>
            <input
              type="text"
              name="projectCode"
              required
              value={formData.projectCode}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition"
            />
          </div>

          {/* Funding Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Funding Category
            </label>
            <select
              name="fundingType"
              value={formData.fundingType}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition"
            >
              <option value="ST">Science & Technology (S&T)</option>
              <option value="RD">Research & Development (R&D)</option>
            </select>
          </div>

          {/* Budget */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Approved Budget (INR)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <IndianRupee className="w-4 h-4" />
              </div>
              <input
                type="number"
                name="budget"
                min="0"
                step="1000"
                required
                value={formData.budget}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition"
              />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Start Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Target Completion Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition"
              />
            </div>
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Project Scope & Abstract
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 shadow-md shadow-cyan-500/20 disabled:opacity-60 transition"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Saving Changes...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditProjectModal({ isOpen, onClose, project, onProjectUpdated }) {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <EditProjectForm
        key={project.id}
        project={project}
        onClose={onClose}
        onProjectUpdated={onProjectUpdated}
      />
    </div>
  );
}
