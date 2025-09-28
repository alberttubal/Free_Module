// pages/notes/index.js
import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/notes')
      .then(res => res.json())
      .then(data => setNotes(data))
      .catch(() => setNotes([]));
  }, []);

  return (
    <>
      <Head><title>Notes | Free Module</title></Head>
      <div className="container">
        <h1>Academic Notes</h1>
        <a href="/notes/upload" className="btn btn-primary">Upload a Note</a>
        <ul style={{ marginTop: '1.5rem' }}>
          {notes.map(note => (
            <li key={note.id} style={{ marginBottom: '1rem' }}>
              <h3>{note.title}</h3>
              <p>{note.description}</p>
              {note.file_url && <a href={note.file_url} target="_blank">Download</a>}
              <div>
                <a href={`/notes/${note.id}/ratings`}>Ratings</a> |{" "}
                <a href={`/notes/${note.id}/comments`}>Comments</a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
