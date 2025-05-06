import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const CertificationsSection = ({ userId }: { userId: number }) => {
const [certifications, setCertifications] = useState([]);

  const fetchUserCertifications = async (userId: number) => {
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
      return data;
    } catch (error) {
      console.error("Error fetching user certifications:", error);
      toast.error("Failed to fetch certifications");
      return [];
    }
  };

  useEffect(() => {
    fetchUserCertifications(userId).then(setCertifications);
  }, [userId]);

  const renderCertifications = () => {
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
        {certifications.map((cert: any) => (
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
          </div>
        ))}
      </div>
    );
  };

  return (
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
  );
};

export default CertificationsSection;
