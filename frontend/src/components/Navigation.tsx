import { Home, BookOpen, Library, Users, MessageCircle, Bell, User, LogOut } from 'lucide-react';
import { Page } from '../App';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  notifications?: number;
}

export function Navigation({ currentPage, onNavigate, onLogout, notifications = 3 }: NavigationProps) {
  const navItems = [
    { page: 'dashboard' as Page, label: 'Home', icon: Home },
    { page: 'library' as Page, label: 'Library', icon: Library },
    { page: 'qa' as Page, label: 'Q&A', icon: MessageCircle },
    { page: 'groups' as Page, label: 'Groups', icon: Users },
    { page: 'profile' as Page, label: 'Profile', icon: User },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-blue-900">Freemodule Wall</span>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-1">
            {navItems.map(({ page, label, icon: Icon }) => (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  currentPage === page
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
            
            {/* Notifications */}
            <button className="relative px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute top-1 right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-lg flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline">Log out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
