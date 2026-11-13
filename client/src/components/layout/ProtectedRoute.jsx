import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import { ShieldX, Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400">Verifying session credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="p-4 rounded-full bg-red-950/50 border border-red-800/80 mb-4">
          <ShieldX className="w-12 h-12 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Your account role (<span className="text-amber-400 font-semibold">{user.role}</span>) does not have authorization to view this section.
        </p>
        <a
          href={user.role === 'ADMIN' ? '/admin/dashboard' : '/researcher/dashboard'}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          Return to Authorized Dashboard
        </a>
      </div>
    );
  }

  return children;
}
