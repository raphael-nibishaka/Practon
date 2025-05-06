export const API_BASE_URL = 'http://localhost:8098';

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    CERTIFICATIONS: '/certifications',
    TESTS: '/tests',
    RESET_PASSWORD: '/reset-password'
};

export const AUTH_TOKEN_KEY = 'auth_token';
export const USER_DATA_KEY = 'user_data';

export const PASSWORD_REQUIREMENTS = {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL_CHAR: false
};

export const TEST_CATEGORIES = {
    WEB_DEVELOPMENT: 'Web Development',
    MOBILE_APPS: 'Mobile Apps',
    CYBERSECURITY: 'Cybersecurity',
    DATA_SCIENCE: 'Data Science',
    AI_ML: 'AI/ML'
};

export const SCORE_THRESHOLDS = {
    EXCELLENT: 80,
    GOOD: 60,
    POOR: 0
};

export const ERROR_MESSAGES = {
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PASSWORD: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers',
    INVALID_POSTAL_CODE: 'Please enter a valid postal code (e.g., 12345 or 12345-6789)',
    REQUIRED_FIELD: 'This field is required',
    NETWORK_ERROR: 'Network error. Please try again later',
    SERVER_ERROR: 'Server error. Please try again later',
    UNAUTHORIZED: 'Please log in to continue',
    FORBIDDEN: 'You do not have permission to perform this action'
};
