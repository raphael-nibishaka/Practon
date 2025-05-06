import { QuizQuestion } from '../models/types';

export const quizQuestions: Record<string, QuizQuestion[]> = {
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

export const techCategories = [
    { name: 'Web Development', icon: '💻' },
    { name: 'Mobile Apps', icon: '📱' },
    { name: 'Cybersecurity', icon: '🔒' },
    { name: 'Data Science', icon: '📊' },
    { name: 'AI/ML', icon: '🤖' }
];
