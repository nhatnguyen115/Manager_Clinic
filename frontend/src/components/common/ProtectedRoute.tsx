import { ReactNode } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { Loading } from '@components/ui/Loading';

interface ProtectedRouteProps {
    children?: ReactNode;
    roles?: UserRole[];
}

export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <Loading fullPage text="Checking authentication..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && user && !roles.includes(user.role)) {
        return <Navigate to="/forbidden" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};

export const RoleGuard = ({ children, roles }: { children: ReactNode; roles: UserRole[] }) => {
    const { user } = useAuth();

    if (!user || !roles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
};
