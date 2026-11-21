import { useState, useEffect, useCallback } from 'react';
import useAuth from '../../context/useAuth';
import { documentsApi } from '../../api/client';
import { 
  FileText, 
  UploadCloud, 
  ExternalLink, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  Plus, 
  X, 
  Link as LinkIcon,
  Clock,
  ShieldAlert,
  FileCheck2
} from 'lucide-react';

export default function ProjectDocuments({ projectId }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Delete State
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorStatus(null);
      const res = await documentsApi.listByProject(projectId);
      setDocuments(res?.documents || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setErrorStatus(err.status || 500);
      if (err.status === 403) {
        setError('You are not authorized to view documents for this project.');
      } else if (err.status === 404) {
        setError('Project not found or access denied.');
      } else {
        setError(err.message || 'Unable to retrieve project documents.');
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchDocuments();
    }
  }, [projectId, fetchDocuments]);

  const handleOpenModal = () => {
    setDocName('');
    setFileUrl('');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    setModalError('');
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!docName.trim() || !fileUrl.trim()) {
      setModalError('Both document name and file URL are required.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: docName.trim(),
        fileUrl: fileUrl.trim()
      };
      const res = await documentsApi.create(projectId, payload);
      if (res?.document) {
        setDocuments(prev => [res.document, ...prev]);
      } else {
        await fetchDocuments();
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create document:', err);
      if (err.status === 403) {
        setModalError('Permission denied: Only administrators can upload or link documents.');
      } else if (err.status === 404) {
        setModalError('Project not found.');
      } else {
        setModalError(err.message || 'Failed to link document.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document reference?')) {
      return;
    }

    try {
      setDeletingId(documentId);
      setActionError('');
      await documentsApi.delete(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err) {
      console.error('Failed to delete document:', err);
      if (err.status === 403) {
        setActionError('Permission denied: Only administrators can delete documents.');
      } else if (err.status === 404) {
        setActionError('Document not found or already deleted.');
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      } else {
        setActionError(err.message || 'Failed to remove document.');
      }
    } finally {
      setDeletingId(null);
    }
  };

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
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            Project Documents & Artefacts
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Official project agreements, technical specifications, compliance reports, and attachments.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Upload Document Link
          </button>
        )}
      </div>

      {/* Global Action Error Alert */}
      {actionError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading project documents...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-3">
            {errorStatus === 403 ? <ShieldAlert className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
          <h3 className="text-sm font-semibold text-slate-200">
            {errorStatus === 403 ? '403 - Forbidden Access' : errorStatus === 404 ? '404 - Project Not Found' : 'Error Occurred'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchDocuments}
            className="mt-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      ) : documents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-medium text-slate-300">No Documents Uploaded Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {isAdmin 
              ? 'Click "Upload Document Link" to add official agreements, proposals, and deliverables.' 
              : 'The project administrators have not attached any public documentation references yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200 line-clamp-1" title={doc.name}>
                        {doc.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        Added {formatDate(doc.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-400 break-all bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 font-mono text-[11px] line-clamp-2">
                  {doc.fileUrl}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Document
                </a>

                {isAdmin && (
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    disabled={deletingId === doc.id}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Delete document"
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Upload/Link Modal (Admin Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-slate-100 font-semibold text-base">
                <UploadCloud className="w-5 h-5 text-amber-500" />
                <h3>Add Document Reference</h3>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={submitting}
                className="text-slate-400 hover:text-slate-200 transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Document Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Detailed Project Report (DPR) Final"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Document / File URL *
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="url"
                    required
                    placeholder="https://storage.googleapis.com/... or cloud link"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Provide an accessible cloud or storage URL for this technical asset.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-xs rounded-xl shadow transition disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Attach Document'
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
