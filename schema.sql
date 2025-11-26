-- USERS
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- COURSES
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(200) NOT NULL
);

-- SUBJECTS
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    subject_name VARCHAR(200) NOT NULL,
    CONSTRAINT uq_course_subject UNIQUE (course_id, subject_name)

);

-- NOTES
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_url TEXT, -- nullable now
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RATINGS (numeric 1–5)
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    note_id INT REFERENCES notes(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (note_id, user_id)
);

-- COMMENTS
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    note_id INT REFERENCES notes(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EXPERIENCE WALL
CREATE TABLE IF NOT EXISTS experience_posts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200),
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FRESHMAN SURVIVAL GUIDE
CREATE TABLE IF NOT EXISTS survival_guides (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ASK UPPERCLASSMEN (Q&A)
CREATE TABLE IF NOT EXISTS qa_posts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS qa_answers (
    id SERIAL PRIMARY KEY,
    qa_post_id INT REFERENCES qa_posts(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_subject_id ON notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_notes_upload_date ON notes(upload_date);
CREATE INDEX IF NOT EXISTS idx_comments_note_id ON comments(note_id);
