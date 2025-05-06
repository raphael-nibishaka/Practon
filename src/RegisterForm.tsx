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

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();

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
  };

  const handleNext = () => {
    const { firstname, lastname, email, password, fieldOfInterest } = formData;
    if (!firstname || !lastname || !email || !password || !fieldOfInterest) {
      toast.error('Please fill in all personal details.');
      return;
    }
    setStep(2);
  };

  const handleBack = () => setStep(1);
  const API_URL = 'http://localhost:8098';
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { street, city, state, country, postalCode } = formData.address;

    if (!street || !city || !state || !country || !postalCode) {
      toast.error('Please fill in all address details.');
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
        setTimeout(() => navigate('/login'), 1500); // optional redirect
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
        <p className="text-white text-lg mt-6">
          {step === 1 ? 'Signup with Practon' : 'Register with Practon'}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-8">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
          {step === 1 && (
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
                    placeholder={`Enter your ${field}`}
                    value={(formData as any)[field]}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}

              <div>
                <label htmlFor="fieldOfInterest" className="text-sm text-gray-600 block mb-1">
                  Field Of Interest
                </label>
                <select
                  name="fieldOfInterest"
                  value={formData.fieldOfInterest}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select field of interest</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile Apps">Mobile Apps</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Data Science">Data Science</option>
                  <option value="AI/ML">AI / Machine Learning</option>
                </select>
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
          )}

          {step === 2 && (
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
                <input
                  key={field}
                  name={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={(formData.address as any)[field]}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                />
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
