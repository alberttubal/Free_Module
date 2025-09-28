// pages/auth/login.js
import { useState } from 'react';
import Head from 'next/head';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setMessage('✅ Logged in! Redirecting...');
        // optional: redirect to notes page
        setTimeout(() => window.location.href = '/notes', 1000);
      } else {
        setMessage(`❌ ${data.error || 'Login failed'}`);
      }
    } catch (err) {
      setMessage('❌ Network error');
    }
  };

  return (
    <>
      <Head><title>Login | Free Module</title></Head>
      <div className="container" style={{ maxWidth: '400px', margin: '3rem auto' }}>
        <h1>Login</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            name="email"
            placeholder="USTP Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn btn-primary">Log In</button>
        </form>
        {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
      </div>
    </>
  );
}
