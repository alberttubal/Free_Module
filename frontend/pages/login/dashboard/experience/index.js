// pages/experience/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function ExperienceWall() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', image_url: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/experience')
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return setMessage('❌ You must be logged in.');

    const res = await fetch('http://localhost:4000/experience', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setPosts([data, ...posts]);
      setForm({ title: '', content: '', image_url: '' });
    } else {
      setMessage(`❌ ${data.error}`);
    }
  };

  return (
    <>
      <Head><title>Experience Wall | Free Module</title></Head>
      <div className="container">
        <h1>Experience Wall</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            placeholder="Share your experience..."
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
          />
          <input
            type="text"
            placeholder="Optional image URL"
            value={form.image_url}
            onChange={e => setForm({ ...form, image_url: e.target.value })}
          />
          <button type="submit" className="btn btn-primary">Post</button>
        </form>

        {posts.map(p => (
          <div key={p.id} className="card" style={{ marginBottom: '1rem' }}>
            <div>
              <h3>{p.title}</h3>
              <p>{p.content}</p>
              {p.image_url && <img src={p.image_url} alt="" style={{ maxWidth: '100%' }} />}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
