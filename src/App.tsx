import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import Dashboard from './Dashboard';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';
import AdminRoute from './components/auth/AdminRoute';
import UserRoute from './components/auth/UserRoute';
import OrganizationRoute from './components/auth/OrganizationRoute';
import AdminDashboard from './components/dashboard/AdminDashboard';
import AdminUsers from './components/dashboard/AdminUsers';
import AdminOrganizations from './components/dashboard/AdminOrganizations';
import OrganizationDashboard from './components/dashboard/OrganizationDashboard';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/login" element={<LoginForm />} />
                <Route
                    path="/dashboard"
                    element={
                        <UserRoute>
                            <Dashboard />
                        </UserRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <UserRoute>
                            <Dashboard />
                        </UserRoute>
                    }
                />
                <Route
                    path="/favorites"
                    element={
                        <UserRoute>
                            <Dashboard />
                        </UserRoute>
                    }
                />
                <Route
                    path="/tests"
                    element={
                        <UserRoute>
                            <Dashboard />
                        </UserRoute>
                    }
                />
                <Route
                    path="/certifications"
                    element={
                        <UserRoute>
                            <Dashboard />
                        </UserRoute>
                    }
                />
                <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <AdminRoute>
                            <AdminUsers />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/organizations"
                    element={
                        <AdminRoute>
                            <AdminOrganizations />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/organization"
                    element={
                        <OrganizationRoute>
                            <OrganizationDashboard />
                        </OrganizationRoute>
                    }
                />
                <Route
                    path="/organization/candidates"
                    element={
                        <OrganizationRoute>
                            <OrganizationDashboard />
                        </OrganizationRoute>
                    }
                />
                <Route
                    path="/organization/hired"
                    element={
                        <OrganizationRoute>
                            <OrganizationDashboard />
                        </OrganizationRoute>
                    }
                />
                <Route
                    path="/organization/settings"
                    element={
                        <OrganizationRoute>
                            <OrganizationDashboard />
                        </OrganizationRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
