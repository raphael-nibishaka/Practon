import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface UserData {
    id: number;
    firstname: string;
    lastname: string;
    fieldOfInterest: string;
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

interface TestsSectionProps {
    userData: UserData | null;
    onTestComplete: (testName: string, score: number) => Promise<void>;
}

const generateCertificatePDF = async (userData: any, testResult: any) => {
    const doc = new jsPDF();

    // Add subtle background gradient
    doc.setFillColor(41, 128, 185, 0.05);
    doc.rect(0, 0, 210, 297, 'F');

    // Add decorative border with gradient effect
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(3);
    doc.rect(10, 10, 190, 277);

    // Add inner border with pattern
    doc.setDrawColor(52, 152, 219);
    doc.setLineWidth(0.5);
    doc.rect(15, 15, 180, 267);

    // Add corner decorations with gradient effect
    const cornerSize = 20;
    const corners = [
        [15, 15], [195, 15], [15, 282], [195, 282]
    ];
    corners.forEach(([x, y]) => {
        doc.setDrawColor(41, 128, 185);
        doc.setLineWidth(1);
        doc.line(x, y, x + cornerSize, y);
        doc.line(x, y, x, y + cornerSize);
    });

    // Add header with cool font and gradient effect
    doc.setFont('Orbitron', 'bold');
    doc.setFontSize(36);
    doc.setTextColor(41, 128, 185);
    doc.text('Certificate of Achievement', 105, 45, { align: 'center' });

    // Add decorative line with gradient
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(1);
    doc.line(40, 55, 170, 55);

    // Add certificate content with Space Grotesk font
    doc.setFont('Space Grotesk', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);

    // This is to certify
    doc.setFontSize(18);
    doc.text('This is to certify that', 105, 80, { align: 'center' });

    // Student name with special styling and gradient effect
    doc.setFontSize(32);
    doc.setFont('Orbitron', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text(`${userData.firstname} ${userData.lastname}`, 105, 100, { align: 'center' });

    // Has successfully completed
    doc.setFontSize(18);
    doc.setFont('Space Grotesk', 'normal');
    doc.setTextColor(44, 62, 80);
    doc.text('has successfully completed the', 105, 120, { align: 'center' });

    // Test name with special styling and gradient effect
    doc.setFontSize(28);
    doc.setFont('Orbitron', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text(testResult.category, 105, 140, { align: 'center' });

    // Score and date with modern styling
    doc.setFontSize(18);
    doc.setFont('Space Grotesk', 'normal');
    doc.setTextColor(44, 62, 80);
    doc.text(`with a score of ${testResult.score}%`, 105, 160, { align: 'center' });
    doc.text(`on ${new Date(testResult.date).toLocaleDateString()}`, 105, 170, { align: 'center' });

    // Add achievement badge with gradient effect
    doc.setFillColor(41, 128, 185, 0.1);
    doc.circle(105, 200, 35, 'F');
    doc.setFontSize(28);
    doc.setFont('Orbitron', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text('✓', 105, 205, { align: 'center' });

    // Certificate ID with modern styling
    doc.setFontSize(12);
    doc.setFont('Space Grotesk', 'normal');
    doc.setTextColor(44, 62, 80);
    const certId = Math.random().toString(36).substring(2, 15).toUpperCase();
    doc.text(`Certificate ID: ${certId}`, 105, 240, { align: 'center' });

    // Add signature section with modern styling
    doc.setFontSize(14);
    doc.text('Authorized Signature', 105, 260, { align: 'center' });

    // Add signature line with gradient
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.line(85, 265, 125, 265);

    // Add DevUp text with cool font and gradient effect
    doc.setFont('Orbitron', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(41, 128, 185);
    doc.text('DevUp', 105, 275, { align: 'center' });

    // Add watermark with gradient effect
    doc.setTextColor(240, 240, 240);
    doc.setFontSize(70);
    doc.setFont('Orbitron', 'bold');
    doc.text('DevUp', 105, 150, { align: 'center', angle: 45 });

    // Add verification QR code placeholder with gradient
    doc.setFillColor(41, 128, 185, 0.1);
    doc.rect(160, 240, 30, 30, 'F');
    doc.setFontSize(8);
    doc.setFont('Space Grotesk', 'normal');
    doc.setTextColor(44, 62, 80);
    doc.text('Scan to verify', 175, 275, { align: 'center' });

    // Add footer with verification URL
    doc.setFontSize(8);
    doc.text('This certificate is digitally generated and can be verified at devup.com/verify', 105, 290, { align: 'center' });

    // Save the PDF with a meaningful name
    doc.save(`DevUp_Certificate_${certId}.pdf`);
    return doc;
};

const TestsSection: React.FC<TestsSectionProps> = ({ userData, onTestComplete }) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [quizStarted, setQuizStarted] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
    const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});
    const [quizScore, setQuizScore] = useState<number>(0);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [showCertificate, setShowCertificate] = useState<boolean>(false);
    const [currentCertificate, setCurrentCertificate] = useState<TestResult | null>(null);

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

    const techCategories = [
        { name: 'Web Development', icon: '💻' },
        { name: 'Mobile Apps', icon: '📱' },
        { name: 'Cybersecurity', icon: '🔒' },
        { name: 'Data Science', icon: '📊' },
        { name: 'AI/ML', icon: '🤖' }
    ];

    const relevantCategories = techCategories.filter(
        cat => !userData?.fieldOfInterest || cat.name === userData.fieldOfInterest
    );

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

        if (score >= 70 && userData) {
            try {
                // Call the parent component's onTestComplete handler
                await onTestComplete(selectedCategory, score);

                toast.success(`Congratulations! You passed with ${score}% and earned a certificate!`);
                setCurrentCertificate(result);
                setShowCertificate(true);
            } catch (error) {
                console.error('Error in quiz completion:', error);
                toast.error('Failed to process test completion. Please try again.');
            }
        } else {
            toast.info(`Test completed with ${score}%. You need 70% to earn a certificate. Try again!`);
        }
    };

    if (!quizStarted && !selectedCategory) {
        return (
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
        );
    }

    if (selectedCategory && !quizStarted) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-6">
                    <button onClick={goBack} className="flex items-center text-gray-700 hover:text-blue-600">
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
        );
    }

    if (quizStarted && !quizCompleted) {
        return (
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
                        className={`px-6 py-2 rounded-md transition font-medium ${currentPage === 1
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
        );
    }

    if (quizCompleted) {
        return (
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Complete!</h2>
                    <div className="w-32 h-32 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-4">
                        <span className="text-4xl font-bold text-blue-800">{quizScore}%</span>
                    </div>
                    <p className="text-gray-600">
                        You've completed the {selectedCategory} test with a score of {quizScore}%.
                    </p>
                    {quizScore >= 70 && userData ? (
                        <div className="mt-4 space-x-4">
                            <button
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
                                onClick={() => {
                                    setCurrentCertificate({
                                        category: selectedCategory || '',
                                        score: quizScore,
                                        date: new Date().toISOString().split('T')[0],
                                        passed: true
                                    });
                                    setShowCertificate(true);
                                }}
                            >
                                View Certificate
                            </button>
                            <button
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
                                onClick={() => {
                                    if (userData) {
                                        generateCertificatePDF(userData, {
                                            category: selectedCategory || '',
                                            score: quizScore,
                                            date: new Date().toISOString().split('T')[0],
                                            passed: true
                                        });
                                    }
                                }}
                            >
                                Download Certificate
                            </button>
                        </div>
                    ) : (
                        <p className="text-red-600 mt-4">
                            You need at least 70% to earn a certificate. Try again!
                        </p>
                    )}
                </div>

                {/* Test History */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Test History</h3>
                    <div className="space-y-4">
                        {testResults.map((result, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium">{result.category}</p>
                                    <p className="text-sm text-gray-500">Date: {result.date}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className={`text-lg font-semibold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                                        {result.score}%
                                    </span>
                                    {result.passed && userData && (
                                        <>
                                            <button
                                                className="text-blue-600 hover:text-blue-800"
                                                onClick={() => {
                                                    setCurrentCertificate(result);
                                                    setShowCertificate(true);
                                                }}
                                            >
                                                View
                                            </button>
                                            <button
                                                className="text-blue-600 hover:text-blue-800"
                                                onClick={() => generateCertificatePDF(userData, result)}
                                            >
                                                Download
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {showCertificate && currentCertificate && userData && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Certificate of Achievement</h2>
                                <div className="border-2 border-blue-800 p-6 rounded-lg">
                                    <p className="text-gray-600 mb-4">This is to certify that</p>
                                    <p className="text-xl font-bold mb-4">{userData.firstname} {userData.lastname}</p>
                                    <p className="text-gray-600 mb-4">has successfully completed the</p>
                                    <p className="text-xl font-bold mb-4">{currentCertificate.category} Assessment</p>
                                    <p className="text-gray-600 mb-4">with a score of {currentCertificate.score}%</p>
                                    <p className="text-gray-600">Date: {currentCertificate.date}</p>
                                </div>
                                <div className="mt-6 space-x-4">
                                    <button
                                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
                                        onClick={() => generateCertificatePDF(userData, currentCertificate)}
                                    >
                                        Download PDF
                                    </button>
                                    <button
                                        className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition font-medium"
                                        onClick={() => setShowCertificate(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
};

export default TestsSection;
