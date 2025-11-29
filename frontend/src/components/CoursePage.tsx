import { useState } from 'react';
import { ArrowLeft, BookOpen, FileText, Users, TrendingUp } from 'lucide-react';
import { Navigation } from './Navigation';
import { Page } from '../App';

interface CoursePageProps {
  course: string;
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
}

export function CoursePage({ course, onNavigate, onLogout }: CoursePageProps) {
  const years = [
    { level: '1st Year', subjects: 12, files: 248 },
    { level: '2nd Year', subjects: 14, files: 312 },
    { level: '3rd Year', subjects: 13, files: 425 },
    { level: '4th Year', subjects: 10, files: 189 },
  ];

  const subjects = {
    '1st Year': [
      { name: 'Introduction to Computing', icon: '💻', files: 45, trending: true },
      { name: 'Calculus 1', icon: '📐', files: 38, trending: false },
      { name: 'Physics for Engineers', icon: '⚡', files: 32, trending: true },
      { name: 'Discrete Mathematics', icon: '🔢', files: 41, trending: false },
      { name: 'English Communication', icon: '📝', files: 28, trending: false },
      { name: 'Programming 1', icon: '⌨️', files: 64, trending: true },
    ],
    '2nd Year': [
      { name: 'Data Structures', icon: '🗂️', files: 58, trending: true },
      { name: 'Object-Oriented Programming', icon: '🎯', files: 52, trending: true },
      { name: 'Database Systems', icon: '🗄️', files: 46, trending: false },
      { name: 'Web Development', icon: '🌐', files: 61, trending: true },
    ],
    '3rd Year': [
      { name: 'Software Engineering', icon: '⚙️', files: 72, trending: true },
      { name: 'Computer Networks', icon: '🌐', files: 54, trending: false },
      { name: 'Algorithm Analysis', icon: '🧮', files: 48, trending: true },
      { name: 'Operating Systems', icon: '💾', files: 56, trending: false },
    ],
    '4th Year': [
      { name: 'Capstone Project', icon: '🎓', files: 34, trending: true },
      { name: 'Machine Learning', icon: '🤖', files: 42, trending: true },
      { name: 'Cybersecurity', icon: '🔒', files: 38, trending: false },
      { name: 'Mobile Development', icon: '📱', files: 45, trending: true },
    ],
  };

  const [selectedYear, setSelectedYear] = useState<string>('1st Year');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="course" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <button 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Course Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="mb-2">{course}</h1>
              <p className="text-blue-100">
                {course === 'BSCS' && 'Computer Science'}
                {course === 'BSIT' && 'Information Technology'}
                {course === 'BSEE' && 'Electrical Engineering'}
                {course === 'BSCE' && 'Civil Engineering'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-blue-100 mb-1">Total Files</p>
              <p className="text-white">1,174</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-blue-100 mb-1">Contributors</p>
              <p className="text-white">284</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-blue-100 mb-1">Active Groups</p>
              <p className="text-white">18</p>
            </div>
          </div>
        </div>

        {/* Year Filters */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {years.map((year) => (
            <button
              key={year.level}
              onClick={() => setSelectedYear(year.level)}
              className={`px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
                selectedYear === year.level
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{year.level}</span>
                <span className={`${
                  selectedYear === year.level ? 'text-blue-200' : 'text-gray-500'
                }`}>
                  · {year.files} files
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Subject Cards */}
        <div>
          <h2 className="text-gray-900 mb-6">{selectedYear} Subjects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects[selectedYear as keyof typeof subjects]?.map((subject, index) => (
              <button
                key={index}
                onClick={() => onNavigate('library')}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{subject.icon}</div>
                  {subject.trending && (
                    <div className="flex items-center gap-1 text-orange-500 bg-orange-50 px-2 py-1 rounded-lg">
                      <TrendingUp className="w-4 h-4" />
                      <span>Trending</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {subject.name}
                </h3>
                
                <div className="flex items-center gap-4 text-gray-500">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{subject.files} files</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{Math.floor(subject.files / 3)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}