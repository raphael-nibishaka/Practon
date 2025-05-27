import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ChartBarIcon,
    UsersIcon,
    CogIcon,
    BuildingOfficeIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Organization {
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

interface AdminOrganizationsProps {
    user?: {
        name: string;
        email: string;
        role: string;
        code: number;
    } | null;
}

interface CreateOrganizationForm {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    fieldOfInterest: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
}

const AdminOrganizations: React.FC<AdminOrganizationsProps> = ({ user }) => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Organization[]>([]);
    const [activeTab, setActiveTab] = useState('organizations');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newOrganization, setNewOrganization] = useState<CreateOrganizationForm>({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        fieldOfInterest: '',
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            postalCode: ''
        }
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrganizations = async () => {
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

                console.log('Fetching organizations with admin code:', adminCode);
                // Fetch all organizations
                const response = await fetch(`http://localhost:8098/persons?adminId=${adminCode}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch organizations');
                }
                const data = await response.json();
                console.log('Fetched organizations data:', data);

                // Filter only organizations
                const orgsArray = Array.isArray(data) ? data.filter(org =>
                    org.role === 'ORGANIZATION'
                ) : [];
                console.log('Filtered organizations:', orgsArray);
                setOrganizations(orgsArray);
            } catch (error) {
                console.error('Error fetching organizations:', error);
                toast.error('Failed to load organizations');
                setOrganizations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizations();
    }, []);

    // Enhanced search function with useCallback
    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        if (!term.trim()) {
            setSearchResults(organizations);
            return;
        }

        const searchTermLower = term.toLowerCase().trim();
        const results = organizations.filter(org => {
            const searchableFields = [
                org.firstname,
                org.lastname,
                org.email,
                org.fieldOfInterest,
                org.address?.street,
                org.address?.city,
                org.address?.state,
                org.address?.country,
                org.address?.postalCode
            ].filter((field): field is string => field !== null && field !== undefined);

            return searchableFields.some(field =>
                field.toLowerCase().includes(searchTermLower)
            );
        });

        setSearchResults(results);
    }, [organizations]);

    // Update search results when organizations change
    useEffect(() => {
        handleSearch(searchTerm);
    }, [organizations, handleSearch, searchTerm]);

    const navigation = [
        { name: 'Overview', icon: ChartBarIcon, path: '/admin' },
        { name: 'Users', icon: UsersIcon, path: '/admin/users' },
        { name: 'Organizations', icon: BuildingOfficeIcon, path: '/admin/organizations' },
        { name: 'Settings', icon: CogIcon, path: '/admin/settings' },
    ];

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('isAuthenticated');
        navigate('/login');
    };

    const handleCreateOrganization = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8098/persons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...newOrganization,
                    role: 'ORGANIZATION'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create organization');
            }

            const createdOrg = await response.json();
            setOrganizations(prev => [...prev, createdOrg]);
            setShowCreateModal(false);
            setNewOrganization({
                firstname: '',
                lastname: '',
                email: '',
                password: '',
                fieldOfInterest: '',
                address: {
                    street: '',
                    city: '',
                    state: '',
                    country: '',
                    postalCode: ''
                }
            });
            toast.success('Organization created successfully');
        } catch (error) {
            console.error('Error creating organization:', error);
            toast.error('Failed to create organization');
        }
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
                        <button onClick={() => navigate(-1)} className="text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search organizations by name, email, field, or address..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 w-96"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Create Organization
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Organization Management</h1>
                        <p className="text-gray-600">View and manage organization profiles</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Organization List */}
                        <div className="lg:col-span-1 bg-white rounded-lg shadow">
                            <div className="p-4 border-b">
                                <h2 className="text-lg font-semibold text-gray-900">Organizations</h2>
                                {searchTerm && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Found {searchResults.length} results
                                    </p>
                                )}
                            </div>
                            <div className="divide-y divide-gray-200">
                                {loading ? (
                                    <div className="flex justify-center items-center h-32">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
                                    </div>
                                ) : searchResults.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        {searchTerm ? 'No organizations found matching your search' : 'No organizations found'}
                                    </div>
                                ) : (
                                    searchResults.map((org) => (
                                        <div
                                            key={org.code}
                                            className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedOrg?.code === org.code ? 'bg-blue-50' : ''}`}
                                            onClick={() => setSelectedOrg(org)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-gray-600">
                                                            {org.firstname?.charAt(0) || '?'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {org.firstname} {org.lastname}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{org.email}</p>
                                                    {org.fieldOfInterest && (
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {org.fieldOfInterest}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Organization Details */}
                        <div className="lg:col-span-2">
                            {selectedOrg ? (
                                <div className="bg-white rounded-lg shadow">
                                    <div className="p-6">
                                        {/* Organization Profile */}
                                        <div className="mb-6">
                                            <h2 className="text-xl font-bold text-gray-900 mb-4">Organization Information</h2>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">Name</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {selectedOrg.firstname} {selectedOrg.lastname}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Email</p>
                                                    <p className="text-sm font-medium text-gray-900">{selectedOrg.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Field of Interest</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {selectedOrg.fieldOfInterest || 'Not specified'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address */}
                                        {selectedOrg.address && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-900">{selectedOrg.address.street}</p>
                                                    <p className="text-sm text-gray-900">
                                                        {selectedOrg.address.city}, {selectedOrg.address.state} {selectedOrg.address.postalCode}
                                                    </p>
                                                    <p className="text-sm text-gray-900">{selectedOrg.address.country}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow p-6 text-center">
                                    <p className="text-gray-500">Select an organization to view their details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Create Organization Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Organization</h2>
                            <form onSubmit={handleCreateOrganization} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={newOrganization.firstname}
                                            onChange={(e) => setNewOrganization(prev => ({ ...prev, firstname: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                            placeholder="Enter first name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={newOrganization.lastname}
                                            onChange={(e) => setNewOrganization(prev => ({ ...prev, lastname: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                            placeholder="Enter last name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={newOrganization.email}
                                        onChange={(e) => setNewOrganization(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                        placeholder="Enter email address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={newOrganization.password}
                                        onChange={(e) => setNewOrganization(prev => ({ ...prev, password: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                        placeholder="Enter password"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Field of Interest</label>
                                    <input
                                        type="text"
                                        value={newOrganization.fieldOfInterest}
                                        onChange={(e) => setNewOrganization(prev => ({ ...prev, fieldOfInterest: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                        placeholder="Enter field of interest"
                                    />
                                </div>
                                <div className="border-t pt-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                                            <input
                                                type="text"
                                                value={newOrganization.address.street}
                                                onChange={(e) => setNewOrganization(prev => ({
                                                    ...prev,
                                                    address: { ...prev.address, street: e.target.value }
                                                }))}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                                placeholder="Enter street address"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <input
                                                type="text"
                                                value={newOrganization.address.city}
                                                onChange={(e) => setNewOrganization(prev => ({
                                                    ...prev,
                                                    address: { ...prev.address, city: e.target.value }
                                                }))}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                                placeholder="Enter city"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                            <input
                                                type="text"
                                                value={newOrganization.address.state}
                                                onChange={(e) => setNewOrganization(prev => ({
                                                    ...prev,
                                                    address: { ...prev.address, state: e.target.value }
                                                }))}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                                placeholder="Enter state"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                            <input
                                                type="text"
                                                value={newOrganization.address.country}
                                                onChange={(e) => setNewOrganization(prev => ({
                                                    ...prev,
                                                    address: { ...prev.address, country: e.target.value }
                                                }))}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                                placeholder="Enter country"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                            <input
                                                type="text"
                                                value={newOrganization.address.postalCode}
                                                onChange={(e) => setNewOrganization(prev => ({
                                                    ...prev,
                                                    address: { ...prev.address, postalCode: e.target.value }
                                                }))}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                                placeholder="Enter postal code"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                                    >
                                        Create Organization
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrganizations;
