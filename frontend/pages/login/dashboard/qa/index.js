// pages/qa/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function QAPage() {
  const [posts, setPosts] = useState([]);
  const [question, setQuestion] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/qa/posts')
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return setMessage('❌ You must be logged in.');

    const res = await fetch('http://localhost:4000/qa/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    if (res.ok) {
      setPosts([data, ...posts]);
      setQuestion('');
    } else {
      setMessage(`❌ ${data.error}`);
    }
  };

  return (
    <>
      <Head><title>Q&A | Free Module</title></Head>
      <div className="container">
        <h1>Ask Upperclassmen</h1>
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <textarea
            placeholder="Ask a question..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">Post Question</button>
        </form>
        <ul>
          {posts.map(p => (
            <li key={p.id}>
              <a href={`/qa/${p.id}`}>{p.question}</a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
