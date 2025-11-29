import { useState } from 'react';
import { ArrowLeft, Download, TrendingUp, Clock, Filter, FileText, Image, Presentation, FileSpreadsheet } from 'lucide-react';
import { Navigation } from './Navigation';
import { Page } from '../App';

interface ResourceLibraryProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
}

export function ResourceLibrary({ onNavigate, onLogout }: ResourceLibraryProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'trending' | 'downloads'>('recent');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  const files = [
    {
      title: 'Data Structures Finals Reviewer',
      type: 'pdf',
      course: 'BSCS',
      year: '2nd Year',
      subject: 'Data Structures',
      uploader: 'Maria Santos',
      date: '2024-11-18',
      downloads: 156,
      upvotes: 42,
      tags: ['Finals', 'Reviewer', 'Trees', 'Graphs'],
    },
    {
      title: 'Circuit Analysis Lab Manual',
      type: 'pdf',
      course: 'BSEE',
      year: '2nd Year',
      subject: 'Circuit Analysis',
      uploader: 'Anonymous',
      date: '2024-11-17',
      downloads: 98,
      upvotes: 28,
      tags: ['Laboratory', 'Circuits', 'Analysis'],
    },
    {
      title: 'Database Design PPT',
      type: 'ppt',
      course: 'BSIT',
      year: '2nd Year',
      subject: 'Database Systems',
      uploader: 'John Cruz',
      date: '2024-11-16',
      downloads: 234,
      upvotes: 67,
      tags: ['Presentation', 'ER Diagram', 'Normalization'],
    },
    {
      title: 'Calculus 2 Problem Sets',
      type: 'docx',
      course: 'BSCS',
      year: '1st Year',
      subject: 'Calculus 2',
      uploader: 'Anonymous',
      date: '2024-11-15',
      downloads: 312,
      upvotes: 89,
      tags: ['Problem Sets', 'Solutions', 'Integration'],
    },
    {
      title: 'Web Dev Project Template',
      type: 'zip',
      course: 'BSIT',
      year: '2nd Year',
      subject: 'Web Development',
      uploader: 'Sarah Lee',
      date: '2024-11-14',
      downloads: 178,
      upvotes: 54,
      tags: ['Template', 'HTML', 'CSS', 'JavaScript'],
    },
    {
      title: 'Algorithm Analysis Notes',
      type: 'pdf',
      course: 'BSCS',
      year: '3rd Year',
      subject: 'Algorithm Analysis',
      uploader: 'Mark Reyes',
      date: '2024-11-13',
      downloads: 145,
      upvotes: 38,
      tags: ['Notes', 'Big O', 'Sorting'],
    },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'ppt':
        return <Presentation className="w-8 h-8 text-orange-500" />;
      case 'docx':
        return <FileText className="w-8 h-8 text-blue-500" />;
      case 'xlsx':
        return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
      case 'zip':
        return <FileText className="w-8 h-8 text-gray-500" />;
      default:
        return <Image className="w-8 h-8 text-purple-500" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="library" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <button 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <h1 className="text-gray-900 mb-8">Resource Library</h1>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-gray-900">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>All</option>
                <option>BSCS</option>
                <option>BSIT</option>
                <option>BSEE</option>
                <option>BSCE</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Year Level</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>All</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="trending">Trending</option>
                <option value="downloads">Most Downloads</option>
              </select>
            </div>
          </div>
        </div>

        {/* File List */}
        <div className="space-y-4">
          {files.map((file, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-6">
                {/* File Icon */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center">
                    {getFileIcon(file.type)}
                  </div>
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 mb-2">{file.title}</h3>
                  
                  <div className="flex flex-wrap items-center gap-3 text-gray-500 mb-3">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg">
                      {file.course}
                    </span>
                    <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg">
                      {file.year}
                    </span>
                    <span>{file.subject}</span>
                    <span>·</span>
                    <span>{file.uploader}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(file.date)}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {file.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-3">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  
                  <div className="flex items-center gap-4 text-gray-500">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span>{file.upvotes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{file.downloads}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
