// pages/notes/[id]/comments.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function CommentsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:4000/comments?note_id=${id}`)
      .then(res => res.json())
      .then(data => setComments(data));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return setMessage('❌ You must be logged in.');

    const res = await fetch('http://localhost:4000/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ note_id: id, comment_text: newComment }),
    });
    const data = await res.json();
    if (res.ok) {
      setComments([...comments, data]);
      setMessage('✅ Comment added!');
      setNewComment('');
    } else {
      setMessage(`❌ ${data.error}`);
    }
  };

  return (
    <>
      <Head><title>Comments | Free Module</title></Head>
      <div className="container">
        <h1>Comments for Note {id}</h1>
        <ul>
          {comments.map(c => (
            <li key={c.id}>{c.comment_text}</li>
          ))}
        </ul>
        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">Comment</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </>
  );
}
