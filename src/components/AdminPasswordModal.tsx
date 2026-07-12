/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldAlert, X, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../utils/api';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminPasswordModal({ isOpen, onClose, onSuccess }: AdminPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('পাসওয়ার্ডটি খালি রাখা যাবে না!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          setPassword('');
          setSuccess(false);
          onClose();
        }, 1000);
      } else {
        setError(data.error || 'ভুল পাসওয়ার্ড! দয়া করে আবার চেষ্টা করুন।');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (err) {
      setError('নেটওয়ার্ক এরর! দয়া করে আবার চেষ্টা করুন।');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-brand-charcoal/60 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Container */}
      <div 
        className={`relative w-full max-w-sm bg-[#FCF9F5] border border-brand-gold/20 rounded-2xl p-6 shadow-2xl transition-all duration-300 transform scale-100 ${
          shake ? 'animate-bounce' : ''
        }`}
        style={{
          animation: shake ? 'shake 0.5s ease-in-out' : 'none'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-brand-charcoal/40 hover:text-brand-maroon hover:bg-brand-gold/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="flex flex-col items-center text-center mt-2">
          {success ? (
            <div className="space-y-3.5 py-6">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-lg font-serif font-bold text-emerald-800">
                পাসওয়ার্ড ভেরিফাইড!
              </h3>
              <p className="text-xs text-emerald-700/80">
                অ্যাডমিন প্যানেল ওপেন করা হচ্ছে...
              </p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-brand-maroon/5 border border-brand-gold/20 rounded-full flex items-center justify-center text-brand-maroon mb-4">
                <Lock className="w-5 h-5" />
              </div>

              <h3 className="text-lg font-serif font-extrabold text-brand-charcoal">
                অ্যাডমিন সিকিউরিটি অ্যাক্সেস
              </h3>
              <p className="text-xs text-brand-charcoal/60 mt-1 px-2">
                বরণ ফ্যাশন রিসেল ড্যাশবোর্ড খোলার জন্য সিক্রেট পাসওয়ার্ডটি প্রবেশ করান।
              </p>

              <form onSubmit={handleSubmit} className="w-full mt-6 space-y-4 text-left">
                <div className="space-y-1.5 relative">
                  <label className="block text-[10px] font-bold text-brand-charcoal/50 uppercase tracking-wider pl-1">
                    পাসওয়ার্ড:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="পাসওয়ার্ড লিখুন..."
                      autoFocus
                      className="w-full bg-white text-brand-charcoal text-sm border border-brand-gold/25 focus:border-brand-terracotta focus:outline-none rounded-xl py-3 pl-3.5 pr-10 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-brand-charcoal/40 hover:text-brand-maroon transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-brand-charcoal/40 block pl-1">
                    💡 ডেমো পাসওয়ার্ড: <span className="font-bold text-brand-maroon font-mono">yasin</span>
                  </span>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-xs text-brand-maroon bg-red-50 border border-red-100 rounded-xl p-3 animate-fadeIn">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-maroon hover:bg-brand-terracotta text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.01] flex items-center justify-center gap-2 text-sm mt-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      যাচাই করা হচ্ছে...
                    </>
                  ) : (
                    'ড্যাশবোর্ডে প্রবেশ করুন'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Embedded shake style */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
