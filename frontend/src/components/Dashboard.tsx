import { Search, Upload, MessageSquarePlus, Users, TrendingUp, Clock, BookOpen } from 'lucide-react';
import { Navigation } from './Navigation';
import { Page, User } from '../App';

interface DashboardProps {
  user: User | null;
  onNavigate: (page: Page) => void;
  onCourseSelect: (course: string) => void;
  onLogout?: () => void;
}

export function Dashboard({ user, onNavigate, onCourseSelect, onLogout }: DashboardProps) {
  const courses = [
    { code: 'BSIT', name: 'Information Technology', color: 'from-blue-500 to-blue-600' },
    { code: 'BSCS', name: 'Computer Science', color: 'from-purple-500 to-purple-600' },
    { code: 'BSEE', name: 'Electrical Engineering', color: 'from-yellow-500 to-yellow-600' },
    { code: 'BSCE', name: 'Civil Engineering', color: 'from-green-500 to-green-600' },
    { code: 'BSME', name: 'Mechanical Engineering', color: 'from-red-500 to-red-600' },
    { code: 'BSIE', name: 'Industrial Engineering', color: 'from-orange-500 to-orange-600' },
    { code: 'BSArch', name: 'Architecture', color: 'from-indigo-500 to-indigo-600' },
    { code: 'BSCpE', name: 'Computer Engineering', color: 'from-pink-500 to-pink-600' },
  ];

  const recentUploads = [
    { title: 'Data Structures Finals Reviewer', course: 'BSCS', subject: 'Data Structures', uploader: 'Maria Santos', time: '2 hours ago', upvotes: 24 },
    { title: 'Circuit Analysis Lecture Notes', course: 'BSEE', subject: 'Circuit Analysis', uploader: 'Anonymous', time: '5 hours ago', upvotes: 18 },
    { title: 'Database Design Project Template', course: 'BSIT', subject: 'Database Systems', uploader: 'John Cruz', time: '1 day ago', upvotes: 32 },
    { title: 'Calculus 2 Problem Sets with Solutions', course: 'BSCS', subject: 'Calculus 2', uploader: 'Anonymous', time: '1 day ago', upvotes: 45 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 text-white">
          <h1 className="mb-2">Welcome back, {user?.fullName || 'Student'}! 👋</h1>
          <p className="text-blue-100 mb-6">
            {user?.course} · {user?.year}
          </p>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search files, notes, questions..."
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-900 mb-1">Upload Notes</h3>
              <p className="text-gray-500">Share your study materials</p>
            </div>
          </button>

          <button 
            onClick={() => onNavigate('qa')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquarePlus className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-gray-900 mb-1">Ask a Question</h3>
              <p className="text-gray-500">Get help from peers</p>
            </div>
          </button>

          <button 
            onClick={() => onNavigate('groups')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-gray-900 mb-1">Join Group</h3>
              <p className="text-gray-500">Connect with classmates</p>
            </div>
          </button>
        </div>

        {/* Courses Section */}
        <div className="mb-8">
          <h2 className="text-gray-900 mb-6">Browse by Course</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {courses.map((course) => (
              <button
                key={course.code}
                onClick={() => onCourseSelect(course.code)}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${course.color} rounded-xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-gray-900 mb-1">{course.code}</h3>
                <p className="text-gray-500">{course.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Uploads Feed */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900">Latest Uploads</h2>
            <button 
              onClick={() => onNavigate('library')}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All
              <TrendingUp className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {recentUploads.map((upload, index) => (
              <div key={index} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-2">{upload.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-gray-500">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg">
                        {upload.course}
                      </span>
                      <span>{upload.subject}</span>
                      <span>·</span>
                      <span>{upload.uploader}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {upload.time}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <TrendingUp className="w-5 h-5" />
                    <span>{upload.upvotes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
