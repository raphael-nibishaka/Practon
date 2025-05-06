export interface UserData {
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

export interface Skill {
    id: number;
    name: string;
    description: string;
    owner: {
        id: number;
    };
}

export interface Certification {
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

export interface TestResult {
    id: number;
    testName: string;
    score: number;
    date: string;
}

export interface QuizQuestion {
    id: number;
    question: string;
    field: string;
    options: string[];
    correctAnswer: number;
}

export interface Favorite {
    id: string;
    title: string;
    type: 'course' | 'assessment' | 'resource';
    progress?: number;
    lastAccessed?: string;
}
