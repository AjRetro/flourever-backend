import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, EyeIcon, EyeSlashIcon, 
  PaperAirplaneIcon, ArrowPathIcon, LockClosedIcon, KeyIcon, CheckCircleIcon, ExclamationCircleIcon
} from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TermsModal from './TermsModal';
import api from '../api/axiosConfig'; 
import Lottie from 'lottie-react';

// --- ASSET IMPORTS ---
import emailAnim from '../assets/email-anim.json'; 
import errorAnim from '../assets/error-anim.json'; // <--- NEW: ERROR ANIMATION
import catWaveVideo from '../assets/cat-wave.mp4'; 

// --- ANIMATED ICONS ---
const FloatingLock = () => (
  <motion.div
    className="mx-auto mb-6 w-20 h-20 bg-brand-light rounded-full flex items-center justify-center relative"
    initial={{ scale: 0 }} animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 200, damping: 15 }}
  >
    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
      <LockClosedIcon className="w-10 h-10 text-brand-accent" />
    </motion.div>
    <motion.div className="absolute -right-2 -top-2 bg-brand-primary text-white p-2 rounded-full" initial={{ scale: 0 }} animate={{ scale: 1 }} delay={0.5}>
      <KeyIcon className="w-4 h-4" />
    </motion.div>
  </motion.div>
);

// --- WELCOME ANIMATION ---
const WelcomeAnimation = ({ name }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <motion.div 
      className="w-48 h-48 mb-6 rounded-full overflow-hidden border-4 border-brand-secondary shadow-xl"
      initial={{ scale: 0 }} 
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
    >
      <video src={catWaveVideo} autoPlay loop muted playsInline className="w-full h-full object-cover scale-[1.2]" />
    </motion.div>
    <motion.h3 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-3xl font-bold text-brand-primary font-serif text-center">Welcome back,</motion.h3>
    <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }} className="text-2xl text-brand-accent font-serif font-medium mt-2">{name}!</motion.p>
  </div>
);

// --- SUCCESS ANIMATION ---
const SuccessAnimation = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-10">
    <motion.svg width="120" height="120" viewBox="0 0 100 100" initial="hidden" animate="visible">
      <motion.circle cx="50" cy="50" r="45" stroke="#ae6f44" strokeWidth="8" fill="transparent" initial={{ strokeDasharray: "283", strokeDashoffset: 283 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 0.8, ease: "easeInOut" }} />
      <motion.path d="M 30 50 L 45 65 L 70 35" stroke="#ae6f44" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="transparent" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: "easeOut", delay: 0.8 }} />
    </motion.svg>
    <motion.h3 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="text-2xl font-bold text-brand-primary font-serif mt-6">{text}</motion.h3>
  </div>
);

// --- NEW: ERROR ANIMATION COMPONENT ---
const ErrorAnimation = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-10">
    <motion.div 
      className="w-40 h-40 mb-4"
      initial={{ scale: 0 }} animate={{ scale: 1 }} 
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
       {/* This will play your error lottie */}
       <Lottie animationData={errorAnim} loop={true} />
    </motion.div>
    <motion.h3 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="text-2xl font-bold text-red-600 font-serif text-center"
    >
      {text}
    </motion.h3>
    <motion.p
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
      className="text-brand-primary/70 mt-2 text-center"
    >
      We couldn't find that account.
    </motion.p>
  </div>
);

