import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const ProtectedRoute: React.FC = () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const location = useLocation();

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error('Acceso denegado: Inicia sesión primero 🔒');
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        // Redirect to login page but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
