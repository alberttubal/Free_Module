// pages/guides/index.js
import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function GuidesPage() {
  const [guides, setGuides] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/guides')
      .then(res => res.json())
      .then(data => setGuides(data));
  }, []);

  return (
    <>
      <Head><title>Freshman Survival Guide | Free Module</title></Head>
      <div className="container">
        <h1>Freshman Survival Guide</h1>
        {guides.map(g => (
          <div key={g.id} className="card" style={{ marginBottom: '1rem' }}>
            <h3>{g.title}</h3>
            <p>{g.content}</p>
          </div>
        ))}
      </div>
    </>
  );
}
