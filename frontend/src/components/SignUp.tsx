import { useState } from 'react';
import { User as UserIcon, Mail, Lock, AlertCircle, Check, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { User } from '../App';

interface SignUpProps {
  onSignUp: (user: User) => void;
  onNavigateToSignIn: () => void;
}

export function SignUp({ onSignUp, onNavigateToSignIn }: SignUpProps) {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');

  const courses = ['BSCS', 'BSIT', 'BSEE', 'BSCE', 'BSME', 'BSIE', 'BSArch'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  const handleGoogleSignUp = () => {
    // Mock Google sign up
    onSignUp({ 
      fullName: 'USTP Student', 
      email: 'student@ustp.edu.ph', 
      course: 'BSCS', 
      year: '3rd Year' 
    });
  };

  const handleStep1Next = () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleStep2Next = () => {
    if (verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    // Mock verification - accept "123456" as correct code
    if (verificationCode !== '123456') {
      setError('Incorrect verification code.');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleStep3Submit = () => {
    if (!course || !year) {
      setError('Please select your course and year.');
      return;
    }
    setError('');
    onSignUp({ fullName, email, course, year });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-blue-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Create an account now to get free trusted modules in our community</p>
        </div>

        {/* Progress Indicator */}
        {step > 1 && (
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > stepNum ? <Check className="w-5 h-5" /> : stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-12 h-1 ${step > stepNum ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Step 1: Account Details */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Google One-Tap Banner */}
              <button
                onClick={handleGoogleSignUp}
                className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-4 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white">U</span>
                    </div>
                    
                    {/* User Info */}
                    <div className="text-left">
                      <p className="text-gray-900">Sign in as...</p>
                      <p className="text-gray-500">user@ustp.edu.ph</p>
                    </div>
                  </div>
                  
                  {/* Google Logo */}
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                </div>
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {/* Email Input */}
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Input with Toggle */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                  placeholder="Create password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Sign Up Button */}
              <button
                onClick={handleStep1Next}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                Sign Up
              </button>

              {/* Log In Link */}
              <div className="text-center pt-2">
                <span className="text-gray-600">Already have an account? </span>
                <button
                  onClick={onNavigateToSignIn}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Log in
                </button>
              </div>

              {/* Footer Legal Text */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-gray-500">
                  By creating an account, you accept the{' '}
                  <button className="text-blue-600 hover:text-blue-700">
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button className="text-blue-600 hover:text-blue-700">
                    Privacy Policy
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Verification */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-blue-900 text-center">Verification</h2>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-600">
                  Enter the code sent to <span className="text-blue-600">{email}</span>
                </p>
                <p className="text-gray-500 mt-2">Use code: 123456 for demo</p>
              </div>

              <div>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setError('');
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleStep2Next}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                  Verify
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Course & Year */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-blue-900 text-center">Academic Information</h2>

              <div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full Name"
                />
              </div>

              <div>
                <select
                  value={course}
                  onChange={(e) => {
                    setCourse(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select your course</option>
                  {courses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select your year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleStep3Submit}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                  Complete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
