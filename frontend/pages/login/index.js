// pages/index.js
import React, { useState } from 'react';
import Head from 'next/head';
import { User, Lock, Mail, ArrowRight, Check, AlertCircle, BookOpen, ChevronLeft, Eye, EyeOff, MailCheck } from 'lucide-react';

/**
 * High-Fidelity Auth Prototype (Sign-In + 3-step Sign-Up + Dashboard)
 * Save as pages/index.js in a Next.js project.
 *
 * - Simulated errors:
 *   - Sign-In: any email containing 'error' -> Invalid Credentials (simulated)
 *   - Sign-Up: password vs confirm mismatch -> Password Mismatch
 *
 * - Forgot Password: opens modal with simulated "email sent" interaction.
 *
 * Visual system: BRAND object controls colors.
 */

// --- Brand Colors & Styles ---
const BRAND = {
  dark: '#021b3c',
  yellow: '#facc15',
  accentYellow: '#eab308',
  light: '#f8fafc',
};

export default function AuthPrototype() {
  const [currentView, setCurrentView] = useState('login'); // 'login' | 'signup' | 'dashboard'
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-slate-50">
      <Head>
        <title>Auth Prototype — Sign In / Sign Up</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Tailwind CDN for easy prototyping; remove if you have local Tailwind */}
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      {/* Layout */}
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{ background: `linear-gradient(135deg, ${BRAND.dark} 0%, #0f3466 60%, ${BRAND.accentYellow} 100%)` }}
        />
        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-[-15%] left-[-10%] w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-18 animate-blob animation-delay-2000" />

        <div className="w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden z-10 relative grid md:grid-cols-2">
          {/* Left: Visual / CTA */}
          <div className="hidden md:flex flex-col gap-6 p-10 bg-[linear-gradient(180deg,#062040, #08305a)] text-white">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-white/10">
                <Check size={18} className="text-green-300" />
              </div>
              <div className="text-sm">
                <div className="text-xs uppercase opacity-60">Prototype</div>
                <div className="font-bold text-lg">Auth Flow</div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-3xl font-extrabold leading-tight">Welcome to Free Module</h2>
              <p className="mt-3 text-slate-200/80">EXPERIENCE BEING A TRAILBLAZER</p>
            </div>

            <div className="mt-auto grid gap-3">
              <button
                onClick={() => setCurrentView('signup')}
                className="bg-yellow-400 text-slate-900 font-bold py-3 px-6 rounded-full shadow hover:bg-yellow-300 transition"
              >
                Sign-Up flow
              </button>
              <button
                onClick={() => setCurrentView('login')}
                className="border border-white/20 text-white py-3 px-6 rounded-full hover:bg-white/5 transition"
              >
                Back to Sign-In
              </button>
            </div>
          </div>

          {/* Right: Auth Card */}
          <div className="bg-white p-6 md:p-10">
            {currentView === 'dashboard' ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <>
                {currentView === 'login' ? (
                  <LoginForm
                    onLogin={handleLoginSuccess}
                    onSwitchToSignup={() => setCurrentView('signup')}
                  />
                ) : (
                  <SignupFlow
                    onSignupSuccess={handleLoginSuccess}
                    onSwitchToLogin={() => setCurrentView('login')}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer small */}
        <div className="absolute bottom-4 text-white/40 text-xs text-center w-full">
          &copy; {new Date().getFullYear()} Free Module — Prototype
        </div>
      </div>

      {/* custom tiny CSS for prototypes (animations used above) */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px,0px) scale(1); }
          33% { transform: translate(10px,-10px) scale(1.05); }
          66% { transform: translate(-10px,10px) scale(0.95); }
          100% { transform: translate(0px,0px) scale(1); }
        }
        .animate-blob { animation: blob 8s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0px); }
        }
        .animate-fade-in { animation: fadeInUp .35s ease both; }
        .animate-fade-in-up { animation: fadeInUp .45s ease both; }
        .animate-shake { animation: shake .9s ease both; }
        @keyframes shake {
          0% { transform: translateX(0) }
          25% { transform: translateX(-4px) }
          50% { transform: translateX(4px) }
          75% { transform: translateX(-2px) }
          100% { transform: translateX(0) }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------
   Login Form
   - Simulated invalid credentials if email contains 'error'
   - Forgot password modal included
   ------------------------------ */
const LoginForm = ({ onLogin, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({ identifier: '', password: '' }); // identifier supports email or username
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const submit = (e) => {
    e?.preventDefault();
    setError('');
    if (!formData.identifier || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    // Simulate server response
    setTimeout(() => {
      setIsLoading(false);
      // invalid credentials simulation: identifier contains "error"
      if (formData.identifier.toLowerCase().includes('error')) {
        setError('Invalid credentials. Please verify your email/username and password.');
      } else {
        onLogin({ name: 'Trailblazer', email: formData.identifier });
      }
    }, 900);
  };

  return (
    <div className="p-2 md:p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: BRAND.dark }}>Welcome Back</h1>
        <p className="text-sm text-slate-500">Sign in to continue to your dashboard.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2 animate-shake">
          <AlertCircle size={16} />
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <label className="text-sm font-medium text-slate-700">Email or Username</label>
        <div className="relative">
          <User className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition"
            placeholder="student@ustp.edu.ph or username"
            value={formData.identifier}
            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <button type="button" onClick={() => setForgotOpen(true)} className="text-xs text-blue-600 hover:underline">Forgot Password?</button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-lg font-bold text-white shadow-lg hover:shadow-xl transform active:scale-95 transition flex justify-center items-center gap-3"
          style={{ backgroundColor: BRAND.dark }}
        >
          {isLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Sign In <ArrowRight size={18} /></>}
        </button>
      </form>

      <div className="mt-5 text-center text-sm text-slate-600">
        New here?{' '}
        <button onClick={onSwitchToSignup} className="font-bold text-slate-900 hover:underline">Create an account</button>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} />}
    </div>
  );
};

/* ------------------------------
   Forgot Password Modal
   - Simulated flow: enter email -> 'Send' -> success state
   ------------------------------ */
const ForgotPasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('form'); // 'form' | 'sending' | 'sent' | 'error'

  const sendReset = (e) => {
    e?.preventDefault();
    if (!email) {
      setState('error');
      return;
    }
    setState('sending');
    setTimeout(() => {
      // success simulation
      setState('sent');
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl p-6 w-full max-w-md z-10 shadow-2xl">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-lg font-bold">Reset Password</h3>
            <p className="text-sm text-slate-500">Enter your email and we'll send a reset link (simulated).</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">Close</button>
        </div>

        <div className="mt-4">
          {state === 'form' && (
            <form onSubmit={sendReset} className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-900"
                  placeholder="you@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="submit" className="flex-1 bg-blue-900 text-white py-2.5 rounded-md font-semibold">Send Reset Link</button>
                <button type="button" onClick={onClose} className="px-4 py-2.5 border rounded-md">Cancel</button>
              </div>
            </form>
          )}

          {state === 'sending' && (
            <div className="py-6 text-center">
              <div className="mx-auto w-10 h-10 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
              <p className="mt-3 text-slate-600">Sending reset link...</p>
            </div>
          )}

          {state === 'sent' && (
            <div className="py-6 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <MailCheck size={28} />
              </div>
              <p className="mt-4 font-medium">Email sent!</p>
              <p className="mt-1 text-sm text-slate-500">Check your inbox for the reset instructions (simulated).</p>
              <div className="mt-4">
                <button onClick={onClose} className="px-5 py-2.5 bg-yellow-400 rounded-md font-bold">Got it</button>
              </div>
            </div>
          )}

          {state === 'error' && (
            <div className="py-4 text-center text-red-600">
              <p>Please enter a valid email address.</p>
              <div className="mt-3">
                <button onClick={() => setState('form')} className="px-3 py-1 rounded-md border">Try again</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------
   SignupFlow (3 steps)
   - Step 1: Account (email, password, confirm)
   - Step 2: Personal (name, department)
   - Step 3: Review & Terms
   - Validates at each step; Password mismatch simulated here.
   ------------------------------ */
const SignupFlow = ({ onSignupSuccess, onSwitchToLogin }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    department: '',
    termsAccepted: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStep = (s) => {
    const newErrors = {};
    if (s === 1) {
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password && formData.password.length < 8) newErrors.password = 'Min 8 characters';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    if (s === 2) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.department) newErrors.department = 'Department is required';
    }
    if (s === 3) {
      if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(3, s + 1));
    }
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

  const submitFinal = () => {
    if (!validateStep(3)) return;
    // simulate server registration
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      // simulate a small probability of server-side error (optional)
      if (formData.email.toLowerCase().includes('error')) {
        setErrors({ global: 'Server error: this email cannot be used.' });
      } else {
        onSignupSuccess({ name: `${formData.firstName} ${formData.lastName}`, email: formData.email });
      }
    }, 1100);
  };

  return (
    <div className="p-2 md:p-6">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          {[1,2,3].map((n) => (
            <div key={n} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold ${step >= n ? 'bg-yellow-400 text-slate-900 shadow' : 'bg-slate-100 text-slate-400'}`}>
                {step > n ? <Check size={16} /> : n}
              </div>
              {n < 3 && <div className={`h-[2px] flex-1 ${step > n ? 'bg-yellow-300' : 'bg-slate-100'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-900">
          {step === 1 && 'Account Setup'}
          {step === 2 && 'Personal Details'}
          {step === 3 && 'Review & Join'}
        </h2>
        <p className="text-sm text-slate-500">
          {step === 1 && 'Create your login credentials.'}
          {step === 2 && 'Tell us a bit about yourself.'}
          {step === 3 && 'Confirm details and accept terms.'}
        </p>
      </div>

      {/* Error banner (server/global) */}
      {errors.global && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center gap-2">
          <AlertCircle size={16} />
          <div>{errors.global}</div>
        </div>
      )}

      <div className="min-h-[260px]">
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-3 animate-fade-in">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-300' : 'border-slate-300 focus:ring-yellow-300'}`}
              placeholder="student@ustp.edu.ph"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-300' : 'border-slate-300 focus:ring-yellow-300'}`}
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Confirm Password</label>
                <input
                  type="password"
                  className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-300' : 'border-slate-300 focus:ring-yellow-300'}`}
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                {errors.confirmPassword && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {errors.confirmPassword}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-3 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700">First Name</label>
                <input
                  type="text"
                  className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 ${errors.firstName ? 'border-red-500 focus:ring-red-300' : 'border-slate-300 focus:ring-yellow-300'}`}
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Last Name</label>
                <input
                  type="text"
                  className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 ${errors.lastName ? 'border-red-500 focus:ring-red-300' : 'border-slate-300 focus:ring-yellow-300'}`}
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
                {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Department / College</label>
              <select
                className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 ${errors.department ? 'border-red-500' : 'border-slate-300 focus:ring-yellow-300'}`}
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="">Select Department</option>
                <option value="CIT">College of Information Tech</option>
                <option value="CEA">College of Engineering</option>
                <option value="CSM">College of Science & Math</option>
              </select>
              {errors.department && <p className="text-xs text-red-500">{errors.department}</p>}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-3 animate-fade-in">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Confirm Details</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-medium text-slate-700">Email:</span> {formData.email || '—'}</p>
                <p><span className="font-medium text-slate-700">Name:</span> {formData.firstName} {formData.lastName}</p>
                <p><span className="font-medium text-slate-700">Dept:</span> {formData.department || '—'}</p>
              </div>
            </div>

            <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-slate-300"
                checked={formData.termsAccepted}
                onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
              />
              <span className="text-sm text-slate-600">I agree to the <span className="text-blue-600 underline">Terms of Service</span> and <span className="text-blue-600 underline">Privacy Policy</span>.</span>
            </label>
            {errors.termsAccepted && <p className="text-xs text-red-500">{errors.termsAccepted}</p>}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        {step > 1 && (
          <button onClick={back} className="px-4 py-3 rounded-lg border border-slate-300 font-medium text-slate-600 hover:bg-slate-50 transition">
            <ChevronLeft size={18} />
          </button>
        )}

        {step < 3 ? (
          <button onClick={next} className="flex-1 py-3 rounded-lg font-bold text-white shadow-md hover:bg-blue-800 transition" style={{ backgroundColor: BRAND.dark }}>
            Next Step <ArrowRight size={18} />
          </button>
        ) : (
          <button onClick={submitFinal} disabled={isSubmitting} className="flex-1 py-3 rounded-lg font-bold text-slate-900 shadow-md hover:bg-yellow-300 transition" style={{ backgroundColor: BRAND.yellow }}>
            {isSubmitting ? <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : 'Complete Registration'}
          </button>
        )}
      </div>

      <div className="mt-4 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="font-bold text-slate-900 hover:underline">Sign In</button>
      </div>
    </div>
  );
};

/* ------------------------------
   Dashboard / Welcome screen (success)
   ------------------------------ */
const Dashboard = ({ user, onLogout }) => {
  return (
    <div className="min-h-[420px] flex flex-col">
      <nav className="flex items-center justify-between pb-4 mb-6 border-b">
        <div className="font-extrabold text-xl" style={{ color: BRAND.dark }}>Free Module</div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-sm text-slate-600">Welcome, <span className="font-bold text-slate-900">{user?.name || 'User'}</span></div>
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-slate-900">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <button onClick={onLogout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <header className="text-white py-8 px-4 rounded-lg mb-6" style={{ background: `linear-gradient(90deg, ${BRAND.dark} 0%, ${BRAND.yellow} 100%)` }}>
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
            <Check size={16} className="text-green-300" />
            <span className="text-sm font-medium">Login Successful</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold">Welcome, {user?.name || 'Trailblazer'}</h1>
          <p className="mt-2 text-slate-100/90">You're all set. This is a placeholder dashboard for the prototype.</p>
        </div>
      </header>

      <main className="grid md:grid-cols-3 gap-4">
        <DashboardCard icon={<BookOpen className="text-yellow-500" />} title="My Modules" desc="Access your saved notes." />
        <DashboardCard icon={<User className="text-blue-400" />} title="Profile" desc="Update your student info." />
        <DashboardCard icon={<Mail className="text-pink-400" />} title="Messages" desc="Chat with mentors." />
      </main>
    </div>
  );
};

const DashboardCard = ({ icon, title, desc }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition flex items-start gap-4">
    <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>
    <div>
      <h3 className="font-bold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500">{desc}</p>
    </div>
  </div>
);
