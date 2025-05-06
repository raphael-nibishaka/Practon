import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface Favorite {
    id: string;
    title: string;
    type: 'course' | 'assessment' | 'resource';
    progress?: number;
    lastAccessed?: string;
}

interface FavoritesSectionProps {
    initialFavorites?: Favorite[];
}

const FavoritesSection: React.FC<FavoritesSectionProps> = ({ initialFavorites = [] }) => {
    const [favorites, setFavorites] = useState<Favorite[]>(initialFavorites);

    const removeFromFavorites = (id: string) => {
        setFavorites(prev => prev.filter(item => item.id !== id));
        toast.success('Removed from favorites');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-800 to-purple-600 text-white rounded-lg p-6 mb-6 shadow-md">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">My Favorites</h1>
                        <p className="text-blue-100">Access your saved courses, assessments, and resources</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            {favorites.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Favorites Yet</h3>
                    <p className="text-gray-500 mb-4">Start adding your favorite courses, assessments, and resources to access them quickly.</p>
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                        Browse Content
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {favorites.map((favorite) => (
                        <div key={favorite.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${favorite.type === 'course' ? 'bg-blue-100' :
                                            favorite.type === 'assessment' ? 'bg-green-100' :
                                                'bg-purple-100'
                                            }`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${favorite.type === 'course' ? 'text-blue-600' :
                                                favorite.type === 'assessment' ? 'text-green-600' :
                                                    'text-purple-600'
                                                }`} viewBox="0 0 20 20" fill="currentColor">
                                                {favorite.type === 'course' ? (
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                ) : favorite.type === 'assessment' ? (
                                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                ) : (
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                                )}
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{favorite.title}</h3>
                                            <p className="text-sm text-gray-500 capitalize">{favorite.type}</p>
                                        </div>
                                    </div>
                                    <button
                                        className="text-gray-400 hover:text-red-500"
                                        onClick={() => removeFromFavorites(favorite.id)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                                {favorite.progress !== undefined && (
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                                            <span>Progress</span>
                                            <span>{favorite.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${favorite.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                                {favorite.lastAccessed && (
                                    <div className="flex items-center text-sm text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                        Last accessed: {favorite.lastAccessed}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FavoritesSection;
