import { Check, ArrowRight } from 'lucide-react';

interface SuccessScreenProps {
  userName: string;
  onContinue: () => void;
}

export function SuccessScreen({ userName, onContinue }: SuccessScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50 px-4">
      <div className="text-center max-w-md">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto mb-6 flex items-center justify-center">
          <Check className="w-14 h-14 text-white" strokeWidth={3} />
        </div>

        {/* Welcome Message */}
        <h1 className="text-blue-900 mb-4">Welcome to Freemodule Wall!</h1>
        <p className="text-gray-600 mb-2">Your USTP academic hub</p>
        <p className="text-blue-600 mb-8">Hello, {userName}! 👋</p>

        {/* Illustration */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg">
          <svg className="w-full h-48 mx-auto" viewBox="0 0 400 200" fill="none">
            {/* Books */}
            <rect x="60" y="100" width="40" height="60" rx="4" fill="#3B82F6" />
            <rect x="105" y="90" width="40" height="70" rx="4" fill="#EAB308" />
            <rect x="150" y="95" width="40" height="65" rx="4" fill="#3B82F6" />
            
            {/* Desk */}
            <rect x="40" y="160" width="170" height="8" rx="4" fill="#1E40AF" />
            <rect x="45" y="168" width="6" height="25" rx="2" fill="#1E40AF" />
            <rect x="199" y="168" width="6" height="25" rx="2" fill="#1E40AF" />
            
            {/* Computer */}
            <rect x="230" y="110" width="80" height="50" rx="4" fill="#E5E7EB" stroke="#3B82F6" strokeWidth="2" />
            <rect x="260" y="160" width="20" height="8" rx="2" fill="#6B7280" />
            <rect x="220" y="168" width="100" height="4" rx="2" fill="#1E40AF" />
            
            {/* Screen content */}
            <circle cx="250" cy="130" r="8" fill="#3B82F6" />
            <rect x="265" y="125" width="30" height="4" rx="2" fill="#D1D5DB" />
            <rect x="265" y="135" width="25" height="4" rx="2" fill="#D1D5DB" />
            
            {/* Decorative elements */}
            <circle cx="340" cy="50" r="15" fill="#FDE68A" opacity="0.5" />
            <circle cx="50" cy="40" r="20" fill="#BFDBFE" opacity="0.5" />
          </svg>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 shadow-lg"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
