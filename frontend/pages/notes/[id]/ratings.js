// pages/notes/[id]/ratings.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function RatingsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [ratings, setRatings] = useState([]);
  const [newRating, setNewRating] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:4000/ratings?note_id=${id}`)
      .then(res => res.json())
      .then(data => setRatings(data));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return setMessage('❌ You must be logged in.');

    const res = await fetch('http://localhost:4000/ratings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ note_id: id, rating: parseInt(newRating) }),
    });
    const data = await res.json();
    if (res.ok) {
      setRatings([...ratings, data]);
      setMessage('✅ Rating added!');
    } else {
      setMessage(`❌ ${data.error}`);
    }
  };

  return (
    <>
      <Head><title>Ratings | Free Module</title></Head>
      <div className="container">
        <h1>Ratings for Note {id}</h1>
        <ul>
          {ratings.map(r => (
            <li key={r.id}>⭐ {r.rating}</li>
          ))}
        </ul>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            min="1"
            max="5"
            value={newRating}
            onChange={e => setNewRating(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">Rate</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </>
  );
}
