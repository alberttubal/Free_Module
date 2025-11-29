import { useState, useEffect } from 'react';
import api from '../services/api';
import Router from 'next/router';


const JWT_KEY = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'auth_token';


export const useAuth = () => {
const [user, setUser] = useState(null as any);
const [loading, setLoading] = useState(true);


const fetchMe = async () => {
const token = typeof window !== 'undefined' ? localStorage.getItem(JWT_KEY) : null;
if (!token) {
setLoading(false);
setUser(null);
return;
}
try {
const res = await api.get('/users/me');
setUser(res.data);
} catch (e) {
// invalid token
localStorage.removeItem(JWT_KEY);
setUser(null);
} finally {
setLoading(false);
}
};


useEffect(() => { fetchMe(); }, []);


const login = async (email: string, password: string) => {
const res = await api.post('/auth/login', { email, password });
const token = res.data?.token;
if (!token) throw new Error('No token returned');
localStorage.setItem(JWT_KEY, token);
await fetchMe();
};


const register = async (name: string, email: string, password: string) => {
const res = await api.post('/auth/register', { name, email, password });
const token = res.data?.token;
if (!token) throw new Error('No token returned');
localStorage.setItem(JWT_KEY, token);
await fetchMe();
};


const logout = () => {
localStorage.removeItem(JWT_KEY);
setUser(null);
Router.push('/login');
};


return { user, loading, login, register, logout, refetch: fetchMe };
};