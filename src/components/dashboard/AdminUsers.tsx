import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ChartBarIcon,
    UsersIcon,
    CogIcon,
    BellIcon,
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
    role: string;
    fieldOfInterest: string | null;
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
        expiryDate: string | null;
    }[];
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
}

interface AdminUsersProps {
    user?: {
        name: string;
        email: string;
        role: string;
        code: number;
    } | null;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ user }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userSkills, setUserSkills] = useState<any[]>([]);
    const [userCertifications, setUserCertifications] = useState<any[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [activeTab, setActiveTab] = useState('users');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const storedUserData = sessionStorage.getItem('user');
                if (!storedUserData) {
                    throw new Error('No user data found');
                }

                const userData = JSON.parse(storedUserData);
                const adminCode = userData.code;

                if (!adminCode) {
                    throw new Error('Admin code not found');
                }

                console.log('Fetching users with admin code:', adminCode);
                // Fetch users with their skills and certifications
                const response = await fetch(`http://localhost:8098/persons?adminId=${adminCode}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                console.log('Fetched users data:', data);

                // Filter out organizations and admins, only show regular users
                const regularUsers = Array.isArray(data) ? data.filter(user =>
                    user.role !== 'ADMIN' && user.role !== 'ORGANIZATION'
                ) : [];
                setUsers(regularUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
                toast.error('Failed to load user data');
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
            const skillsResponse = await fetch(`http://localhost:8098/skills/owner/${userCode}`);
            if (!skillsResponse.ok) {
                throw new Error('Failed to fetch skills');
            }
            const skillsData = await skillsResponse.json();
            setUserSkills(skillsData);

            // Fetch certifications - fixed URL
            const certsResponse = await fetch(`http://localhost:8098/certifications/owner/${userCode}`);
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

    const navigation = [
        { name: 'Overview', icon: ChartBarIcon, path: '/admin' },
        { name: 'Users', icon: UsersIcon, path: '/admin/users' },
        { name: 'Settings', icon: CogIcon, path: '/admin/settings' },
        { name: 'Notifications', icon: BellIcon, path: '/admin/notifications' },
    ];

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('isAuthenticated');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 select-none">
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
            <div className="w-64 flex-shrink-0 bg-blue-950 text-white select-none">
                <div className="p-6">
                    <h2 className="text-2xl font-semibold font-['Orbitron'] bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">DevUp Admin</h2>
                </div>
                <nav className="mt-6">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center px-6 py-4 ${activeTab === item.name.toLowerCase() ? 'bg-blue-900' : ''} hover:bg-blue-900 select-none`}
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
                        className="w-full py-3 bg-gray-500 text-white rounded hover:bg-gray-600 transition select-none"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-lavender-100 border-b shadow-sm select-none">
                    <div className="flex justify-between items-center p-4">
                        <button onClick={() => navigate(-1)} className="text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold select-none">
                            {user?.name.charAt(0)}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto p-6">
                    <div className="mb-6 select-none">
                        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-600">View and manage user profiles, skills, and certifications</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* User List */}
                        <div className="lg:col-span-1 bg-white rounded-lg shadow">
                            <div className="p-4 border-b select-none">
                                <h2 className="text-lg font-semibold text-gray-900">Users</h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {users.map((user) => (
                                    <div
                                        key={user.code}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedUser?.code === user.code ? 'bg-blue-50' : ''}`}
                                        onClick={() => handleUserSelect(user)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center select-none">
                                                    <span className="text-sm font-medium text-gray-600">
                                                        {user.firstname.charAt(0)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 select-none">
                                                    {user.firstname} {user.lastname}
                                                </p>
                                                <p className="text-sm text-gray-500 select-none">{user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* User Details */}
                        <div className="lg:col-span-2">
                            {selectedUser ? (
                                <div className="bg-white rounded-lg shadow">
                                    <div className="p-6">
                                        {/* User Profile */}
                                        <div className="mb-6">
                                            <h2 className="text-xl font-bold text-gray-900 mb-4 select-none">Profile Information</h2>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500 select-none">Name</p>
                                                    <p className="text-sm font-medium text-gray-900 select-none">
                                                        {selectedUser.firstname} {selectedUser.lastname}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 select-none">Email</p>
                                                    <p className="text-sm font-medium text-gray-900 select-none">{selectedUser.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 select-none">Role</p>
                                                    <p className="text-sm font-medium text-gray-900 select-none">{selectedUser.role}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 select-none">Field of Interest</p>
                                                    <p className="text-sm font-medium text-gray-900 select-none">
                                                        {selectedUser.fieldOfInterest || 'Not specified'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Skills */}
                                        <div className="mb-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-xl font-bold text-gray-900 flex items-center select-none">
                                                    <CodeBracketIcon className="h-6 w-6 mr-2 text-blue-600" />
                                                    Skills
                                                </h2>
                                                <span className="text-sm text-gray-500 select-none">
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
                                                                <p className="text-sm font-medium text-gray-900 select-none">{skill.name}</p>
                                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 select-none">
                                                                    {skill.level}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {userSkills.length === 0 && (
                                                        <div className="col-span-2 text-center py-4">
                                                            <p className="text-gray-500 select-none">No skills listed</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Certifications */}
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-xl font-bold text-gray-900 flex items-center select-none">
                                                    <AcademicCapIcon className="h-6 w-6 mr-2 text-blue-600" />
                                                    Certifications
                                                </h2>
                                                <span className="text-sm text-gray-500 select-none">
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
                                                                <p className="text-sm font-medium text-gray-900 select-none">{cert.name}</p>
                                                                <span className="text-xs text-gray-500 select-none">
                                                                    {new Date(cert.date).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-500 mb-2 select-none">Issuer: {cert.issuer}</p>
                                                            {cert.expiryDate && (
                                                                <div className="flex items-center text-sm text-gray-500">
                                                                    <ShieldCheckIcon className="h-4 w-4 mr-1" />
                                                                    <span className="select-none">Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {userCertifications.length === 0 && (
                                                        <div className="text-center py-4">
                                                            <p className="text-gray-500 select-none">No certifications listed</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow p-6 text-center">
                                    <p className="text-gray-500 select-none">Select a user to view their details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminUsers;
