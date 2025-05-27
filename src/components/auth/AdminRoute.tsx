import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface User {
    name: string;
    email: string;
    role: string;
}

interface AdminRouteProps {
    children: React.ReactElement<{ user?: User | null }>;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [userData, setUserData] = useState<User | null>(null);

    useEffect(() => {
        const storedUserData = sessionStorage.getItem('user');
        if (storedUserData) {
            const user = JSON.parse(storedUserData);
            setIsAdmin(user.role === 'ADMIN');
            setUserData({
                name: `${user.firstname} ${user.lastname}`,
                email: user.email,
                role: user.role
            });
        } else {
            setIsAdmin(false);
            setUserData(null);
        }
    }, []);

    if (isAdmin === null) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/login" replace />;
    }

    return React.cloneElement(children, { user: userData });
};

export default AdminRoute;
