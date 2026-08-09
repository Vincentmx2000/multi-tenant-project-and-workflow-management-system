import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';

const HomeDashboard = () => {
  const { user, role, company, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Multi-Tenant Project &amp; Workflow Management</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md text-sm transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">User</span>
            <p className="text-lg font-semibold text-gray-800 mt-1">{user?.name}</p>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Role</span>
            <p className="text-lg font-semibold text-gray-800 mt-1">{role}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Company ID</span>
            <p className="text-xs font-mono font-semibold text-gray-800 mt-1 truncate">{company}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomeDashboard />} />
            <Route path="/dashboard" element={<HomeDashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
