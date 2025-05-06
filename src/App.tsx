import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterForm from './RegisterForm';

import LoginForm from './LoginForm';
import Dashboard from './Dashboard';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';
import CertificationsSection from './CertificationSection';

function App() {
    return (

    <Router>
      <Routes>
        <Route path="/register" element={<RegisterForm />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Dashboard />} />
              <Route path="/favorites" element={<Dashboard />} />
              <Route path="/tests" element={<Dashboard />} />
              <Route path="/cert" element={<CertificationsSection userId={1}/>} />
              <Route path="/forgot-password" element={<ForgotPasswordForm />} />
              <Route path="/reset-password/:token" element={<ResetPasswordForm />} />

      </Routes>
    </Router>
  );
}

export default App;
