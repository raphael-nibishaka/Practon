import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ChartBarIcon,
    UsersIcon,
    CogIcon,
    BellIcon,
    DocumentTextIcon,
    ShieldCheckIcon,
    BuildingOfficeIcon
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
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
}

interface AdminDashboardProps {
    user?: {
        name: string;
        email: string;
        role: string;
        code: number;
    } | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Get user data from sessionStorage
                const storedUserData = sessionStorage.getItem('user');
                if (!storedUserData) {
                    throw new Error('No user data found');
                }

                const userData = JSON.parse(storedUserData);
                const adminCode = userData.code;

                if (!adminCode) {
                    throw new Error('Admin code not found');
                }

                const response = await fetch(`http://localhost:8098/persons?adminId=${adminCode}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
                toast.error('Failed to load user data');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []); // Empty dependency array since we're getting data from sessionStorage

    // If no user data is available, show loading state
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    const stats = [
        { name: 'Total Users', value: users.length.toString(), icon: UsersIcon, color: 'bg-blue-500' },
        { name: 'Active Sessions', value: '42', icon: ChartBarIcon, color: 'bg-green-500' },
        { name: 'Pending Tasks', value: '12', icon: DocumentTextIcon, color: 'bg-yellow-500' },
        { name: 'Security Alerts', value: '3', icon: ShieldCheckIcon, color: 'bg-red-500' },
    ];

    const navigation = [
        { name: 'Overview', icon: ChartBarIcon, path: '/admin' },
        { name: 'Users', icon: UsersIcon, path: '/admin/users' },
        { name: 'Organizations', icon: BuildingOfficeIcon, path: '/admin/organizations' },
        { name: 'Settings', icon: CogIcon, path: '/admin/settings' },
        { name: 'Notifications', icon: BellIcon, path: '/admin/notifications' },
    ];

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('isAuthenticated');
        navigate('/login');
    };

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
                    <h2 className="text-2xl font-semibold font-['Orbitron'] bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">DevUp Admin</h2>
                </div>
                <nav className="mt-6">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center px-6 py-4 ${activeTab === item.name.toLowerCase() ? 'bg-blue-900' : ''
                                } hover:bg-blue-900`}
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
                <header className="bg-lavender-100 border-b shadow-sm">
                    <div className="flex justify-between items-center p-4">
                        <button onClick={() => navigate(-1)} className="text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search"
                                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto p-6">
                    {/* Welcome Banner */}
                    <div className="bg-gradient-to-r from-blue-800 to-blue-950 text-white rounded-lg p-6 mb-6 shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h1>
                                <p className="text-blue-100">Manage your platform and monitor system performance.</p>
                            </div>
                            <div className="hidden md:block">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-900 text-3xl font-bold shadow-lg">
                                    {user.name.charAt(0)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {stats.map((stat) => (
                            <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
                                <div className="flex items-center">
                                    <div className={`p-3 rounded-full ${stat.color}`}>
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                                        <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <UsersIcon className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-gray-900">New user registration</p>
                                        <p className="text-xs text-gray-500">2 minutes ago</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-gray-900">System update completed</p>
                                        <p className="text-xs text-gray-500">1 hour ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Management */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">User Management</h3>
                            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">View All</button>
                        </div>
                        <div className="p-6">
                            {loading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field of Interest</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {users.map((user) => (
                                                <tr key={user.code}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                                    <span className="text-sm font-medium text-gray-600">
                                                                        {user.firstname.charAt(0)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {user.firstname} {user.lastname}
                                                                </div>
                                                                <div className="text-sm text-gray-500">{user.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            {user.fieldOfInterest || 'Not specified'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                                        <button className="text-red-600 hover:text-red-900">Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
