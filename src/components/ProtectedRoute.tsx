import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const ProtectedRoute: React.FC = () => {
    const location = useLocation();

    // Check localStorage and handle 24h expiration
    const checkAuth = () => {
        const isAuth = localStorage.getItem('isAuthenticated') === 'true';
        const lastAccess = localStorage.getItem('organizador_last_access');

        if (isAuth && lastAccess) {
            const now = new Date().getTime();
            const lastTime = parseInt(lastAccess);
            const twentyFourHours = 24 * 60 * 60 * 1000;

            if (now - lastTime > twentyFourHours) {
                // Session expired
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('organizador_last_access');
                return false;
            }

            // Valid session, update last access
            localStorage.setItem('organizador_last_access', now.toString());
            return true;
        }
        return false;
    };

    const isAuthenticated = checkAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            const isAuthStored = localStorage.getItem('isAuthenticated') === 'true';
            const lastAccess = localStorage.getItem('organizador_last_access');

            if (isAuthStored && lastAccess) {
                toast.info('Sesión cerrada por inactividad (24h)');
            } else if (!isAuthenticated) {
                toast.error('Acceso denegado: Inicia sesión primero 🔒');
            }
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
