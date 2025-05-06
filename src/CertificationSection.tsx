import { useEffect, useState } from "react";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface Certification {
    id: number;
    name: string;
    issuingOrganization: string;
    dateIssued: string;
    skill: {
        id: number;
        name: string;
        description: string;
    };
    ownerWithoutCertifications?: {
        firstname: string;
        lastname: string;
        email: string;
        address: {
            city: string;
            country: string;
        };
    };
}

const generateCertificatePDF = (certification: Certification) => {
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
    if (certification.ownerWithoutCertifications) {
        doc.text(`${certification.ownerWithoutCertifications.firstname} ${certification.ownerWithoutCertifications.lastname}`, 105, 85, { align: 'center' });
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('has successfully completed the', 105, 100, { align: 'center' });

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(certification.name, 105, 115, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(`Issued by ${certification.issuingOrganization}`, 105, 130, { align: 'center' });

    // Add date
    doc.text(`Date: ${certification.dateIssued}`, 105, 150, { align: 'center' });

    // Add certificate ID
    const certId = Math.random().toString(36).substring(2, 15).toUpperCase();
    doc.text(`Certificate ID: ${certId}`, 105, 165, { align: 'center' });

    // Add signature line
    doc.text('DevUp', 105, 220, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(80, 230, 130, 230);
    doc.text('Authorized Signature', 105, 240, { align: 'center' });

    // Save the PDF
    doc.save(`Certificate_${certId}.pdf`);
};

interface CertificationSectionProps {
    userId: number;
    onCertificationCountChange?: (count: number) => void;
}

const CertificationsSection: React.FC<CertificationSectionProps> = ({ userId, onCertificationCountChange }) => {
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null);
    const [showCertificate, setShowCertificate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserCertifications = async () => {
            if (!userId) return;
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
                setCertifications(data);
                if (onCertificationCountChange) {
                    onCertificationCountChange(data.length);
                }
            } catch (err) {
                setError('Failed to load certifications');
                console.error('Error fetching certifications:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserCertifications();
    }, [userId, onCertificationCountChange]);

    const renderCertifications = () => {
        if (loading) {
            return (
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <p className="text-gray-500">Loading certifications...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-red-500 mb-2">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        if (!certifications || certifications.length === 0) {
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
            <div className="space-y-4">
                {certifications.map((cert) => (
                    <div key={cert.id} className="border border-gray-200 rounded-md p-4 hover:shadow-sm transition">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-md font-semibold text-gray-800">{cert.name}</h3>
                                <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                                <p className="text-sm text-gray-500">Issued on: {new Date(cert.dateIssued).toLocaleDateString()}</p>
                            </div>
                            {cert.skill && (
                                <div className="text-right">
                                    <p className="text-sm font-medium text-blue-600">{cert.skill.name}</p>
                                    <p className="text-xs text-gray-500">{cert.skill.description}</p>
                                </div>
                            )}
                        </div>
                        {cert.ownerWithoutCertifications && (
                            <div className="mt-2 text-sm text-gray-500">
                                <p>Owner: {cert.ownerWithoutCertifications.firstname} {cert.ownerWithoutCertifications.lastname}</p>
                                <p>Email: {cert.ownerWithoutCertifications.email}</p>
                                <p>Location: {cert.ownerWithoutCertifications.address.city}, {cert.ownerWithoutCertifications.address.country}</p>
                            </div>
                        )}
                        <div className="mt-4 flex justify-end space-x-4">
                            <button
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                onClick={() => {
                                    setSelectedCertification(cert);
                                    setShowCertificate(true);
                                }}
                            >
                                View Certificate
                            </button>
                            <button
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                onClick={() => generateCertificatePDF(cert)}
                            >
                                Download Certificate
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Certifications & Achievements</h2>
            </div>
            <div className="p-6">
                {renderCertifications()}
            </div>

            {showCertificate && selectedCertification && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Certificate of Achievement</h2>
                            <div className="border-2 border-blue-800 p-6 rounded-lg">
                                <p className="text-gray-600 mb-4">This is to certify that</p>
                                {selectedCertification.ownerWithoutCertifications && (
                                    <p className="text-xl font-bold mb-4">
                                        {selectedCertification.ownerWithoutCertifications.firstname} {selectedCertification.ownerWithoutCertifications.lastname}
                                    </p>
                                )}
                                <p className="text-gray-600 mb-4">has successfully completed the</p>
                                <p className="text-xl font-bold mb-4">{selectedCertification.name}</p>
                                <p className="text-gray-600 mb-4">Issued by {selectedCertification.issuingOrganization}</p>
                                <p className="text-gray-600">Date: {selectedCertification.dateIssued}</p>
                            </div>
                            <div className="mt-6 space-x-4">
                                <button
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
                                    onClick={() => generateCertificatePDF(selectedCertification)}
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
};

export default CertificationsSection;
