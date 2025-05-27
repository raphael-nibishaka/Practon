import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface OrganizationRouteProps {
    children: React.ReactElement;
}

const OrganizationRoute: React.FC<OrganizationRouteProps> = ({ children }) => {
    const [isOrganization, setIsOrganization] = useState<boolean | null>(null);

    useEffect(() => {
        const storedUserData = sessionStorage.getItem('user');
        if (!storedUserData) {
            setIsOrganization(false);
            return;
        }

        try {
            const parsedData = JSON.parse(storedUserData);
            const isOrg = parsedData.role === 'ORGANIZATION';
            setIsOrganization(isOrg);
        } catch (error) {
            console.error('Error parsing user data:', error);
            setIsOrganization(false);
        }
    }, []);

    if (isOrganization === null) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!isOrganization) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default OrganizationRoute;
