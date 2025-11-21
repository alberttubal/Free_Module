// pages/index.js
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Free Module @ USTP</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Nunito+Sans:wght@400;600&display=swap" rel="stylesheet" />
      </Head>

      {/* HERO */}
      <header className="hero">
        <h1>Welcome to Free Module</h1>
        <p>Where Trailblazers pass on knowledge.</p>
        <div className="btn-group">
          <a href="/notes" className="btn btn-primary">Explore Modules</a>
          <a href="/experience" className="btn btn-outline">Share Your Experience</a>
        </div>
      </header>

      {/* FEATURES */}
      <section id="features" className="container" aria-labelledby="features-heading">
        <h2 id="features-heading">Features Overview</h2>
        <div className="features">
          <article className="card">
            <div className="card-icon">📁</div>
            <div>
              <h4>Upload & Share Academic Files</h4>
              <p>Organize lecture notes, past exams, and resources.</p>
            </div>
          </article>
          <article className="card">
            <div className="card-icon">⭐</div>
            <div>
              <h4>Ratings & Feedback</h4>
              <p>Rate and review notes for quality and accuracy.</p>
            </div>
          </article>
          <article className="card">
            <div className="card-icon">💬</div>
            <div>
              <h4>Comments on Notes</h4>
              <p>Discuss materials with classmates and mentors.</p>
            </div>
          </article>
          <article className="card">
            <div className="card-icon">📝</div>
            <div>
              <h4>Experience Wall</h4>
              <p>Share stories and advice with the community.</p>
            </div>
          </article>
          <article className="card">
            <div className="card-icon">📖</div>
            <div>
              <h4>Freshman Survival Guide</h4>
              <p>Helpful tips to succeed at USTP.</p>
            </div>
          </article>
          <article className="card">
            <div className="card-icon">❓</div>
            <div>
              <h4>Ask Upperclassmen</h4>
              <p>Q&A forum for freshmen to ask questions.</p>
            </div>
          </article>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how container">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <p>Sign up with your USTP email.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <p>Browse or upload academic resources.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <p>Share experiences and help fellow Trailblazers.</p>
          </div>
        </div>
      </section>

      {/* INTEGRITY */}
      <div className="integrity">Academic Freedom, Academic Integrity.</div>

      {/* TESTIMONIALS */}
      <section className="testimonials container">
        <h2>What Students Say</h2>
        <div className="testimonial-grid">
          <div className="testimonial">
            <div className="avatar">A</div>
            <p className="quote">“This helped me pass my exams!”</p>
          </div>
          <div className="testimonial">
            <div className="avatar">B</div>
            <p className="quote">“I love sharing my notes with others.”</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="links">
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </div>
        <div className="disclaimer">
          © {new Date().getFullYear()} Free Module. For academic use only.
        </div>
      </footer>
    </>
  );
}
