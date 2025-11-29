import { useState } from 'react';
import { ArrowLeft, Users, Send, Paperclip, Pin, Search } from 'lucide-react';
import { Navigation } from './Navigation';
import { Page, User } from '../App';

interface GroupsMessagingProps {
  user: User | null;
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
}

export function GroupsMessaging({ user, onNavigate, onLogout }: GroupsMessagingProps) {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'files'>('chat');

  const groups = [
    {
      id: 1,
      name: 'BSCS-3A',
      course: 'BSCS',
      members: 42,
      lastMessage: 'Anyone has the lecture slides?',
      lastMessageTime: '2 min ago',
      unread: 3,
    },
    {
      id: 2,
      name: 'Data Structures Study Group',
      course: 'BSCS',
      members: 18,
      lastMessage: 'Meeting tomorrow at 2pm',
      lastMessageTime: '1 hour ago',
      unread: 0,
    },
    {
      id: 3,
      name: 'BSIT-2C',
      course: 'BSIT',
      members: 38,
      lastMessage: 'Check the pinned files',
      lastMessageTime: '3 hours ago',
      unread: 1,
    },
    {
      id: 4,
      name: 'Web Dev Project Team',
      course: 'BSIT',
      members: 5,
      lastMessage: 'Great work everyone!',
      lastMessageTime: '1 day ago',
      unread: 0,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: 'Maria Santos',
      message: 'Good morning everyone! 👋',
      time: '9:00 AM',
      isOwn: false,
    },
    {
      id: 2,
      sender: 'You',
      message: 'Morning! Has anyone finished the algorithm assignment?',
      time: '9:05 AM',
      isOwn: true,
    },
    {
      id: 3,
      sender: 'John Cruz',
      message: 'I\'m still working on problem 3. It\'s quite challenging.',
      time: '9:08 AM',
      isOwn: false,
    },
    {
      id: 4,
      sender: 'Sarah Lee',
      message: 'I can help with that! Let me know if you need explanations.',
      time: '9:10 AM',
      isOwn: false,
    },
    {
      id: 5,
      sender: 'You',
      message: 'That would be great! Can you explain the approach for the dynamic programming problem?',
      time: '9:12 AM',
      isOwn: true,
    },
  ];

  const pinnedFiles = [
    { name: 'Course Syllabus.pdf', uploadedBy: 'Instructor', date: 'Oct 15' },
    { name: 'Midterm Exam Schedule.docx', uploadedBy: 'Class Rep', date: 'Nov 10' },
    { name: 'Project Guidelines.pdf', uploadedBy: 'Instructor', date: 'Nov 15' },
  ];

  const announcements = [
    { title: 'Midterm Exam Schedule', content: 'Midterms will be held on November 25-29', date: 'Nov 18' },
    { title: 'Project Deadline Extended', content: 'Final project deadline moved to December 10', date: 'Nov 17' },
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;
    // Mock send
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="groups" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <h1 className="text-gray-900 mb-8">Groups & Messaging</h1>

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-250px)]">
          {/* Groups List */}
          <div className="col-span-12 md:col-span-4 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search groups..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto h-full">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className={`w-full p-4 text-left border-b hover:bg-gray-50 transition-colors ${
                    selectedGroup === group.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900 truncate">{group.name}</h3>
                        <p className="text-gray-500">{group.members} members</p>
                      </div>
                    </div>
                    {group.unread > 0 && (
                      <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        {group.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 truncate">{group.lastMessage}</p>
                  <p className="text-gray-400 mt-1">{group.lastMessageTime}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-span-12 md:col-span-8 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
            {selectedGroup ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-gray-900">{groups.find(g => g.id === selectedGroup)?.name}</h2>
                      <p className="text-gray-500">
                        {groups.find(g => g.id === selectedGroup)?.members} members
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab('chat')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          activeTab === 'chat'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Chat
                      </button>
                      <button
                        onClick={() => setActiveTab('files')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          activeTab === 'files'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Files
                      </button>
                    </div>
                  </div>
                </div>

                {activeTab === 'chat' ? (
                  <>
                    {/* Announcements */}
                    <div className="p-4 bg-yellow-50 border-b">
                      <div className="flex items-center gap-2 mb-2">
                        <Pin className="w-5 h-5 text-yellow-600" />
                        <span className="text-yellow-800">Pinned Announcements</span>
                      </div>
                      {announcements.slice(0, 1).map((announcement, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 mt-2">
                          <h4 className="text-gray-900 mb-1">{announcement.title}</h4>
                          <p className="text-gray-600">{announcement.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${msg.isOwn ? 'order-2' : ''}`}>
                            {!msg.isOwn && (
                              <p className="text-gray-600 mb-1">{msg.sender}</p>
                            )}
                            <div
                              className={`rounded-xl px-4 py-3 ${
                                msg.isOwn
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p>{msg.message}</p>
                            </div>
                            <p className="text-gray-400 mt-1">{msg.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <button className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Paperclip className="w-5 h-5" />
                        </button>
                        <input
                          type="text"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={handleSendMessage}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Files Tab */
                  <div className="flex-1 overflow-y-auto p-6">
                    <h3 className="text-gray-900 mb-4">Pinned Files</h3>
                    <div className="space-y-3">
                      {pinnedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div>
                            <h4 className="text-gray-900 mb-1">{file.name}</h4>
                            <p className="text-gray-500">
                              {file.uploadedBy} · {file.date}
                            </p>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>

                    <h3 className="text-gray-900 mt-8 mb-4">All Files</h3>
                    <p className="text-gray-500">No additional files uploaded yet.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Select a group to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
