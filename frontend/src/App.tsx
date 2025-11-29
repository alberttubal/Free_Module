import { useState } from 'react';
import { SignIn } from './components/SignIn';
import { SignUp } from './components/SignUp';
import { SuccessScreen } from './components/SuccessScreen';
import { Dashboard } from './components/Dashboard';
import { CoursePage } from './components/CoursePage';
import { ResourceLibrary } from './components/ResourceLibrary';
import { QAForum } from './components/QAForum';
import { GroupsMessaging } from './components/GroupsMessaging';
import { Profile } from './components/Profile';

export type Page = 'signin' | 'signup' | 'success' | 'dashboard' | 'course' | 'library' | 'qa' | 'groups' | 'profile';

export interface User {
  fullName: string;
  email: string;
  course: string;
  year: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('signin');
  const [user, setUser] = useState<User | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>('BSCS');

  const handleSignIn = (email: string) => {
    // Mock user data
    setUser({
      fullName: 'Juan Dela Cruz',
      email: email,
      course: 'BSCS',
      year: '3rd Year'
    });
    setCurrentPage('success');
  };

  const handleSignUp = (userData: User) => {
    setUser(userData);
    setCurrentPage('success');
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const handleCourseSelect = (course: string) => {
    setSelectedCourse(course);
    setCurrentPage('course');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('signin');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'signin':
        return <SignIn onSignIn={handleSignIn} onNavigateToSignUp={() => setCurrentPage('signup')} />;
      case 'signup':
        return <SignUp onSignUp={handleSignUp} onNavigateToSignIn={() => setCurrentPage('signin')} />;
      case 'success':
        return <SuccessScreen userName={user?.fullName || 'Student'} onContinue={() => setCurrentPage('dashboard')} />;
      case 'dashboard':
        return <Dashboard user={user} onNavigate={handleNavigate} onCourseSelect={handleCourseSelect} onLogout={handleLogout} />;
      case 'course':
        return <CoursePage course={selectedCourse} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'library':
        return <ResourceLibrary onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'qa':
        return <QAForum user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'groups':
        return <GroupsMessaging user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'profile':
        return <Profile user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      default:
        return <SignIn onSignIn={handleSignIn} onNavigateToSignUp={() => setCurrentPage('signup')} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {renderPage()}
    </div>
  );
}
