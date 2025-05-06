import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import CertificationsSection from './CertificationSection';
import TestsSection from './TestsSection';
import FavoritesSection from './FavoritesSection';

// API base URL
const API_BASE_URL = 'http://localhost:8098';

// API service functions
const fetchUserSkills = async (userCode: number) => {
    try {
        console.log('Fetching skills for user code:', userCode);

        if (!userCode) {
            console.error('User code not found');
            return [];
        }

        const response = await fetch(`${API_BASE_URL}/skills/owner/${userCode}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched skills:', data);
        return data;
    } catch (error) {
        console.error('Error fetching user skills:', error);
        toast.error('Failed to fetch skills');
        return [];
    }
};

const createSkill = async (skillData: { name: string; description: string; owner: { id: number } }) => {
    try {
        console.log('Creating skill with data:', skillData);
        const response = await fetch(`${API_BASE_URL}/skills`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify(skillData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('Error response:', errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Skill creation response:', data);
        return data;
    } catch (error) {
        console.error('Error creating skill:', error);
        toast.error('Failed to create skill');
        throw error;
    }
};

const createCertification = async (certificationData: {
    name: string;
    issuingOrganization: string;
    dateIssued: string;
    ownerId: number;
    skillId: number;
}) => {
    try {
        console.log('Creating certification with data:', certificationData);
        const requestData = {
            name: certificationData.name,
            issuingOrganization: certificationData.issuingOrganization,
            dateIssued: certificationData.dateIssued,
            owner: {
                id: certificationData.ownerId
            },
            skill: {
                id: certificationData.skillId
            }
        };
        console.log('Sending certification request:', requestData);
        const response = await axios.post<Certification>(`${API_BASE_URL}/certifications`, requestData);
        console.log('Certification creation response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating certification:', error);
        if (axios.isAxiosError(error)) {
            console.error('Error response:', error.response?.data);
        }
        toast.error('Failed to create certification');
        throw error;
    }
};

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

interface Skill {
    id: number;
    name: string;
    description: string;
    owner: {
        id: number;
    };
}

interface Certification {
    id: number;
    name: string;
    issuingOrganization: string;
    dateIssued: string;
    skill: {
        id: number;
        name: string;
        description: string;
        owner: {
            id: number;
        };
    };
    owner: {
        id: number;
    };
}

interface TestResult {
    id: number;
    testName: string;
    score: number;
    date: string;
}

const Dashboard: React.FC = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<string>('dashboard');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [quizStarted, setQuizStarted] = useState<boolean>(false);
    const [testResults] = useState<TestResult[]>([]);
    const [certificationCount, setCertificationCount] = useState<number>(0);
    const [favorites] = useState<Array<{
        id: string;
        title: string;
        type: 'course' | 'assessment' | 'resource';
        progress?: number;
        lastAccessed?: string;
    }>>([
        {
            id: '1',
            title: 'Web Development Fundamentals',
            type: 'course',
            progress: 75,
            lastAccessed: '2024-03-15'
        },
        {
            id: '2',
            title: 'Cybersecurity Assessment',
            type: 'assessment',
            progress: 100,
            lastAccessed: '2024-03-14'
        },
        {
            id: '3',
            title: 'React Best Practices Guide',
            type: 'resource',
            lastAccessed: '2024-03-13'
        }
    ]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [showAddSkillModal, setShowAddSkillModal] = useState(false);
    const [showAddCertificationModal, setShowAddCertificationModal] = useState(false);
    const [newSkill, setNewSkill] = useState({ name: '', description: '' });
    const [newCertification, setNewCertification] = useState({
        name: '',
        issuingOrganization: '',
        dateIssued: '',
        skillId: 0
    });
    const navigate = useNavigate();

    // Add function to fetch certification count
    const fetchCertificationCount = async (userId: number) => {
        try {
            const res = await fetch(`http://localhost:8098/certifications/owner/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            console.log('Fetched certification count:', data.length);
            setCertificationCount(data.length);
        } catch (error) {
            console.error("Error fetching certification count:", error);
            toast.error("Failed to fetch certification count");
        }
    };

    useEffect(() => {
        // Check if user is authenticated
        const isAuthenticated = sessionStorage.getItem('isAuthenticated');
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // Get user data from sessionStorage
        const storedUser = sessionStorage.getItem('user');
        console.log('Stored user data:', storedUser); // Debug log

        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                console.log('Parsed user data:', user); // Debug log
                setUserData(user);

                // Fetch user's skills and certifications
                if (user.code) {
                    console.log('User code found:', user.code); // Debug log
                    Promise.all([
                        fetchUserSkills(user.code),
                        fetchCertificationCount(user.code)
                    ]).then(([skillsData]) => {
                        console.log('Fetched skills:', skillsData);
                        setSkills(skillsData);
                    }).catch(error => {
                        console.error('Error fetching user data:', error);
                        toast.error('Error loading user data');
                    });
                } else {
                    console.error('User code is missing from user data'); // Debug log
                    toast.error('User data is incomplete. Please log in again.');
                }
            } catch (err) {
                console.error('Error parsing user data', err);
                toast.error('Error loading user data');
            }
        } else {
            console.error('No user data found in sessionStorage'); // Debug log
            toast.error('Please log in to continue');
            navigate('/login');
        }

        setLoading(false);
    }, [navigate]);

    // Add effect to update certification count when tab changes to profile
    useEffect(() => {
        if (activeTab === 'profile' && userData?.code) {
            fetchCertificationCount(userData.code);
        }
    }, [activeTab, userData?.code]);

    const handleLogout = () => {
        // Clear session storage
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('isAuthenticated');
        toast.success('Logged out successfully');
        setTimeout(() => {
            navigate('/login');
        }, 1000);
    };

    const getFirstLetter = () => {
        return userData?.firstname?.charAt(0).toUpperCase() || '?';
    };

    const goBack = () => {
        if (quizStarted) {
            setQuizStarted(false);
            setSelectedCategory(null);
        } else if (selectedCategory) {
            setSelectedCategory(null);
        } else {
            navigate(-1);
        }
    };

    const handleAddSkill = async () => {
        if (!userData?.code) {
            toast.error('User code not found. Please log in again.');
            return;
        }

        // Validate input
        if (!newSkill.name.trim()) {
            toast.error('Skill name is required');
            return;
        }

        if (!newSkill.description.trim()) {
            toast.error('Skill description is required');
            return;
        }

        try {
            const skillData = {
                name: newSkill.name.trim(),
                description: newSkill.description.trim(),
                owner: {
                    id: userData.code
                }
            };
            console.log('Sending skill data:', skillData);

            const createdSkill = await createSkill(skillData);
            console.log('Created skill response:', createdSkill);

            // Update the skills list with the new skill
            setSkills(prev => [...prev, createdSkill]);

            // Reset form and close modal
            setNewSkill({ name: '', description: '' });
            setShowAddSkillModal(false);

            toast.success('Skill added successfully');
        } catch (error) {
            console.error('Error adding skill:', error);
            toast.error('Failed to add skill. Please try again.');
        }
    };

    const handleAddCertification = async () => {
        if (!userData?.code) return;

        try {
            const certificationData = {
                ...newCertification,
                ownerId: userData.code
            };
            const createdCertification = await createCertification(certificationData);
            setCertifications(prev => [...prev, createdCertification]);
            setShowAddCertificationModal(false);
            setNewCertification({
                name: '',
                issuingOrganization: '',
                dateIssued: '',
                skillId: 0
            });
            toast.success('Certification added successfully');
        } catch (error) {
            toast.error('Failed to add certification');
        }
    };

    const handleDeleteSkill = async (skillId: number) => {
        try {
            await deleteSkill(skillId);
            setSkills(prev => prev.filter(s => s.id !== skillId));
            toast.success('Skill deleted successfully');
        } catch (error) {
            console.error('Error deleting skill:', error);
            toast.error('Failed to delete skill');
        }
    };

    // Add the deleteSkill function
    const deleteSkill = async (skillId: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/skills/${skillId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Error deleting skill:', error);
            toast.error('Failed to delete skill');
            throw error;
        }
    };

    // Helper functions for test completion
    const createCertificationAfterTest = async (testName: string, skillId: string, userCode: string) => {
        const certificationData = {
            name: `${testName} Certification`,
            issuingOrganization: 'Practon',
            dateIssued: new Date().toISOString().split('T')[0],
            owner: {
                id: parseInt(userCode)
            },
            skill: {
                id: parseInt(skillId)
            }
        };

        const response = await fetch(`${API_BASE_URL}/certifications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify(certificationData),
        });

        if (!response.ok) {
            throw new Error('Failed to create certification');
        }

        return response.json();
    };

    const createSkillIfNotExists = async (testName: string, userCode: string) => {
        // Check if skill already exists
        const existingSkill = skills.find(skill => skill.name.toLowerCase() === testName.toLowerCase());
        if (existingSkill) {
            return existingSkill;
        }

        // Create new skill
        const skillData = {
            name: testName,
            description: `Skill in ${testName}`,
            owner: {
                id: parseInt(userCode)
            }
        };

        const response = await fetch(`${API_BASE_URL}/skills`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify(skillData),
        });

        if (!response.ok) {
            throw new Error('Failed to create skill');
        }

        return response.json();
    };

    const handleTestCompletion = async (testName: string, score: number) => {
        if (!userData?.code) {
            console.error('User code not available');
            return;
        }

        try {
            // Create skill if it doesn't exist
            const skill = await createSkillIfNotExists(testName, userData.code.toString());

            // Create certification
            const certification = await createCertificationAfterTest(testName, skill.id.toString(), userData.code.toString());

            // Update local state
            setSkills(prevSkills => [...prevSkills, skill]);
            setCertifications(prevCerts => [...prevCerts, certification]);
            setCertificationCount(prevCount => prevCount + 1);

            // Show success message
            toast.success('Test completed! New skill and certification added.');
        } catch (error) {
            console.error('Error handling test completion:', error);
            toast.error('Failed to process test completion');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-900"></div>
            </div>
        );
    }

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
                        <button onClick={goBack} className="text-gray-700">
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
                            {getFirstLetter()}
                        </div>
                    </div>
                </header>

                {/* Dynamic Content based on active tab */}
                <div className="flex-1 overflow-auto p-6">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-xl p-8 text-white">
                                <div className="flex flex-col md:flex-row items-center justify-between">
                                    <div className="mb-4 md:mb-0">
                                        <h1 className="text-3xl font-['Orbitron'] font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Profile Overview</h1>
                                        <p className="text-blue-100 text-lg font-['Space+Grotesk']">
                                            Welcome back, {userData?.firstname || 'User'}! Manage your personal information and preferences
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                            <span className="text-3xl font-['Orbitron'] font-bold text-white">{getFirstLetter()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h2 className="text-xl font-['Orbitron'] font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Personal Information</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-['Space+Grotesk'] font-medium text-gray-700">Full Name</label>
                                            <p className="mt-1 text-lg font-['Space+Grotesk']">{userData?.firstname} {userData?.lastname}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-['Space+Grotesk'] font-medium text-gray-700">Email</label>
                                            <p className="mt-1 text-lg font-['Space+Grotesk']">{userData?.email || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-['Space+Grotesk'] font-medium text-gray-700">Field of Interest</label>
                                            <p className="mt-1 text-lg font-['Space+Grotesk']">{userData?.fieldOfInterest || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h2 className="text-xl font-['Orbitron'] font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Account Settings</h2>
                                    <div className="space-y-4">
                                        <button className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-['Space+Grotesk'] font-medium flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                            Edit Profile
                                        </button>
                                        <button className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-['Space+Grotesk'] font-medium flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                            </svg>
                                            Change Password
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-['Orbitron'] font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Activity Summary</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <h3 className="font-['Space+Grotesk'] font-medium text-blue-900">Tests Completed</h3>
                                        <p className="text-2xl font-['Orbitron'] font-bold text-blue-700 mt-2">{testResults?.length || 0}</p>
                                    </div>
                                    <div className="bg-purple-50 rounded-lg p-4">
                                        <h3 className="font-['Space+Grotesk'] font-medium text-purple-900">Certifications</h3>
                                        <p className="text-2xl font-['Orbitron'] font-bold text-purple-700 mt-2">{certificationCount}</p>
                                    </div>
                                    <div className="bg-indigo-50 rounded-lg p-4">
                                        <h3 className="font-['Space+Grotesk'] font-medium text-indigo-900">Skills</h3>
                                        <p className="text-2xl font-['Orbitron'] font-bold text-indigo-700 mt-2">{skills?.length || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {userData?.address && (
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h2 className="text-xl font-['Orbitron'] font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Address Information</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-['Space+Grotesk'] font-medium text-gray-700">Street</label>
                                            <p className="mt-1 text-lg font-['Space+Grotesk']">{userData.address.street}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-['Space+Grotesk'] font-medium text-gray-700">City</label>
                                            <p className="mt-1 text-lg font-['Space+Grotesk']">{userData.address.city}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-['Space+Grotesk'] font-medium text-gray-700">State</label>
                                            <p className="mt-1 text-lg font-['Space+Grotesk']">{userData.address.state}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-['Space+Grotesk'] font-medium text-gray-700">Country</label>
                                            <p className="mt-1 text-lg font-['Space+Grotesk']">{userData.address.country}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-['Space+Grotesk'] font-medium text-gray-700">Postal Code</label>
                                            <p className="mt-1 text-lg font-['Space+Grotesk']">{userData.address.postalCode}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'tests' && (
                        <div className="p-6">
                            <TestsSection
                                userData={userData}
                                onTestComplete={handleTestCompletion}
                            />
                        </div>
                    )}
                    {activeTab === 'favorites' && (
                        <div className="p-6">
                            <FavoritesSection initialFavorites={favorites} />
                        </div>
                    )}

                    {activeTab === 'certifications' && (
                        <div className="max-w-4xl mx-auto">
                            <CertificationsSection userId={userData?.code || 1} />
                        </div>
                    )}

                    {activeTab === 'dashboard' && (
                        <div>
                            {/* Welcome Banner */}
                            <div className="bg-gradient-to-r from-blue-800 to-blue-950 text-white rounded-lg p-6 mb-6 shadow-md">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-2xl font-bold mb-2">Welcome back, {userData?.firstname || 'User'}!</h1>
                                        <p className="text-blue-100">Track your progress in {userData?.fieldOfInterest || 'tech'} and continue your learning journey.</p>
                                    </div>
                                    <div className="hidden md:block">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-900 text-3xl font-bold shadow-lg">
                                            {getFirstLetter()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
                                    <div className="flex items-center mb-2">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-gray-700">Skill Level</h3>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold text-gray-800">{userData?.fieldOfInterest || 'Beginner'}</span>
                                        <span className="text-sm text-blue-600 font-medium">Take assessment →</span>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
                                    <div className="flex items-center mb-2">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.066 0 013.138-3.138z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-gray-700">Certifications</h3>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold text-gray-800">{certificationCount}</span>
                                        <button
                                            onClick={() => setActiveTab('certifications')}
                                            className="text-sm text-green-600 font-medium hover:text-green-700 transition"
                                        >
                                            View all →
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
                                    <div className="flex items-center mb-2">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-gray-700">Skills</h3>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold text-gray-800">{skills.length}</span>
                                        <button
                                            onClick={() => setShowAddSkillModal(true)}
                                            className="text-sm text-purple-600 font-medium"
                                        >
                                            Add skill →
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Information Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-6">
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                        Edit
                                    </button>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Full Name</p>
                                            <p className="font-medium text-gray-800">{userData?.firstname} {userData?.lastname}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Email</p>
                                            <p className="font-medium text-gray-800">{userData?.email || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Field of Interest</p>
                                            <div className="flex items-center">
                                                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                    {userData?.fieldOfInterest || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address Card (if available) */}
                            {userData?.address && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-6">
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

                            {/* Certifications Card */}
                            {userData?.code && (
                                <CertificationsSection userId={userData.code} />
                            )}

                            {/* Recommended Learning Paths */}
                            <div className="mt-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Recommended Learning Paths</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                                        <div className="h-36 bg-gradient-to-r from-blue-800 to-purple-600 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-800 mb-1">{userData?.fieldOfInterest || 'Tech'} Fundamentals</h3>
                                            <p className="text-sm text-gray-600 mb-3">Learn the core principles and get started with practical examples</p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">12 modules • 4 hours</span>
                                                <button className="text-sm font-medium text-blue-600 hover:text-blue-800">Start Now</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                                        <div className="h-36 bg-gradient-to-r from-green-600 to-teal-500 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                            </svg>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-800 mb-1">Industry Certification Prep</h3>
                                            <p className="text-sm text-gray-600 mb-3">Prepare for recognized professional certifications</p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">8 modules • 10 hours</span>
                                                <button className="text-sm font-medium text-blue-600 hover:text-blue-800">Start Now</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                                        <div className="h-36 bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-800 mb-1">Career Development</h3>
                                            <p className="text-sm text-gray-600 mb-3">Advance your skills with real-world projects and scenarios</p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">6 modules • 8 hours</span>
                                                <button className="text-sm font-medium text-blue-600 hover:text-blue-800">Start Now</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Skills Section */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-6">
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-gray-800">Skills</h2>
                                    <button
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                                        onClick={() => setShowAddSkillModal(true)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Skill
                                    </button>
                                </div>
                                <div className="p-6">
                                    {loading ? (
                                        <div className="flex justify-center items-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>
                                        </div>
                                    ) : skills.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500 mb-2">No skills added yet</p>
                                            <p className="text-sm text-gray-600 mb-4">Add your skills or complete tests to earn certifications</p>
                                            <button
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                onClick={() => setShowAddSkillModal(true)}
                                            >
                                                Add Skill
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {skills.map((skill) => {
                                                const relatedCertification = certifications.find(cert => cert.skill.id === skill.id);
                                                return (
                                                    <div key={skill.id} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-800">{skill.name}</p>
                                                            <p className="text-xs text-gray-500">{skill.description}</p>
                                                            {relatedCertification && (
                                                                <div className="mt-2 flex items-center text-xs text-green-600">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                    </svg>
                                                                    Certified on {relatedCertification.dateIssued}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            className="text-gray-400 hover:text-red-500"
                                                            onClick={() => {
                                                                if (relatedCertification) {
                                                                    toast.error('Cannot delete skill with associated certification');
                                                                    return;
                                                                }
                                                                handleDeleteSkill(skill.id);
                                                            }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Add Skill Modal */}
                            {showAddSkillModal && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                                        <h2 className="text-xl font-semibold mb-4">Add New Skill</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                                                <input
                                                    type="text"
                                                    value={newSkill.name}
                                                    onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter skill name"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                <textarea
                                                    value={newSkill.description}
                                                    onChange={(e) => setNewSkill(prev => ({ ...prev, description: e.target.value }))}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter skill description"
                                                    rows={3}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-3 mt-6">
                                            <button
                                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                                onClick={() => {
                                                    setShowAddSkillModal(false);
                                                    setNewSkill({ name: '', description: '' });
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                onClick={handleAddSkill}
                                            >
                                                Add Skill
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Add Certification Modal */}
                            {showAddCertificationModal && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                                        <h2 className="text-xl font-semibold mb-4">Add New Certification</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
                                                <input
                                                    type="text"
                                                    value={newCertification.name}
                                                    onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                    placeholder="Enter certification name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
                                                <input
                                                    type="text"
                                                    value={newCertification.issuingOrganization}
                                                    onChange={(e) => setNewCertification(prev => ({ ...prev, issuingOrganization: e.target.value }))}
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                    placeholder="Enter issuing organization"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Date Issued</label>
                                                <input
                                                    type="date"
                                                    value={newCertification.dateIssued}
                                                    onChange={(e) => setNewCertification(prev => ({ ...prev, dateIssued: e.target.value }))}
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Associated Skill</label>
                                                <select
                                                    value={newCertification.skillId}
                                                    onChange={(e) => setNewCertification(prev => ({ ...prev, skillId: parseInt(e.target.value) }))}
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                >
                                                    <option value={0}>Select a skill</option>
                                                    {skills.map(skill => (
                                                        <option key={skill.id} value={skill.id}>
                                                            {skill.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-3 mt-6">
                                            <button
                                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                                onClick={() => setShowAddCertificationModal(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                onClick={handleAddCertification}
                                            >
                                                Add Certification
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
