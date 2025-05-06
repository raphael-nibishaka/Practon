import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
    getFirstLetter: () => string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, getFirstLetter }) => {
    return (
        <div className="w-64 flex-shrink-0 bg-blue-950 text-white">
            <div className="p-6">
                <h2 className="text-2xl font-semibold font-['Orbitron'] bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">DevUp</h2>
            </div>
            <nav className="mt-6">
                <Link
                    to="/dashboard"
                    className={`flex items-center px-6 py-4 ${activeTab === 'dashboard' ? 'bg-blue-900' : ''} hover:bg-blue-900`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="font-medium">Dashboard</span>
                </Link>
                <Link
                    to="/tests"
                    className={`flex items-center px-6 py-4 ${activeTab === 'tests' ? 'bg-blue-900' : ''} hover:bg-blue-900`}
                    onClick={() => setActiveTab('tests')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Tests</span>
                </Link>
                <Link
                    to="/favorites"
                    className={`flex items-center px-6 py-4 ${activeTab === 'favorites' ? 'bg-blue-900' : ''} hover:bg-blue-900`}
                    onClick={() => setActiveTab('favorites')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">My Favorites</span>
                </Link>
                <Link
                    to="/profile"
                    className={`flex items-center px-6 py-4 ${activeTab === 'profile' ? 'bg-blue-900' : ''} hover:bg-blue-900`}
                    onClick={() => setActiveTab('profile')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Profile</span>
                </Link>
                <Link
                    to="/certifications"
                    className={`flex items-center px-6 py-4 ${activeTab === 'certifications' ? 'bg-blue-900' : ''} hover:bg-blue-900`}
                    onClick={() => setActiveTab('certifications')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Certifications</span>
                </Link>
            </nav>
            <div className="absolute bottom-0 w-64 p-4">
                <button
                    onClick={onLogout}
                    className="w-full py-3 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
