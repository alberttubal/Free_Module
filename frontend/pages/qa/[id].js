// pages/qa/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function QADetail() {
  const router = useRouter();
  const { id } = router.query;
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:4000/qa/posts/${id}`)
      .then(res => res.json())
      .then(data => setQuestion(data));

    fetch(`http://localhost:4000/qa/answers?post_id=${id}`)
      .then(res => res.json())
      .then(data => setAnswers(data));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return setMessage('❌ You must be logged in.');

    const res = await fetch('http://localhost:4000/qa/answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ qa_post_id: id, answer: newAnswer }),
    });
    const data = await res.json();
    if (res.ok) {
      setAnswers([...answers, data]);
      setNewAnswer('');
    } else {
      setMessage(`❌ ${data.error}`);
    }
  };

  return (
    <>
      <Head><title>Q&A | Free Module</title></Head>
      <div className="container">
        {question && <h1>{question.question}</h1>}
        <h2>Answers</h2>
        <ul>
          {answers.map(a => (
            <li key={a.id}>{a.answer}</li>
          ))}
        </ul>
        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Write an answer..."
            value={newAnswer}
            onChange={e => setNewAnswer(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">Submit Answer</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </>
  );
}
