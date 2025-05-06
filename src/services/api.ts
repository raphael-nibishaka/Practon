import axios from 'axios';
import { Skill, Certification } from '../models/types';

const API_BASE_URL = 'http://localhost:8098';

export const fetchUserSkills = async (userCode: number): Promise<Skill[]> => {
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
        throw error;
    }
};

export const createSkill = async (skillData: { name: string; description: string; owner: { id: number } }): Promise<Skill> => {
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
        throw error;
    }
};

export const createCertification = async (certificationData: {
    name: string;
    issuingOrganization: string;
    dateIssued: string;
    ownerId: number;
    skillId: number;
}): Promise<Certification> => {
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
        throw error;
    }
};

export const deleteSkill = async (skillId: number): Promise<boolean> => {
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
        throw error;
    }
};

export const fetchUserCertifications = async (userId: number): Promise<Certification[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/certifications/owner/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching certifications:", error);
        throw error;
    }
};
