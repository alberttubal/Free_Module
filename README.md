Free Module
A Node.js + Next.js full-stack project designed to simulate a student hub platform. It provides backend APIs for authentication, notes sharing, courses/subjects, ratings, comments, Q&A, survival guides, and an experience wall, alongside a Next.js frontend for interaction.

🚀 Features
Authentication: JWT-based login, registration, and user management.

Notes Sharing: Upload study notes (PDF/DOC/PPT), view, comment, and rate.

Courses & Subjects: Structured course and subject management.

Experience Wall: Post and view experiences with optional images.

Q&A: Ask questions and provide answers (Ask Upperclassmen).

Survival Guides: Read-only guides for freshmen.

Comments & Ratings: Engage with notes through comments and ratings.

Security: Input validation, sanitization, rate limiting, and Helmet headers.

🛠️ Tech Stack
Backend: Node.js, Express, PostgreSQL

Frontend: Next.js (React, Tailwind CSS)

Middleware: JWT auth, validators, rate limiters

Utilities: Multer (file uploads), XSS sanitization

Languages: TypeScript, JavaScript, CSS, HTML

⚙️ Setup Instructions
Prerequisites
Node.js v18+ (LTS recommended)
npm or yarn
PostgreSQL database

Installation
git clone https://github.com/alberttubal/Free_Module.git
cd Free_Module
npm install

Backend Simulation
cd backend
node server.js

Frontend Simulation
cd frontend
npm run dev

🌐 Environment Variables
Create a .env file in the backend directory:
PORT=4000
JWT_SECRET=your_random_32_byte_secret
CORS_ORIGIN=http://localhost:4000
DATABASE_URL=postgres://postgres:password@localhost:5432/free_module
NODE_ENV=development
DB_SSL=false

Frontend uses:
NEXT_PUBLIC_API_URL=http://localhost:4000/api

📖 API Endpoints
Auth
POST /auth/register

POST /auth/login

GET /users/me

PUT /users/me

DELETE /users/me

Notes
POST /notes/upload

GET /notes

POST /notes/:id/rate

GET /notes/:id/comments

POST /notes/:id/comments

DELETE /notes/:id/comments/:commentId

Courses & Subjects
GET /courses

GET /subjects

GET /subjects/course/:course_id

Experience Wall
POST /experience

GET /experience

GET /experience/:id

PUT /experience/:id

DELETE /experience/:id

Q&A
POST /qa

GET /qa

PUT /qa/:id

DELETE /qa/:id

POST /qa/:postId/answers

GET /qa/:postId/answers

Survival Guides
GET /survival

GET /survival/:id

🧪 Development Notes
Line endings: Use LF consistently (.gitattributes enforces this).

Validation: Client-side validation should mirror backend rules.

Uploads: Max file size 20MB.

Error format:
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": []
  }
}
