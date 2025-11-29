import { useState } from 'react';
import { ArrowLeft, Upload, TrendingUp, FileText, Award, Settings, Mail, Bell, Shield, HelpCircle, Edit2 } from 'lucide-react';
import { Navigation } from './Navigation';
import { Page, User } from '../App';

interface ProfileProps {
  user: User | null;
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
}

export function Profile({ user, onNavigate, onLogout }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'uploads' | 'settings'>('overview');

  const stats = {
    uploads: 24,
    upvotes: 186,
    downloads: 1247,
    helpfulAnswers: 12,
  };

  const badges = [
    { name: 'Verified Contributor', icon: '✓', color: 'bg-blue-100 text-blue-600', earned: true },
    { name: 'Top Helper', icon: '🏆', color: 'bg-yellow-100 text-yellow-600', earned: true },
    { name: 'Early Adopter', icon: '🚀', color: 'bg-purple-100 text-purple-600', earned: true },
    { name: '100 Upvotes', icon: '⬆️', color: 'bg-green-100 text-green-600', earned: true },
    { name: 'Community Leader', icon: '👑', color: 'bg-orange-100 text-orange-600', earned: false },
    { name: 'Expert', icon: '🎓', color: 'bg-red-100 text-red-600', earned: false },
  ];

  const recentUploads = [
    { title: 'Data Structures Finals Reviewer', subject: 'Data Structures', date: 'Nov 18, 2024', upvotes: 42, downloads: 156 },
    { title: 'Algorithm Analysis Notes', subject: 'Algorithms', date: 'Nov 15, 2024', upvotes: 38, downloads: 142 },
    { title: 'Web Dev Project Template', subject: 'Web Development', date: 'Nov 12, 2024', upvotes: 54, downloads: 178 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="profile" onNavigate={onNavigate} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-start gap-6 mb-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-4xl">
                  {user?.fullName?.charAt(0) || 'U'}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-50 transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="mb-2">{user?.fullName || 'Student Name'}</h1>
              <p className="text-blue-100 mb-1">
                <Mail className="w-4 h-4 inline mr-2" />
                {user?.email || 'student@ustp.edu.ph'}
              </p>
              <p className="text-blue-100">
                {user?.course || 'BSCS'} · {user?.year || '3rd Year'}
              </p>
            </div>

            <button className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              Edit Profile
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-5 h-5" />
                <p className="text-blue-100">Uploads</p>
              </div>
              <p className="text-white text-2xl">{stats.uploads}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <p className="text-blue-100">Upvotes</p>
              </div>
              <p className="text-white text-2xl">{stats.upvotes}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5" />
                <p className="text-blue-100">Downloads</p>
              </div>
              <p className="text-white text-2xl">{stats.downloads}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5" />
                <p className="text-blue-100">Helpful Answers</p>
              </div>
              <p className="text-white text-2xl">{stats.helpfulAnswers}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('uploads')}
            className={`px-6 py-3 rounded-lg transition-colors ${
              activeTab === 'uploads'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-white'
            }`}
          >
            My Uploads
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-lg transition-colors ${
              activeTab === 'settings'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-white'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Badges */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-gray-900 mb-6">Badges & Achievements</h2>
              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl ${
                      badge.earned ? badge.color : 'bg-gray-100 text-gray-400'
                    } ${!badge.earned && 'opacity-50'}`}
                  >
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <p className={badge.earned ? '' : 'text-gray-500'}>{badge.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3 pb-4 border-b">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 mb-1">Uploaded a new file</p>
                    <p className="text-gray-500">Data Structures Finals Reviewer</p>
                    <p className="text-gray-400 mt-1">2 days ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-4 border-b">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 mb-1">Answer marked as helpful</p>
                    <p className="text-gray-500">BST implementation question</p>
                    <p className="text-gray-400 mt-1">3 days ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 mb-1">Reached 100 upvotes milestone</p>
                    <p className="text-gray-500">Earned new badge</p>
                    <p className="text-gray-400 mt-1">5 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'uploads' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-gray-900 mb-6">My Uploads</h2>
            <div className="space-y-4">
              {recentUploads.map((upload, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-2">{upload.title}</h3>
                    <div className="flex items-center gap-4 text-gray-500">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg">
                        {upload.subject}
                      </span>
                      <span>{upload.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-gray-500">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span>{upload.upvotes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{upload.downloads}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notifications */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="w-6 h-6 text-gray-700" />
                <h2 className="text-gray-900">Notifications</h2>
              </div>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">New uploads in my courses</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Replies to my questions</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Group messages</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Weekly digest email</span>
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                </label>
              </div>
            </div>

            {/* Privacy */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-6 h-6 text-gray-700" />
                <h2 className="text-gray-900">Privacy</h2>
              </div>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Show my profile to others</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Allow direct messages</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Show my uploads count</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                </label>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <HelpCircle className="w-6 h-6 text-gray-700" />
                <h2 className="text-gray-900">Help & Support</h2>
              </div>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  FAQ & Help Center
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  Report a Problem
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  Contact Support
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  Terms & Policies
                </button>
              </div>
            </div>

            {/* Account */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-6 h-6 text-gray-700" />
                <h2 className="text-gray-900">Account</h2>
              </div>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  Change Password
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  Email Preferences
                </button>
                <button className="w-full text-left px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
