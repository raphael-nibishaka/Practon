import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import StatsCard from './StatsCardComponent';
import { UserData, Skill, Certification } from '../../models/types';
import { fetchUserSkills, fetchUserCertifications } from '../../services/api';
import { ROUTES } from '../../utils/constants';

interface DashboardProps {
    userData: UserData | null;
    onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userData, onLogout }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [skills, setSkills] = useState<Skill[]>([]);
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userData) {
            navigate(ROUTES.LOGIN);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const [skillsData, certificationsData] = await Promise.all([
                    fetchUserSkills(userData.code),
                    fetchUserCertifications(userData.code)
                ]);
                setSkills(skillsData);
                setCertifications(certificationsData);
                setError(null);
            } catch (err) {
                setError('Failed to fetch user data');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userData, navigate]);

    const getFirstLetter = () => {
        return userData?.firstname?.charAt(0).toUpperCase() || 'U';
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={onLogout}
                getFirstLetter={getFirstLetter}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onGoBack={handleGoBack} getFirstLetter={getFirstLetter} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatsCard
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                            </svg>}
                            title="Skill Level"
                            value={userData?.fieldOfInterest || 'Beginner'}
                            iconBgColor="bg-blue-100"
                            iconColor="text-blue-600"
                        />
                        <StatsCard
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>}
                            title="Certifications"
                            value={certifications.length}
                            actionText="View all"
                            onAction={() => setActiveTab('certifications')}
                            iconBgColor="bg-green-100"
                            iconColor="text-green-600"
                        />
                        <StatsCard
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                            </svg>}
                            title="Skills"
                            value={skills.length}
                            actionText="Add skill"
                            onAction={() => setActiveTab('skills')}
                            iconBgColor="bg-purple-100"
                            iconColor="text-purple-600"
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
