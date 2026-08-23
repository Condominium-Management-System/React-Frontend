// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../api/axiosConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isCondoAdmin, setIsCondoAdmin] = useState(false);
  const [isResident, setIsResident] = useState(false);
  const [isGuard, setIsGuard] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    console.log('🔍 Checking stored user:', storedUser);
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('📦 Stored user data:', userData);
        console.log('👤 Stored user role:', userData.role);
        
        setUser(userData);
        setIsSuperAdmin(userData.role === 'super_admin');
        setIsCondoAdmin(userData.role === 'condo_admin');
        setIsResident(userData.role === 'resident');
        setIsGuard(userData.role === 'guard');
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      console.log('🔐 Login attempt with:', credentials.email);
      
      const response = await api.auth.login(credentials);
      console.log('📥 Login response:', response.data);
      
      const { accessToken, user: userData } = response.data.data;
      
      console.log('👤 User role from API:', userData.role);
      
      // Store both token and user in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setIsSuperAdmin(userData.role === 'super_admin');
      setIsCondoAdmin(userData.role === 'condo_admin');
      setIsResident(userData.role === 'resident');
      setIsGuard(userData.role === 'guard');
      
      console.log('✅ Login successful. Role:', userData.role);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Login error:', error);
      
      let message = 'Login failed. Please check your credentials.';
      
      if (error.response) {
        console.error('Response error:', error.response.data);
        message = error.response.data?.message || message;
      } else if (error.request) {
        console.error('No response:', error.request);
        message = 'Server is not responding. Please try again later.';
      }
      
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsSuperAdmin(false);
    setIsCondoAdmin(false);
    setIsResident(false);
    setIsGuard(false);
  };

  const value = {
    user,
    loading,
    isSuperAdmin,
    isCondoAdmin,
    isResident,
    isGuard,
    login,
    logout,
    isAuthenticated: !!user,
  };

  console.log('📊 Auth State:', { 
    user: user?.fullName, 
    role: user?.role, 
    isAuthenticated: !!user,
    isSuperAdmin,
    isCondoAdmin 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};