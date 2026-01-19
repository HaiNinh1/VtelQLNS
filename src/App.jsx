import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/Auth/PrivateRoute';
import Login from './components/Auth/Login';
import Layout from './components/Layout/Layout';
import EmployeeList from './components/Employees/EmployeeList';
import EmployeeDetail from './components/Employees/EmployeeDetail';
import ContractList from './components/Contracts/ContractList';
import ProjectList from './components/Projects/ProjectList';
import CertificateList from './components/Certificates/CertificateList';
import CertificateSearch from './components/Certificates/CertificateSearch';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router basename="/VtelQLNS">
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <PrivateRoute>
              <Layout>
                <Navigate to="/employees" replace />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/employees" element={
            <PrivateRoute>
              <Layout><EmployeeList /></Layout>
            </PrivateRoute>
          } />
          
          <Route path="/employees/:id" element={
            <PrivateRoute>
              <Layout><EmployeeDetail /></Layout>
            </PrivateRoute>
          } />
          
          <Route path="/contracts" element={
            <PrivateRoute>
              <Layout><ContractList /></Layout>
            </PrivateRoute>
          } />
          
          <Route path="/projects" element={
            <PrivateRoute>
              <Layout><ProjectList /></Layout>
            </PrivateRoute>
          } />
          
          <Route path="/certificates" element={
            <PrivateRoute>
              <Layout><CertificateList /></Layout>
            </PrivateRoute>
          } />
          
          <Route path="/certificates/search" element={
            <PrivateRoute>
              <Layout><CertificateSearch /></Layout>
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
