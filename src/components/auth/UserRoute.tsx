import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface User {
    name: string;
    email: string;
    role: string;
}

interface UserRouteProps {
    children: React.ReactElement;
}

const UserRoute: React.FC<UserRouteProps> = ({ children }) => {
    const [isUser, setIsUser] = useState<boolean | null>(null);
    const [userData, setUserData] = useState<User | null>(null);

    useEffect(() => {
        const storedUserData = sessionStorage.getItem('user');
        if (storedUserData) {
            const user = JSON.parse(storedUserData);
            setIsUser(user.role !== 'ADMIN');
            setUserData({
                name: `${user.firstname} ${user.lastname}`,
                email: user.email,
                role: user.role
            });
        } else {
            setIsUser(false);
            setUserData(null);
        }
    }, []);

    if (isUser === null) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!isUser) {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default UserRoute;
