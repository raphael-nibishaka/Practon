import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// API base URL
const API_BASE_URL = 'http://localhost:8098';

// API service functions
const fetchUserSkills = async (userId: number) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/skills/owner/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user skills:', error);
        toast.error('Failed to fetch skills');
        return [];
    }
};

const fetchUserCertifications = async (userId: number) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/certifications/owner/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user certifications:', error);
        toast.error('Failed to fetch certifications');
        return [];
    }
};

const createSkill = async (skillData: { name: string; description: string; ownerId: number }) => {
    try {
        console.log('Creating skill with data:', skillData);
        const requestData = {
            name: skillData.name,
            description: skillData.description,
            owner: {
                id: skillData.ownerId
            }
        };
        console.log('Sending skill request:', requestData);
        const response = await axios.post<Skill>(`${API_BASE_URL}/skills`, requestData);
        console.log('Skill creation response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating skill:', error);
        if (axios.isAxiosError(error)) {
            console.error('Error response:', error.response?.data);
        }
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

interface QuizQuestion {
    id: number;
    question: string;
    field: string;
    options: string[];
    correctAnswer: number;
}

interface TestResult {
    category: string;
    score: number;
    date: string;
    passed: boolean;
}

// Add this function for PDF generation
const generateCertificatePDF = (certificate: TestResult, userData: UserData) => {
    const doc = new jsPDF();

    // Add background
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 0, 210, 297, 'F');

    // Add header
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 128);
    doc.text('Certificate of Achievement', 105, 40, { align: 'center' });

    // Add decorative border
    doc.setDrawColor(0, 0, 128);
    doc.setLineWidth(1);
    doc.rect(20, 20, 170, 257);

    // Add content
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('This is to certify that', 105, 70, { align: 'center' });

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`${userData.firstname} ${userData.lastname}`, 105, 85, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('has successfully completed the', 105, 100, { align: 'center' });

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${certificate.category} Assessment`, 105, 115, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(`with a score of ${certificate.score}%`, 105, 130, { align: 'center' });

    // Add date
    doc.text(`Date: ${certificate.date}`, 105, 150, { align: 'center' });

    // Add certificate ID
    const certId = Math.random().toString(36).substring(2, 15).toUpperCase();
    doc.text(`Certificate ID: ${certId}`, 105, 165, { align: 'center' });

    // Add signature line
    doc.text('PraCton', 105, 220, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(80, 230, 130, 230);
    doc.text('Authorized Signature', 105, 240, { align: 'center' });

    // Save the PDF
    doc.save(`Certificate_${certId}.pdf`);
};

const Dashboard: React.FC = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<string>('dashboard');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [quizStarted, setQuizStarted] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [favorites, setFavorites] = useState<Array<{
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
    const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
    const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});
    const [quizScore, setQuizScore] = useState<number>(0);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [showCertificate, setShowCertificate] = useState<boolean>(false);
    const [currentCertificate, setCurrentCertificate] = useState<TestResult | null>(null);
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

    // Update the quiz questions with more questions
    const quizQuestions: Record<string, QuizQuestion[]> = {
        'Web Development': [
            {
                id: 1,
                question: "What is the purpose of CSS media queries?",
                field: "Web Development",
                options: [
                    "To style HTML elements",
                    "To make websites responsive",
                    "To add animations",
                    "To handle form submissions"
                ],
                correctAnswer: 1
            },
            {
                id: 2,
                question: "Which of these is NOT a JavaScript framework?",
                field: "Web Development",
                options: [
                    "React",
                    "Angular",
                    "Vue",
                    "Python"
                ],
                correctAnswer: 3
            },
            {
                id: 3,
                question: "What does HTML stand for?",
                field: "Web Development",
                options: [
                    "Hyper Text Markup Language",
                    "High Tech Modern Language",
                    "Hyper Transfer Markup Language",
                    "Home Tool Markup Language"
                ],
                correctAnswer: 0
            },
            {
                id: 4,
                question: "Which CSS property is used to change the text color?",
                field: "Web Development",
                options: [
                    "text-color",
                    "font-color",
                    "color",
                    "text-style"
                ],
                correctAnswer: 2
            },
            {
                id: 5,
                question: "What is the correct way to create a function in JavaScript?",
                field: "Web Development",
                options: [
                    "function = myFunction()",
                    "function myFunction()",
                    "create myFunction()",
                    "new function myFunction()"
                ],
                correctAnswer: 1
            }
        ],
        'Cybersecurity': [
            {
                id: 1,
                question: "What is the primary purpose of a firewall?",
                field: "Cybersecurity",
                options: [
                    "To prevent unauthorized access",
                    "To speed up internet connection",
                    "To store passwords",
                    "To create backups"
                ],
                correctAnswer: 0
            },
            {
                id: 2,
                question: "What is phishing?",
                field: "Cybersecurity",
                options: [
                    "A type of malware",
                    "A fishing technique",
                    "A social engineering attack",
                    "A network protocol"
                ],
                correctAnswer: 2
            },
            {
                id: 3,
                question: "What is two-factor authentication?",
                field: "Cybersecurity",
                options: [
                    "Using two passwords",
                    "Verification using two different methods",
                    "Two-step login process",
                    "Double encryption"
                ],
                correctAnswer: 1
            },
            {
                id: 4,
                question: "What is a VPN used for?",
                field: "Cybersecurity",
                options: [
                    "To increase internet speed",
                    "To create secure connections",
                    "To block ads",
                    "To share files"
                ],
                correctAnswer: 1
            },
            {
                id: 5,
                question: "What is encryption?",
                field: "Cybersecurity",
                options: [
                    "Converting data to unreadable format",
                    "Compressing files",
                    "Deleting sensitive data",
                    "Backing up data"
                ],
                correctAnswer: 0
            }
        ]
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
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setUserData(user);

                // Fetch user's skills and certifications
                if (user.id) {
                    Promise.all([
                        fetchUserSkills(user.id),
                        fetchUserCertifications(user.id)
                    ]).then(([skillsData, certificationsData]) => {
                        setSkills(skillsData);
                        setCertifications(certificationsData);
                    });
                }
            } catch (err) {
                console.error('Error parsing user data', err);
                toast.error('Error loading user data');
            }
        }

        setLoading(false);
    }, [navigate]);

    const handleLogout = () => {
        // Clear session storage
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('isAuthenticated');
        toast.success('Logged out successfully');
        setTimeout(() => {
            navigate('/login');
        }, 1000);
    };

    const removeFromFavorites = (id: string) => {
        setFavorites(prev => prev.filter(item => item.id !== id));
        toast.success('Removed from favorites');
    };

    const getFirstLetter = () => {
        return userData?.firstname?.charAt(0).toUpperCase() || '?';
    };

    const startQuiz = () => {
        setQuizStarted(true);
        setCurrentPage(1);
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

    const handleNextPage = () => {
        if (currentPage < (quizQuestions[selectedCategory || '']?.length || 0)) {
            setCurrentPage(currentPage + 1);
        } else {
            handleQuizComplete();
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleAnswerChange = (questionId: string, answerIndex: number) => {
        setQuizAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
    };

    const handleQuizComplete = async () => {
        if (!selectedCategory) {
            toast.error('No category selected');
            return;
        }

        const questions = quizQuestions[selectedCategory] || [];
        if (questions.length === 0) {
            toast.error('No questions available for this category');
            return;
        }

        // Calculate score
        let correctAnswers = 0;
        questions.forEach(question => {
            const userAnswer = quizAnswers[`q${question.id}`];
            if (userAnswer === question.correctAnswer) {
                correctAnswers++;
            }
        });

        const score = Math.round((correctAnswers / questions.length) * 100);
        const result: TestResult = {
            category: selectedCategory,
            score: score,
            date: new Date().toISOString().split('T')[0],
            passed: score >= 70
        };

        setTestResults(prev => [...prev, result]);
        setQuizScore(score);
        setQuizCompleted(true);

        if (score >= 70 && userData?.id) {
            try {
                console.log('Starting skill and certification creation for user:', userData.id);

                // Create new skill
                const skillData = {
                    name: `${selectedCategory} Proficiency`,
                    description: `Demonstrated proficiency in ${selectedCategory} with a score of ${score}%`,
                    ownerId: userData.id
                };

                console.log('Creating skill:', skillData);
                const createdSkill = await createSkill(skillData);
                console.log('Created skill:', createdSkill);

                if (!createdSkill || !createdSkill.id) {
                    throw new Error('Failed to create skill');
                }

                // Show success message for skill creation
                toast.success(`Skill "${createdSkill.name}" successfully stored in database!`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "light"
                });

                // Create certification for the skill
                const certificationData = {
                    name: `${selectedCategory} Certification`,
                    issuingOrganization: 'PraCton',
                    dateIssued: new Date().toISOString().split('T')[0],
                    ownerId: userData.id,
                    skillId: createdSkill.id
                };

                console.log('Creating certification:', certificationData);
                const createdCertification = await createCertification(certificationData);
                console.log('Created certification:', createdCertification);

                if (!createdCertification) {
                    throw new Error('Failed to create certification');
                }

                // Show success message for certification creation
                toast.success(`Certification "${createdCertification.name}" successfully stored in database!`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "light"
                });

                // Update local state with the new certification
                setCertifications(prev => [...prev, createdCertification]);

                // Show final success message
                toast.success(`Congratulations! You passed with ${score}% and earned a certificate!`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "light"
                });

                // Generate and show certificate after a short delay to ensure the toasts are visible
                setTimeout(() => {
                    generateCertificatePDF(result, userData);
                    setCurrentCertificate(result);
                    setShowCertificate(true);
                }, 2000);

            } catch (error) {
                console.error('Error in quiz completion:', error);
                let errorMessage = 'Failed to create skill and certification. Please try again.';

                if (axios.isAxiosError(error)) {
                    const responseData = error.response?.data;
                    if (responseData) {
                        errorMessage = `Error: ${responseData.message || JSON.stringify(responseData)}`;
                    }
                } else if (error instanceof Error) {
                    errorMessage = error.message;
                }

                toast.error(errorMessage);
            }
        } else {
            toast.info(`Test completed with ${score}%. You need 70% to earn a certificate. Try again!`);
        }
    };

    const handleAddSkill = async () => {
        if (!userData?.id) return;

        try {
            const skillData = {
                ...newSkill,
                ownerId: userData.id
            };
            const createdSkill = await createSkill(skillData);
            setSkills(prev => [...prev, createdSkill]);
            setShowAddSkillModal(false);
            setNewSkill({ name: '', description: '' });
            toast.success('Skill added successfully');
        } catch (error) {
            toast.error('Failed to add skill');
        }
    };

    const handleAddCertification = async () => {
        if (!userData?.id) return;

        try {
            const certificationData = {
                ...newCertification,
                ownerId: userData.id
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    const techCategories = [
        { name: 'Web Development', icon: '💻' },
        { name: 'Mobile Apps', icon: '📱' },
        { name: 'Cybersecurity', icon: '🔒' },
        { name: 'Data Science', icon: '📊' },
        { name: 'AI/ML', icon: '🤖' }
    ];

    // Filter categories to show what's related to user's field of interest
    const relevantCategories = techCategories.filter(
        cat => !userData?.fieldOfInterest || cat.name === userData.fieldOfInterest
    );

    // Update the certifications display section
    const renderCertifications = () => {
        if (certifications.length === 0) {
            return (
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <p className="text-gray-500 mb-2">No certifications available yet</p>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Start earning certifications
                    </button>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certifications.map((cert) => (
                    <div key={cert.id} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-800">{cert.name}</p>
                            <p className="text-xs text-gray-500">
                                Issued by: {cert.issuingOrganization}
                                <br />
                                Date: {cert.dateIssued}
                                <br />
                                Skill: {cert.skill.name}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        );
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
                    <h2 className="text-2xl font-semibold">PraCton</h2>
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
                        </div>
                    )}
                    {activeTab === 'tests' && !quizStarted && !selectedCategory && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-xl p-8 text-white">
                                <div className="flex flex-col md:flex-row items-center justify-between">
                                    <div className="mb-4 md:mb-0">
                                        <h1 className="text-3xl font-bold mb-3">Skills Assessment</h1>
                                        <p className="text-blue-100 text-lg">
                                            Discover your proficiency level in {userData?.fieldOfInterest || 'various tech fields'}
                                            and get personalized learning recommendations.
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold mb-2">Choose a Category</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                                {relevantCategories.map((category, index) => (
                                    <div
                                        key={index}
                                        className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center cursor-pointer
                     hover:shadow-md transition transform hover:-translate-y-1 border border-gray-100"
                                        onClick={() => setSelectedCategory(category.name)}
                                    >
                                        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                                            <span className="text-3xl">{category.icon}</span>
                                        </div>
                                        <p className="text-center font-medium text-gray-800">{category.name}</p>
                                        <span className="text-sm text-blue-600 mt-2">12 questions</span>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mt-8">
                                <h3 className="font-semibold text-blue-900 mb-2">Why Take a Skills Assessment?</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <div className="flex items-start">
                                        <div className="rounded-full bg-blue-100 p-2 mr-3 flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">Identify your strengths and weaknesses</p>
                                            <p className="text-sm text-gray-600">Understand where you excel and where you need improvement</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="rounded-full bg-blue-100 p-2 mr-3 flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">Get personalized recommendations</p>
                                            <p className="text-sm text-gray-600">Receive custom learning paths based on your results</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="rounded-full bg-blue-100 p-2 mr-3 flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">Track your progress over time</p>
                                            <p className="text-sm text-gray-600">See how your skills improve with each assessment</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tests' && selectedCategory && !quizStarted && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center mb-6">
                                <button onClick={() => setSelectedCategory(null)} className="flex items-center text-gray-700 hover:text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Back to categories
                                </button>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-2xl font-bold mb-2">{selectedCategory} Assessment</h2>
                                <p className="text-gray-600">
                                    This assessment contains 12 questions to evaluate your knowledge and skills in {selectedCategory}.
                                    The results will help us customize your learning path.
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                <h3 className="font-semibold text-lg mb-3">What to expect:</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Questions about your practical experience</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Self-assessment of your skill levels</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Takes approximately 5-10 minutes to complete</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="flex justify-center">
                                <button
                                    className="px-8 py-3 bg-blue-950 text-white rounded-md hover:bg-blue-800 transition font-medium flex items-center"
                                    onClick={startQuiz}
                                >
                                    Start Assessment
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tests' && quizStarted && !quizCompleted && (
                        <div className="max-w-4xl mx-auto">
                            {/* Progress bar */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-600">Progress</span>
                                    <span className="text-sm font-medium text-blue-600">
                                        Question {currentPage} of {quizQuestions[selectedCategory || '']?.length}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-blue-800 h-2.5 rounded-full transition-all duration-300"
                                        style={{ width: `${(currentPage / (quizQuestions[selectedCategory || '']?.length || 1)) * 100}%` }}>
                                    </div>
                                </div>
                            </div>

                            {/* Questions */}
                            <div className="space-y-4 mb-8">
                                {quizQuestions[selectedCategory || '']?.[currentPage - 1] && (
                                    <div className="bg-white rounded-lg shadow-sm p-5 hover:shadow transition border border-gray-100">
                                        <h3 className="font-medium text-gray-800 mb-3">
                                            {quizQuestions[selectedCategory || '']?.[currentPage - 1].question}
                                        </h3>
                                        <div className="space-y-2">
                                            {quizQuestions[selectedCategory || '']?.[currentPage - 1].options.map((option, index) => (
                                                <div key={index} className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        id={`q${currentPage}-${index}`}
                                                        name={`q${currentPage}`}
                                                        className="mr-3 h-4 w-4 text-blue-600"
                                                        checked={quizAnswers[`q${currentPage}`] === index}
                                                        onChange={() => handleAnswerChange(`q${currentPage}`, index)}
                                                    />
                                                    <label htmlFor={`q${currentPage}-${index}`} className="cursor-pointer">
                                                        {option}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation buttons */}
                            <div className="flex justify-between">
                                <button
                                    className={`px-6 py-2 rounded-md transition font-medium ${
                                        currentPage === 1
                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <button
                                    className="px-6 py-2 bg-blue-950 text-white rounded-md hover:bg-blue-800 transition font-medium"
                                    onClick={handleNextPage}
                                >
                                    {currentPage === (quizQuestions[selectedCategory || '']?.length || 0) ? 'Complete' : 'Next'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tests' && quizCompleted && (
                        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Complete!</h2>
                                <div className="w-32 h-32 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-4">
                                    <span className="text-4xl font-bold text-blue-800">{quizScore}%</span>
                                </div>
                                <p className="text-gray-600">
                                    You've completed the {selectedCategory} test with a score of {quizScore}%.
                                </p>
                                {quizScore >= 70 ? (
                                    <div className="mt-4">
                                        <button
                                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
                                            onClick={() => setShowCertificate(true)}
                                        >
                                            View Certificate
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-red-600 mt-4">
                                        You need at least 70% to earn a certificate. Try again!
                                    </p>
                                )}
                            </div>

                            {/* Test History */}
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold mb-4">Test History</h3>
                                <div className="space-y-4">
                                    {testResults.map((result, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">{result.category}</p>
                                                <p className="text-sm text-gray-500">Date: {result.date}</p>
                                            </div>
                                            <div className="flex items-center">
                                                <span className={`text-lg font-semibold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                                                    {result.score}%
                                                </span>
                                                {result.passed && (
                                                    <button
                                                        className="ml-4 text-blue-600 hover:text-blue-800"
                                                        onClick={() => {
                                                            setCurrentCertificate(result);
                                                            setShowCertificate(true);
                                                        }}
                                                    >
                                                        View Certificate
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-center space-x-4 mt-8">
                                <button
                                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition font-medium"
                                    onClick={() => {
                                        setQuizStarted(false);
                                        setQuizCompleted(false);
                                        setQuizAnswers({});
                                        setCurrentPage(1);
                                    }}
                                >
                                    Take Another Test
                                </button>
                                <button
                                    className="px-6 py-2 bg-blue-950 text-white rounded-md hover:bg-blue-800 transition font-medium"
                                    onClick={() => setActiveTab('dashboard')}
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        </div>
                    )}

                    {showCertificate && currentCertificate && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
                                <div className="text-center mb-6">
                                    <h2 className="text-3xl font-bold text-blue-900 mb-2">Certificate of Achievement</h2>
                                    <p className="text-gray-600">This certificate is awarded to</p>
                                    <p className="text-xl font-semibold">{userData?.firstname} {userData?.lastname}</p>
                                </div>

                                <div className="border-2 border-blue-900 p-6 rounded-lg mb-6">
                                    <p className="text-center text-lg mb-4">
                                        For successfully completing the {currentCertificate.category} test
                                    </p>
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Score</p>
                                            <p className="text-xl font-bold">{currentCertificate.score}%</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Date</p>
                                            <p className="text-xl font-bold">{currentCertificate.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Certificate ID</p>
                                        <p className="font-mono">{Math.random().toString(36).substring(2, 15).toUpperCase()}</p>
                                    </div>
                                </div>

                                <div className="flex justify-center space-x-4">
                                    <button
                                        className="px-6 py-2 bg-blue-950 text-white rounded-md hover:bg-blue-800 transition font-medium"
                                        onClick={() => {
                                            if (currentCertificate && userData) {
                                                generateCertificatePDF(currentCertificate, userData);
                                            }
                                        }}
                                    >
                                        Download PDF
                                    </button>
                                    <button
                                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition font-medium"
                                        onClick={() => setShowCertificate(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
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
                                        <span className="text-2xl font-bold text-gray-800">Beginner</span>
                                        <span className="text-sm text-blue-600 font-medium">Take assessment →</span>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
                                    <div className="flex items-center mb-2">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-gray-700">Certifications</h3>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold text-gray-800">{userData?.certifications?.length || 0}</span>
                                        <span className="text-sm text-green-600 font-medium">View all →</span>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
                                    <div className="flex items-center mb-2">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-gray-700">Courses</h3>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold text-gray-800">0</span>
                                        <span className="text-sm text-purple-600 font-medium">Explore courses →</span>
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
                                        {userData?.code && (
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">User Code</p>
                                                <p className="font-medium text-gray-800">{userData.code}</p>
                                            </div>
                                        )}
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
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-gray-800">Certifications & Achievements</h2>
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add New
                                    </button>
                                </div>
                                <div className="p-6">
                                    {renderCertifications()}
                                </div>
                            </div>

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
                                    {skills.length === 0 ? (
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
                                                                setSkills(prev => prev.filter(s => s.id !== skill.id));
                                                                toast.success('Skill removed successfully');
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
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                    placeholder="Enter skill name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                <textarea
                                                    value={newSkill.description}
                                                    onChange={(e) => setNewSkill(prev => ({ ...prev, description: e.target.value }))}
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                    placeholder="Enter skill description"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-3 mt-6">
                                            <button
                                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                                onClick={() => setShowAddSkillModal(false)}
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
                    {activeTab === 'favorites' && (
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
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                                                            favorite.type === 'course' ? 'bg-blue-100' :
                                                            favorite.type === 'assessment' ? 'bg-green-100' :
                                                            'bg-purple-100'
                                                        }`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${
                                                                favorite.type === 'course' ? 'text-blue-600' :
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