// --- INPUT COMPONENTS ---
const PasswordInput = ({ label, name, value, onChange, autoComplete }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="mb-4 relative">
      <label className="block text-brand-primary text-sm font-bold mb-2">{label}</label>
      <div className="relative">
        <input type={showPassword ? 'text' : 'password'} name={name} value={value} onChange={onChange} autoComplete={autoComplete} required className="w-full px-4 py-2 rounded-lg border-2 border-brand-primary/20 bg-brand-light focus:outline-none focus:border-brand-accent text-brand-primary transition-colors pr-12 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden" />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-primary/50 hover:text-brand-primary transition-colors">
          {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

const Input = ({ label, type, name, value, onChange, required = true, autoComplete }) => (
  <div className="mb-4">
    <label className="block text-brand-primary text-sm font-bold mb-2">{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} required={required} autoComplete={autoComplete} className="w-full px-4 py-2 rounded-lg border-2 border-brand-primary/20 bg-brand-light focus:outline-none focus:border-brand-accent text-brand-primary transition-colors" />
  </div>
);

const Select = ({ label, name, value, onChange, options, required = true }) => (
  <div className="mb-4">
    <label className="block text-brand-primary text-sm font-bold mb-2">{label}</label>
    <select name={name} value={value} onChange={onChange} required={required} className="w-full px-4 py-2 rounded-lg border-2 border-brand-primary/20 bg-brand-light focus:outline-none focus:border-brand-accent text-brand-primary transition-colors appearance-none">
      {options.map((option) => (<option key={option} value={option}>{option}</option>))}
    </select>
  </div>
);

const OtpInput = ({ value, onChange }) => (
  <motion.div 
    className="mb-6"
    initial={{ scale: 0.5, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
  >
    <label className="block text-brand-primary text-sm font-bold mb-2 text-center">Enter 6-Digit Code</label>
    <input type="text" maxLength="6" value={value} onChange={onChange}
      className="w-full text-center text-3xl tracking-[1em] px-4 py-3 rounded-lg border-2 border-brand-primary/20 bg-brand-light focus:outline-none focus:border-brand-accent text-brand-primary transition-all focus:scale-105 font-mono shadow-inner"
      placeholder="000000"
    />
  </motion.div>
);

export default function AuthModal({ closeModal }) {
  const [view, setView] = useState('login'); 
  const { login, signup, verifyOtp, user } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successText, setSuccessText] = useState('Success!');
  const navigate = useNavigate();

  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isAnimComplete, setIsAnimComplete] = useState(false);

  const [emailForVerify, setEmailForVerify] = useState('');
  const [otp, setOtp] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', gender: 'Prefer not to say', birthday: ''
  });
  const [resetForm, setResetForm] = useState({ password: '', confirmPassword: '' });

  useEffect(() => {
    if (view === 'verify') setIsAnimComplete(false);
  }, [view]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setIsLoading(true);
    try {
      const success = await login(loginForm.email, loginForm.password);
      if (success) {
        setIsLoading(false);
        setView('welcome');
        setTimeout(() => { closeModal(); navigate('/store'); }, 2500);
      }
    } catch (err) {
      if (err.response && err.response.status === 403 && err.response.data.needsVerification) {
        const unverifiedEmail = err.response.data.email || loginForm.email;
        setEmailForVerify(unverifiedEmail);
        try { await api.post('/resend-code', { email: unverifiedEmail }); } catch (e) {}
        setView('verify');
        setResendTimer(30);
      } else {
        setError(err.response?.data?.error || 'Login failed');
      }
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault(); setError(''); setIsLoading(true);
    if (signupForm.password !== signupForm.confirmPassword) { setError("Passwords do not match."); setIsLoading(false); return; }
    if (!acceptedTerms) { setError("Please agree to the Terms & Privacy Policy."); setIsLoading(false); return; }
    try {
      const success = await signup(signupForm);
      if (success) {
        setEmailForVerify(signupForm.email);
        setView('verify');
        setResendTimer(30);
      }
    } catch (err) { setError(err.response?.data?.error || 'Signup failed'); }
    setIsLoading(false);
  };

  const handleVerify = async (e) => {
    e.preventDefault(); setError(''); setIsLoading(true);
    try {
      const success = await verifyOtp(emailForVerify, otp, false);
      if (success) {
        setIsLoading(false);
        setSuccessText('Account Verified!');
        setView('success');
        setTimeout(() => { closeModal(); navigate('/store'); }, 2500);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setIsAnimComplete(false); setIsResending(true); setError('');
    try {
      await api.post('/resend-code', { email: emailForVerify });
      setResendTimer(30);
    } catch (err) { setError('Failed to resend code.'); setIsAnimComplete(true); }
    setIsResending(false);
  };

  // --- FORGOT EMAIL SUBMIT (UPDATED with Error Handling) ---
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault(); setError(''); setIsLoading(true);
    try {
      await api.post('/forgot-password', { email: emailForVerify });
      setResendTimer(30);
      setView('forgot-reset'); 
    } catch (err) {
      // Check specifically for 404 (Email not found)
      if (err.response && err.response.status === 404) {
        setView('email-not-found'); // Switch to error view
        // Auto-revert after 3 seconds
        setTimeout(() => {
            setView('forgot-email');
            setIsLoading(false); // Reset loading state
        }, 3000);
        return; // Exit early so we don't set generic error
      }
      setError(err.response?.data?.error || 'Failed to send reset code.');
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault(); setError(''); setIsLoading(true);
    if (resetForm.password !== resetForm.confirmPassword) { setError("Passwords do not match."); setIsLoading(false); return; }
    try {
      await api.post('/reset-password', { email: emailForVerify, code: otp, newPassword: resetForm.password });
      setSuccessText('Password Changed!');
      setView('success');
      setTimeout(() => { setView('login'); }, 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. Invalid code?');
    }
    setIsLoading(false);
  };

  const getTitle = () => {
    switch(view) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Join FlourEver';
      case 'forgot-email': return 'Reset Password';
      case 'forgot-reset': return 'New Password';
      case 'email-not-found': return ''; // No title for full animation
      default: return '';
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={closeModal}
    >
      <motion.div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hide Close button on animation views for immersion */}
        {view !== 'success' && view !== 'welcome' && view !== 'email-not-found' && (
          <button onClick={closeModal} className="absolute top-4 right-4 text-brand-primary/50 hover:text-brand-primary z-10">
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}

        <div className="p-8 pt-12">
          {view !== 'success' && view !== 'welcome' && view !== 'verify' && view !== 'email-not-found' && (
            <h2 className="text-3xl font-bold text-brand-primary font-serif text-center mb-2">
              {getTitle()}
            </h2>
          )}
          
          <AnimatePresence>
            {error && view !== 'email-not-found' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-100 text-red-600 p-3 rounded-lg text-sm text-center mb-4">{error}</motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* VIEW 1: LOGIN */}
            {view === 'login' && (
              <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleLogin}>
                <Input label="Email" type="email" name="email" value={loginForm.email} onChange={(e) => setLoginForm({...loginForm, email: e.target.value})} autoComplete="email" />
                <PasswordInput label="Password" name="password" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} autoComplete="current-password" />
                <div className="flex justify-end mb-4">
                  <button type="button" onClick={() => setView('forgot-email')} className="text-sm text-brand-accent hover:underline">Forgot Password?</button>
                </div>
                <button disabled={isLoading} className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-full hover:bg-opacity-90 transition-all mt-2 disabled:opacity-50">
                  {isLoading ? 'Loading...' : 'Log In'}
                </button>
                <p className="text-center text-brand-primary/60 mt-4 text-sm">
                  Don't have an account? <button type="button" onClick={() => setView('signup')} className="text-brand-accent font-bold hover:underline">Sign Up</button>
                </p>
              </motion.form>
            )}

            {/* VIEW 2: SIGNUP */}
            {view === 'signup' && (
              <motion.form key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSignup}>
                 <div className="grid grid-cols-2 gap-4">
                  <Input label="First Name" type="text" name="firstName" value={signupForm.firstName} onChange={(e) => setSignupForm({...signupForm, firstName: e.target.value})} autoComplete="given-name" />
                  <Input label="Last Name" type="text" name="lastName" value={signupForm.lastName} onChange={(e) => setSignupForm({...signupForm, lastName: e.target.value})} autoComplete="family-name" />
                </div>
                <Input label="Email" type="email" name="email" value={signupForm.email} onChange={(e) => setSignupForm({...signupForm, email: e.target.value})} autoComplete="email" />
                <PasswordInput label="Password" name="password" value={signupForm.password} onChange={(e) => setSignupForm({...signupForm, password: e.target.value})} autoComplete="new-password" />
                <PasswordInput label="Confirm Password" name="confirmPassword" value={signupForm.confirmPassword} onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})} autoComplete="new-password" />
                <div className="grid grid-cols-2 gap-4">
                   <Select label="Gender" name="gender" value={signupForm.gender} onChange={(e) => setSignupForm({...signupForm, gender: e.target.value})} options={['Prefer not to say', 'Male', 'Female', 'Other']} />
                   <Input label="Birthday" type="date" name="birthday" value={signupForm.birthday} onChange={(e) => setSignupForm({...signupForm, birthday: e.target.value})} />
                </div>
                <div className="flex items-start gap-2 mt-4 mb-2">
                  <div className="relative flex items-center">
                    <input type="checkbox" id="terms" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="peer h-5 w-5 cursor-pointer rounded-md border-2 border-brand-primary/30 transition-all checked:border-brand-accent checked:bg-brand-accent hover:border-brand-accent" />
                    <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity" viewBox="0 0 14 14" fill="none"><path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <label htmlFor="terms" className="text-sm text-brand-primary/70 select-none">I agree to the <button type="button" onClick={() => setShowTerms(true)} className="font-bold text-brand-primary hover:underline">Terms & Privacy Policy</button></label>
                </div>
                <button disabled={isLoading} className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-full hover:bg-opacity-90 transition-all mt-2 disabled:opacity-50">
                  {isLoading ? 'Creating...' : 'Create Account'}
                </button>
                 <p className="text-center text-brand-primary/60 mt-4 text-sm">
                  Already have an account? <button type="button" onClick={() => setView('login')} className="text-brand-accent font-bold hover:underline">Log In</button>
                </p>
              </motion.form>
            )}

            {/* VIEW 3: VERIFY */}
            {view === 'verify' && (
               !isAnimComplete ? (
                 <motion.div key="verify-anim" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-4">
                    <div className="w-64 h-64">
                      <Lottie animationData={emailAnim} loop={false} onComplete={() => setIsAnimComplete(true)} />
                    </div>
                    <p className="text-brand-primary/60 font-bold animate-pulse -mt-8">Sending Code...</p>
                 </motion.div>
               ) : (
                 <motion.form key="verify-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} onSubmit={handleVerify} className="text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-4 flex justify-center">
                      <CheckCircleIcon className="w-16 h-16 text-brand-accent" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-brand-primary font-serif mb-2">Code Sent!</h2>
                  <p className="text-brand-primary/70 mb-6">We've sent a code to <strong>{emailForVerify}</strong>.<br/>Please check your inbox.</p>
                  <OtpInput value={otp} onChange={(e) => setOtp(e.target.value)} />
                  <button disabled={isLoading} className="w-full bg-brand-accent text-white font-bold py-3 px-4 rounded-full hover:bg-opacity-90 transition-all mt-4 disabled:opacity-50 shadow-lg">
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                  </button>
                  <button type="button" onClick={handleResend} disabled={resendTimer > 0 || isResending} className="w-full mt-4 py-3 rounded-xl font-bold text-brand-primary border-2 border-brand-primary/10 hover:bg-brand-primary/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isResending ? <motion.div animate={{ x: [0, 20, 0], opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }}><PaperAirplaneIcon className="w-5 h-5 text-brand-accent" /></motion.div> : <ArrowPathIcon className={`w-5 h-5 ${resendTimer === 0 ? 'text-brand-accent' : 'text-brand-primary/50'}`} />}
                    {isResending ? "Sending..." : resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend Verification Code"}
                  </button>
                </motion.form>
               )
            )}

            {/* VIEW 6: FORGOT PASSWORD - EMAIL */}
            {view === 'forgot-email' && (
              <motion.form key="forgot-email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleForgotEmailSubmit}>
                <FloatingLock />
                <p className="text-center text-brand-primary/70 mb-6">Enter your email to receive a password reset code.</p>
                <Input label="Email" type="email" name="email" value={emailForVerify} onChange={(e) => setEmailForVerify(e.target.value)} />
                <button disabled={isLoading} className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-full hover:bg-opacity-90 transition-all mt-2 disabled:opacity-50">
                  {isLoading ? 'Sending...' : 'Send Reset Code'}
                </button>
                <button type="button" onClick={() => setView('login')} className="w-full text-center text-brand-primary/60 mt-4 text-sm hover:underline">Back to Login</button>
              </motion.form>
            )}

            {/* VIEW 7: RESET PASSWORD */}
            {view === 'forgot-reset' && (
              <motion.form key="forgot-reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleResetPassword}>
                <p className="text-center text-brand-primary/70 mb-6">Check your email for the code.</p>
                <OtpInput value={otp} onChange={(e) => setOtp(e.target.value)} />
                <PasswordInput label="New Password" name="password" value={resetForm.password} onChange={(e) => setResetForm({...resetForm, password: e.target.value})} />
                <PasswordInput label="Confirm Password" name="confirmPassword" value={resetForm.confirmPassword} onChange={(e) => setResetForm({...resetForm, confirmPassword: e.target.value})} />
                <button disabled={isLoading} className="w-full bg-brand-accent text-white font-bold py-3 px-4 rounded-full hover:bg-opacity-90 transition-all mt-4 disabled:opacity-50">
                  {isLoading ? 'Resetting...' : 'Change Password'}
                </button>
              </motion.form>
            )}

            {/* SUCCESS, WELCOME & ERROR VIEWS */}
            {(view === 'success' || view === 'welcome' || view === 'email-not-found') && (
              <motion.div key="animation" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                {view === 'success' && <SuccessAnimation text={successText} />}
                {view === 'welcome' && <WelcomeAnimation name={user?.firstName || 'back'} />}
                {/* --- NEW ERROR ANIMATION RENDER --- */}
                {view === 'email-not-found' && <ErrorAnimation text="Email Not Found" />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      <AnimatePresence>{showTerms && <TermsModal onClose={() => setShowTerms(false)} />}</AnimatePresence>
    </motion.div>
  );
}