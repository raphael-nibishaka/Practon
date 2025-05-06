import React from 'react';

interface UserData {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    fieldOfInterest: string;
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
    certifications: string[];
    code: number;
}

interface ProfileSectionProps {
    userData: UserData | null;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ userData }) => {
    const getFirstLetter = () => {
        return userData?.firstname?.charAt(0).toUpperCase() || '?';
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center">
                        <div className="bg-white rounded-full h-16 w-16 flex items-center justify-center mb-2">
                            <span className="text-2xl text-gray-500">{getFirstLetter()}</span>
                        </div>
                        <div className="bg-white rounded-full h-8 w-24 mt-1"></div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="mb-4 relative">
                    <label className="block text-gray-700 mb-2 relative">
                        <span className="absolute -top-0.5 left-3 bg-white px-4 text-gray-600 text-sm">Username</span>
                    </label>
                    <input
                        type="text"
                        value={`${userData?.firstname} ${userData?.lastname}`}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded bg-gray-50"
                    />
                </div>
                <div className="mb-4 relative">
                    <label className="block text-gray-700 mb-2 relative">
                        <span className="absolute -top-0.5 z-10 left-3 bg-white px-4 text-gray-600 text-sm">Password</span>
                    </label>
                    <div className="relative">
                        <input
                            type="password"
                            value="••••••••••"
                            readOnly
                            className="w-full p-3 border border-gray-300 rounded bg-gray-50"
                        />
                        <button className="absolute right-3 top-3 text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="mb-4 relative">
                    <label className="block text-gray-700 mb-2 relative">
                        <span className="absolute -top-0.5 left-3 bg-white px-4 text-gray-600 text-sm">Email</span>
                    </label>
                    <input
                        type="email"
                        value={userData?.email || ''}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded bg-gray-50"
                    />
                </div>
                <div className="mb-4 relative">
                    <label className="block text-gray-700 mb-2 relative">
                        <span className="absolute -top-0.5 left-3 bg-white px-4 text-gray-600 text-sm">Field</span>
                    </label>
                    <input
                        type="text"
                        value={userData?.fieldOfInterest || ''}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded bg-gray-50"
                    />
                </div>
            </div>
            <div className="mt-6 text-center">
                <button className="px-12 py-3 bg-blue-950 text-white rounded hover:bg-blue-800 transition font-medium">
                    Edit
                </button>
            </div>

            {/* Address Card (if available) */}
            {userData?.address && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-6 mt-6">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">Address Information</h2>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/3 mb-4 md:mb-0 md:pr-4">
                                <div className="bg-gray-100 h-full rounded-lg p-4 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="md:w-2/3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Street</p>
                                        <p className="font-medium text-gray-800">{userData.address.street || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">City</p>
                                        <p className="font-medium text-gray-800">{userData.address.city || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">State</p>
                                        <p className="font-medium text-gray-800">{userData.address.state || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Country</p>
                                        <p className="font-medium text-gray-800">{userData.address.country || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Postal Code</p>
                                        <p className="font-medium text-gray-800">{userData.address.postalCode || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileSection;
