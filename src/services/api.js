import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Authentication
export const login = (username, password) => api.post('/login', { username, password });
export const logout = () => api.post('/logout');
export const getMe = () => api.get('/me');


// Departments
export const getDepartments = () => api.get('/departments');
export const createDepartment = (data) => api.post('/departments', data);
export const updateDepartment = (id, data) => api.put(`/departments/${id}`, data);
export const deleteDepartment = (id) => api.delete(`/departments/${id}`);

// Employees
export const getEmployees = (params) => api.get('/employees', { params });
export const getEmployee = (id) => api.get(`/employees/${id}`);
export const createEmployee = (data) => api.post('/employees', data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

// Contracts
export const getContracts = (params) => api.get('/contracts', { params });
export const createContract = (data) => api.post('/contracts', data);
export const updateContract = (id, data) => api.put(`/contracts/${id}`, data);
export const deleteContract = (id) => api.delete(`/contracts/${id}`);

// Projects
export const getProjects = () => api.get('/projects');
export const getProject = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);
export const assignEmployee = (projectId, data) => api.post(`/projects/${projectId}/assign`, data);
export const removeEmployee = (projectId, employeeId) => api.delete(`/projects/${projectId}/remove/${employeeId}`);

// Certificate Types
export const getCertificateTypes = () => api.get('/certificate-types');
export const createCertificateType = (data) => api.post('/certificate-types', data);
export const updateCertificateType = (id, data) => api.put(`/certificate-types/${id}`, data);
export const deleteCertificateType = (id) => api.delete(`/certificate-types/${id}`);

// Certificates (QUAN TRỌNG NHẤT)
export const getCertificates = (params) => api.get('/certificates', { params });
export const getCertificate = (id) => api.get(`/certificates/${id}`);
export const createCertificate = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
        }
    });
    return api.post('/certificates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
export const updateCertificate = (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
        }
    });
    return api.post(`/certificates/${id}?_method=PUT`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
export const deleteCertificate = (id) => api.delete(`/certificates/${id}`);
export const getCertificatesByEmployee = (employeeId) => api.get(`/certificates/employee/${employeeId}`);
export const getCertificatesByType = (typeId) => api.get(`/certificates/type/${typeId}`);
export const getExpiringCertificates = () => api.get('/certificates/expiring/list');
export const getExpiredCertificates = () => api.get('/certificates/expired/list');

export default api;
