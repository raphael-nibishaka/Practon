import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ChartBarIcon,
    UsersIcon,
    CogIcon,
    BuildingOfficeIcon,
    ShieldCheckIcon,
    AcademicCapIcon,
    CodeBracketIcon
} from '@heroicons/react/24/outline';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface User {
    code: number;
    firstname: string;
    lastname: string;
    email: string;
    fieldOfInterest: string;
    organizationId?: number;
    skills: {
        id: number;
        name: string;
        level: string;
    }[];
    certifications: {
        id: number;
        name: string;
        issuer: string;
        date: string;
        expiryDate?: string;
    }[];
}

interface OrganizationDashboardProps {
    user?: {
        name: string;
        email: string;
        role: string;
        code: number;
    } | null;
}

const OrganizationDashboard: React.FC<OrganizationDashboardProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userSkills, setUserSkills] = useState<any[]>([]);
    const [userCertifications, setUserCertifications] = useState<any[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [skillFilter, setSkillFilter] = useState('');
    const [stats, setStats] = useState({
        totalCandidates: 0,
        hiredCandidates: 0,
        availableCandidates: 0,
        totalSkills: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const storedUserData = sessionStorage.getItem('user');
                if (!storedUserData) {
                    throw new Error('No user data found');
                }

                const userData = JSON.parse(storedUserData);
                const organizationCode = userData.code;

                if (!organizationCode) {
                    throw new Error('Organization code not found');
                }

                // Fetch users using the organization ID
                const response = await fetch(`http://localhost:8098/persons?orgId=${organizationCode}`, {
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                console.log('Fetched candidates:', data);

                // Ensure data is an array and filter out admins and organizations
                const usersArray = Array.isArray(data) ? data.filter(user =>
                    user.role !== 'ADMIN' && user.role !== 'ORGANIZATION'
                ) : [];
                setUsers(usersArray);

                // Calculate statistics
                const totalSkills = usersArray.reduce((acc: number, user: User) => acc + (user.skills?.length || 0), 0);
                setStats({
                    totalCandidates: usersArray.length,
                    hiredCandidates: usersArray.filter((user: User) => user.organizationId === organizationCode).length,
                    availableCandidates: usersArray.filter((user: User) => !user.organizationId).length,
                    totalSkills: totalSkills
                });
            } catch (error) {
                console.error('Error fetching users:', error);
                toast.error('Failed to load user data');
                setUsers([]); // Set empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const fetchUserDetails = async (userCode: number) => {
        setLoadingDetails(true);
        try {
            // Fetch skills
            const skillsResponse = await fetch(`http://localhost:8098/skills/owner/${userCode}`, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            if (!skillsResponse.ok) {
                throw new Error('Failed to fetch skills');
            }
            const skillsData = await skillsResponse.json();
            setUserSkills(skillsData);

            // Fetch certifications
            const certsResponse = await fetch(`http://localhost:8098/certifications/owner/${userCode}`, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            if (!certsResponse.ok) {
                throw new Error('Failed to fetch certifications');
            }
            const certsData = await certsResponse.json();
            setUserCertifications(certsData);
        } catch (error) {
            console.error('Error fetching user details:', error);
            toast.error('Failed to load user details');
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
        fetchUserDetails(user.code);
    };

    const handleHire = async (userCode: number) => {
        try {
            const response = await fetch('http://localhost:8098/hire', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    organizationId: user?.code,
                    userId: userCode
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to hire user');
            }

            toast.success('User hired successfully!');
            // Refresh the users list
            const updatedResponse = await fetch('http://localhost:8098/persons/available', {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            if (updatedResponse.ok) {
                const updatedData = await updatedResponse.json();
                setUsers(updatedData);
            }
        } catch (error) {
            console.error('Error hiring user:', error);
            toast.error('Failed to hire user');
        }
    };

    const filteredUsers = users?.filter(user => {
        if (!user) return false;
        const matchesSearch = `${user.firstname} ${user.lastname} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSkill = skillFilter === '' || (user.skills?.some(skill => skill.name.toLowerCase().includes(skillFilter.toLowerCase())) || false);
        return matchesSearch && matchesSkill;
    }) || [];

    const navigation = [
        { name: 'Overview', icon: ChartBarIcon, path: '/organization' },
        { name: 'Candidates', icon: UsersIcon, path: '/organization/candidates' },
        { name: 'Hired', icon: BuildingOfficeIcon, path: '/organization/hired' },
        { name: 'Settings', icon: CogIcon, path: '/organization/settings' },
    ];

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('isAuthenticated');
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    const dashboardStats = [
        { name: 'Total Candidates', value: stats.totalCandidates.toString(), icon: UsersIcon, color: 'bg-blue-500' },
        { name: 'Hired Candidates', value: stats.hiredCandidates.toString(), icon: ShieldCheckIcon, color: 'bg-green-500' },
        { name: 'Available Candidates', value: stats.availableCandidates.toString(), icon: UsersIcon, color: 'bg-yellow-500' },
        { name: 'Total Skills', value: stats.totalSkills.toString(), icon: CodeBracketIcon, color: 'bg-purple-500' },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            {/* Sidebar */}
            <div className="w-64 flex-shrink-0 bg-blue-950 text-white">
                <div className="p-6">
                    <h2 className="text-2xl font-semibold font-['Orbitron'] bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Organization Portal</h2>
                </div>
                <nav className="mt-6">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center px-6 py-4 ${activeTab === item.name.toLowerCase() ? 'bg-blue-900' : ''} hover:bg-blue-900`}
                            onClick={() => setActiveTab(item.name.toLowerCase())}
                        >
                            <item.icon className="h-5 w-5 mr-3" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>
                <div className="absolute bottom-0 w-64 p-4">
                    <button
                        onClick={handleLogout}
                        className="w-full py-3 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b shadow-sm">
                    <div className="flex justify-between items-center p-4">
                        <div className="flex-1 max-w-2xl">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search candidates..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <input
                                type="text"
                                placeholder="Filter by skill..."
                                value={skillFilter}
                                onChange={(e) => setSkillFilter(e.target.value)}
                                className="px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="ml-4 w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
                            {user?.name.charAt(0)}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto p-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {dashboardStats.map((stat) => (
                            <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center">
                                    <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                                        <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                        <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* User List */}
                        <div className="lg:col-span-1 bg-white rounded-lg shadow">
                            <div className="p-4 border-b">
                                <h2 className="text-lg font-semibold text-gray-900">Available Candidates</h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {loading ? (
                                    <div className="flex justify-center items-center h-32">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        No candidates found
                                    </div>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <div
                                            key={user.code}
                                            className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedUser?.code === user.code ? 'bg-blue-50' : ''}`}
                                            onClick={() => handleUserSelect(user)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-gray-600">
                                                            {user.firstname?.charAt(0) || '?'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {user.firstname} {user.lastname}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* User Details */}
                        <div className="lg:col-span-2">
                            {selectedUser ? (
                                <div className="bg-white rounded-lg shadow">
                                    <div className="p-6">
                                        {/* User Profile */}
                                        <div className="mb-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                                                        {selectedUser.firstname} {selectedUser.lastname}
                                                    </h2>
                                                    <p className="text-gray-600">{selectedUser.email}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleHire(selectedUser.code)}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                                >
                                                    Hire Candidate
                                                </button>
                                            </div>
                                        </div>

                                        {/* Skills */}
                                        <div className="mb-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                                    <CodeBracketIcon className="h-5 w-5 mr-2 text-blue-600" />
                                                    Skills
                                                </h3>
                                                <span className="text-sm text-gray-500">
                                                    {userSkills.length} skills
                                                </span>
                                            </div>
                                            {loadingDetails ? (
                                                <div className="text-center py-4">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {userSkills.map((skill) => (
                                                        <div key={skill.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-sm font-medium text-gray-900">{skill.name}</p>
                                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                                    {skill.level}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {userSkills.length === 0 && (
                                                        <div className="col-span-2 text-center py-4">
                                                            <p className="text-gray-500">No skills listed</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Certifications */}
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                                    <AcademicCapIcon className="h-5 w-5 mr-2 text-blue-600" />
                                                    Certifications
                                                </h3>
                                                <span className="text-sm text-gray-500">
                                                    {userCertifications.length} certifications
                                                </span>
                                            </div>
                                            {loadingDetails ? (
                                                <div className="text-center py-4">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {userCertifications.map((cert) => (
                                                        <div key={cert.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <p className="text-sm font-medium text-gray-900">{cert.name}</p>
                                                                <span className="text-xs text-gray-500">
                                                                    {new Date(cert.date).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-500 mb-2">Issuer: {cert.issuer}</p>
                                                            {cert.expiryDate && (
                                                                <div className="flex items-center text-sm text-gray-500">
                                                                    <ShieldCheckIcon className="h-4 w-4 mr-1" />
                                                                    <span>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {userCertifications.length === 0 && (
                                                        <div className="text-center py-4">
                                                            <p className="text-gray-500">No certifications listed</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                                    Select a candidate to view their details
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OrganizationDashboard;
