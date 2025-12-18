Free Module
A full-stack Node.js + Next.js project simulating a student hub platform. It provides backend APIs for user authentication, notes sharing, course/subject management, ratings, comments, Q&A, survival guides, and an experience wall, complemented by a Next.js frontend for seamless interaction.

🚀 Features

Authentication: JWT-based login, registration, and user management.

Notes Sharing: Upload, view, comment on, and rate study materials (PDF/DOC/PPT).

Courses & Subjects: Organize and manage courses and subjects.

Experience Wall: Share and view student experiences with optional images.

Q&A: Ask questions and receive answers (Ask Upperclassmen).

Survival Guides: Access read-only guides for freshmen.

Comments & Ratings: Engage with notes through comments and ratings.

Security: Input validation, sanitization, rate limiting, and Helmet headers for enhanced security.

🛠️ Tech Stack

Backend: Node.js, Express, PostgreSQL

Frontend: Next.js (React, Tailwind CSS)

Middleware: JWT Authentication, validators, rate limiters

Utilities: Multer (file uploads), XSS sanitization

Languages: TypeScript, JavaScript, CSS, HTML

⚙️ Setup Instructions
Prerequisites

Node.js v18+ (LTS recommended)

npm or yarn

PostgreSQL database

Installation

Clone the repository:
git clone https://github.com/alberttubal/Free_Module.git

Navigate to the project folder:
cd Free_Module

Install dependencies:
npm install

Backend Setup

Navigate to the backend directory:
cd backend

Start the server:
node server.js

Frontend Setup

Navigate to the frontend directory:
cd frontend

Start the development server:
npm run dev

🌐 Environment Variables

Create a .env file in the backend directory with the following configuration:
PORT=4000
JWT_SECRET=your_random_32_byte_secret
CORS_ORIGIN=http://localhost:4000
DATABASE_URL=postgres://postgres:password@localhost:5432/free_module
NODE_ENV=development
DB_SSL=false

PostgreSQL Database Configuration:

Password: AcadFreedom123!

Port: 5432

Database Name: free_module

Username: postgres

Frontend uses:
NEXT_PUBLIC_API_URL=http://localhost:4000/api

📖 API Endpoints
Authentication

POST /auth/register: User registration

POST /auth/login: User login

GET /users/me: Get current user details

PUT /users/me: Update current user details

DELETE /users/me: Delete user account

Notes

POST /notes/upload: Upload study notes

GET /notes: Retrieve all notes

POST /notes/:id/rate: Rate a note

GET /notes/:id/comments: View comments on a note

POST /notes/:id/comments: Add a comment to a note

DELETE /notes/:id/comments/:commentId: Delete a comment

Courses & Subjects

GET /courses: Retrieve all courses

GET /subjects: Retrieve all subjects

GET /subjects/course/:course_id: Get subjects for a specific course

Experience Wall

POST /experience: Post an experience

GET /experience: Retrieve all experiences

GET /experience/:id: Get a specific experience

PUT /experience/:id: Update an experience

DELETE /experience/:id: Delete an experience

Q&A

POST /qa: Ask a question

GET /qa: Retrieve all questions

PUT /qa/:id: Update a question

DELETE /qa/:id: Delete a question

POST /qa/:postId/answers: Provide an answer to a question

GET /qa/:postId/answers: Retrieve answers to a question

Survival Guides

GET /survival: Retrieve all survival guides

GET /survival/:id: Retrieve a specific survival guide

🧪 Development Notes

Line Endings: Use LF consistently (enforced via .gitattributes).

Validation: Ensure client-side validation matches backend rules.

Uploads: Max file size is 20MB.