export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Course {
  id: string;
  course_code: string;
  course_name: string;
}

export interface Subject {
  id: string;
  course_id: string;
  subject_name: string;
}

export interface Note {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  description?: string;
  file_url: string;
  upload_date: string;
}

export interface Rating {
  id: string;
  note_id: string;
  user_id: string;
}

export interface Comment {
  id: string;
  note_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
}

export interface ExperiencePost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
}

export interface QAPost {
  id: string;
  user_id: string;
  question: string;
  created_at: string;
}

export interface QAAnswer {
  id: string;
  qa_post_id: string;
  user_id: string;
  answer: string;
  created_at: string;
}

export interface SurvivalGuide {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
}