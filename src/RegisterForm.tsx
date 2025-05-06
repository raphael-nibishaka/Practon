import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface Address {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}

interface PersonForm {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    fieldOfInterest: string;
    address: Address;
}

interface ValidationErrors {
    firstname?: string;
    lastname?: string;
    email?: string;
    password?: string;
    fieldOfInterest?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
}

const RegisterForm: React.FC = () => {
    const navigate = useNavigate();
    const [errors, setErrors] = useState<ValidationErrors>({});

    const [formData, setFormData] = useState<PersonForm>({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        fieldOfInterest: '',
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            postalCode: '',
        },
    });

    const [step, setStep] = useState(1);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string): boolean => {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return passwordRegex.test(password);
    };

    const validateStep1 = (): boolean => {
        const newErrors: ValidationErrors = {};
        let isValid = true;

        // First name validation
        if (!formData.firstname.trim()) {
            newErrors.firstname = 'First name is required';
            isValid = false;
        } else if (formData.firstname.length < 2) {
            newErrors.firstname = 'First name must be at least 2 characters';
            isValid = false;
        }

        // Last name validation
        if (!formData.lastname.trim()) {
            newErrors.lastname = 'Last name is required';
            isValid = false;
        } else if (formData.lastname.length < 2) {
            newErrors.lastname = 'Last name must be at least 2 characters';
            isValid = false;
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (!validatePassword(formData.password)) {
            newErrors.password = 'Password must be at least 8 characters and include uppercase, lowercase, and numbers';
            isValid = false;
        }

        // Field of interest validation
        if (!formData.fieldOfInterest) {
            newErrors.fieldOfInterest = 'Please select a field of interest';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const validateStep2 = (): boolean => {
        const newErrors: ValidationErrors = {};
        let isValid = true;

        // Street validation
        if (!formData.address.street.trim()) {
            newErrors.street = 'Street address is required';
            isValid = false;
        }

        // City validation
        if (!formData.address.city.trim()) {
            newErrors.city = 'City is required';
            isValid = false;
        }

        // State validation
        if (!formData.address.state.trim()) {
            newErrors.state = 'State is required';
            isValid = false;
        }

        // Country validation
        if (!formData.address.country.trim()) {
            newErrors.country = 'Country is required';
            isValid = false;
        }

        // Postal code validation
        if (!formData.address.postalCode.trim()) {
            newErrors.postalCode = 'Postal code is required';
            isValid = false;
        } else if (!/^\d{5}(-\d{4})?$/.test(formData.address.postalCode)) {
            newErrors.postalCode = 'Please enter a valid postal code (e.g., 12345 or 12345-6789)';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (['street', 'city', 'state', 'country', 'postalCode'].includes(name)) {
            setFormData((prev) => ({
                ...prev,
                address: {
                    ...prev.address,
                    [name]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
        // Clear error when user starts typing
        if (errors[name as keyof ValidationErrors]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const handleNext = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleBack = () => setStep(1);

    const API_URL = 'http://localhost:8098';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep2()) {
            return;
        }

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success('Signup successful!');
                setTimeout(() => navigate('/login'), 1500);
            } else if (res.status === 401) {
                toast.error('Email Already registered');
            } else {
                toast.error('Signup failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="w-full h-screen flex">
            <ToastContainer position="top-right" />

            <div className="w-2/5 bg-[#0B1437] hidden md:flex flex-col justify-center items-center">
                <div className="w-72 h-72 bg-white rounded-full" />
                <p className="text-white text-lg mt-6 font-['Space+Grotesk'] font-semibold tracking-wider">
                    {step === 1 ? 'Signup with ' : 'Register with '}
                    <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent font-['Orbitron']">DevUp</span>
                </p>
            </div>

            <div className="flex-1 flex items-center justify-center px-8">
                <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
                    {step === 1 ? (
                        <>
                            <h2 className="text-3xl font-extrabold text-[#0B1437]">Welcome !!!</h2>

                            <button
                                type="button"
                                className="w-full border py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-50"
                            >
                                <img
                                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                                    alt="Google"
                                    className="w-5 h-5 mr-2"
                                />
                                <span className="text-gray-700">SignUp with Google</span>
                            </button>

                            <div className="flex items-center my-6">
                                <hr className="flex-grow border-gray-300" />
                                <span className="px-3 text-gray-500">or</span>
                                <hr className="flex-grow border-gray-300" />
                            </div>

                            {['firstname', 'lastname', 'email', 'password'].map((field) => (
                                <div key={field}>
                                    <label htmlFor={field} className="text-sm text-gray-600 block mb-1 capitalize">
                                        {field.replace(/([A-Z])/g, ' $1')}
                                    </label>
                                    <input
                                        type={field === 'password' ? 'password' : 'text'}
                                        name={field}
                                        id={field}
                                        placeholder={`Enter your ${field}`}
                                        value={(formData as any)[field]}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${errors[field as keyof ValidationErrors] ? 'border-red-500' : ''
                                            }`}
                                    />
                                    {errors[field as keyof ValidationErrors] && (
                                        <p className="text-red-500 text-sm mt-1">{errors[field as keyof ValidationErrors]}</p>
                                    )}
                                </div>
                            ))}

                            <div>
                                <label htmlFor="fieldOfInterest" className="text-sm text-gray-600 block mb-1">
                                    Field Of Interest
                                </label>
                                <select
                                    name="fieldOfInterest"
                                    id="fieldOfInterest"
                                    value={formData.fieldOfInterest}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${errors.fieldOfInterest ? 'border-red-500' : ''
                                        }`}
                                >
                                    <option value="">Select field of interest</option>
                                    <option value="Web Development">Web Development</option>
                                    <option value="Mobile Apps">Mobile Apps</option>
                                    <option value="Cybersecurity">Cybersecurity</option>
                                    <option value="Data Science">Data Science</option>
                                    <option value="AI/ML">AI / Machine Learning</option>
                                </select>
                                {errors.fieldOfInterest && (
                                    <p className="text-red-500 text-sm mt-1">{errors.fieldOfInterest}</p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={handleNext}
                                className="w-full bg-[#0B1437] text-white py-3 rounded-lg hover:opacity-90"
                            >
                                Next
                            </button>

                            <p className="text-sm text-center">
                                Already on site?{' '}
                                <span
                                    onClick={() => navigate('/login')}
                                    className="text-[#0B1437] font-semibold cursor-pointer hover:underline"
                                >
                                    Login
                                </span>
                            </p>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex items-center text-[#11213B] mb-4"
                            >
                                <ArrowLeft className="mr-2" /> Back
                            </button>

                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Address</h3>

                            {['street', 'city', 'state', 'country', 'postalCode'].map((field) => (
                                <div key={field}>
                                    <input
                                        name={field}
                                        id={field}
                                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                        value={(formData.address as any)[field]}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 mb-3 ${errors[field as keyof ValidationErrors] ? 'border-red-500' : ''
                                            }`}
                                    />
                                    {errors[field as keyof ValidationErrors] && (
                                        <p className="text-red-500 text-sm -mt-2 mb-3">{errors[field as keyof ValidationErrors]}</p>
                                    )}
                                </div>
                            ))}

                            <button
                                type="submit"
                                className="w-full bg-[#0B1437] text-white py-3 rounded-lg hover:opacity-90"
                            >
                                Confirm
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;
