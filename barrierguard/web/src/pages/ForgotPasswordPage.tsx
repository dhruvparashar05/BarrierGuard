import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, ArrowLeft, Send, Info } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-2">
            <img
              src="/barrierguard_logo.png"
              alt="BarrierGuard Logo"
              className="w-10 h-10 rounded-xl object-contain shadow-lg shadow-orange-500/20"
            />
            <span className="text-lg font-bold text-white tracking-tight">BarrierGuard</span>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Password Reset</h1>
            <p className="text-xs text-slate-400 mt-1">
              Enter your registered work email to receive password recovery instructions.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-xs space-y-2 text-slate-300">
              <div className="flex items-center gap-2 text-blue-400 font-semibold">
                <Info className="w-4 h-4" />
                <span>SIH Demonstration Notice</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Automated email delivery is configured in production enterprise deployments. For SIH evaluation purposes, please sign in with one of the pre-configured demo credentials or create a new account.
              </p>
              <div className="pt-2 border-t border-blue-500/20 text-[11px] font-mono text-blue-300">
                Analyst Demo: analyst@barrierguard.demo / Demo@123456
              </div>
            </div>

            <Link
              to="/login"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@barrierguard.demo"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-400 outline-none transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Reset Instructions</span>
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs text-slate-400 hover:text-slate-200 transition inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
