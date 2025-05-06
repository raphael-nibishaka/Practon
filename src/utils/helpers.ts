import { TestResult } from '../models/types';

export const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const calculateAverageScore = (results: TestResult[]): number => {
    if (results.length === 0) return 0;
    const sum = results.reduce((acc, result) => acc + result.score, 0);
    return Math.round(sum / results.length);
};

export const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
};

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
};

export const validatePostalCode = (postalCode: string): boolean => {
    // Accepts formats: 12345 or 12345-6789
    const postalCodeRegex = /^\d{5}(-\d{4})?$/;
    return postalCodeRegex.test(postalCode);
};

export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

export const generateRandomId = (): string => {
    return Math.random().toString(36).substr(2, 9);
};
