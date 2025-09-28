// pages/notes/upload.js
import { useState } from 'react';
import Head from 'next/head';

export default function UploadNote() {
  const [form, setForm] = useState({ title: '', description: '', subject_id: '' });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return setMessage('❌ You must be logged in.');

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('subject_id', form.subject_id);
    if (file) formData.append('file', file);

    try {
      const res = await fetch('http://localhost:4000/notes/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Note uploaded successfully!');
      } else {
        setMessage(`❌ ${data.error || 'Upload failed'}`);
      }
    } catch (err) {
      setMessage('❌ Network error');
    }
  };

  return (
    <>
      <Head><title>Upload Note | Free Module</title></Head>
      <div className="container" style={{ maxWidth: '500px', margin: '3rem auto' }}>
        <h1>Upload a Note</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <input
            type="text"
            placeholder="Subject ID"
            value={form.subject_id}
            onChange={e => setForm({ ...form, subject_id: e.target.value })}
          />
          <input type="file" onChange={e => setFile(e.target.files[0])} />
          <button type="submit" className="btn btn-primary">Upload</button>
        </form>
        {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
      </div>
    </>
  );
}
