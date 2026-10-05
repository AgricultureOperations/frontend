import { Navigate } from 'react-router-dom';
import { useSession } from '../features/auth/hooks/useSession';
import { NoAccess } from '../shared/components/NoAccess';
import { PageLoader } from '../shared/components/PageLoader';
import { hasPermission } from '../shared/utils/permissions';

interface Props {
    children: React.ReactNode
    // "<resource>:<action>" needed to open the page, e.g. "users:view". Without it only a token is required.
    permission?: string
}

// Navigation UX, not security (see architecture.md): the backend answers 401/403 on its own.
// No token → /login. Missing permission → "No access" inside the shell, and the session stays.
export const ProtectedRoute = ({children, permission}:Props) => {
  const token = localStorage.getItem("token");
  const { me, status, error, reload } = useSession();

  if(!token){
    return <Navigate to='/login' replace/>
  }
  if (!permission) {
    return <>{children}</>
  }
  if (status === "error") {
    return <NoAccess error={error} onRetry={reload} />
  }
  if (status !== "ready") {
    return <PageLoader label="Cargando permisos…" />
  }
  if (!hasPermission(me?.permissions, permission)) {
    return <NoAccess />
  }
  return (
    <>{children}</>
  )
}
