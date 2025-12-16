'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            await auth.forgotPassword(email);
            toast.success('OTP sent! Check your email');
            setStep('otp');
        } catch (error: any) {
            toast.success('If an account exists, OTP has been sent');
            setStep('otp');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (otp.length !== 6) {
            toast.error('Please enter 6-digit OTP');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await auth.resetPassword(email, otp, newPassword);
            toast.success('Password reset successfully!');
            setStep('success');
            setTimeout(() => router.push('/login'), 2000);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Password reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
            <Toaster position="top-right" />

            {/* Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#E6602F]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#E6602F]/3 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <Image src="/logo.png" alt="Logo" width={56} height={56} className="rounded-2xl shadow-2xl shadow-[#E6602F]/30" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">Chat Base</span>
                </div>

                {/* Card */}
                <div className="rounded-3xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                    {step === 'email' && (
                        <>
                            <div className="text-center mb-8">
                                <div className="mx-auto w-16 h-16 rounded-full bg-[#E6602F]/10 flex items-center justify-center mb-4">
                                    <KeyRound className="h-8 w-8 text-[#E6602F]" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password?</h1>
                                <p className="text-gray-600 dark:text-gray-400">Enter your email to receive a reset code</p>
                            </div>

                            <form onSubmit={handleSendOTP} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full h-12 pl-12 pr-4 rounded-xl 
                                                bg-gray-100 dark:bg-gray-700 
                                                border border-gray-200 dark:border-gray-600 
                                                text-gray-900 dark:text-white 
                                                placeholder:text-gray-400
                                                focus:outline-none focus:ring-2 focus:ring-[#E6602F]/50
                                                transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 rounded-xl bg-[#E6602F] text-white font-medium
                                        hover:bg-[#d4551f] disabled:opacity-50
                                        transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    {loading ? <><Loader2 className="h-5 w-5 animate-spin" />Sending...</> : 'Send Reset Code'}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 'otp' && (
                        <>
                            <div className="text-center mb-8">
                                <div className="mx-auto w-16 h-16 rounded-full bg-[#E6602F]/10 flex items-center justify-center mb-4">
                                    <Lock className="h-8 w-8 text-[#E6602F]" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
                                <p className="text-gray-600 dark:text-gray-400">Enter the OTP sent to<br /><span className="font-medium text-gray-900 dark:text-white">{email}</span></p>
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">OTP Code</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        maxLength={6}
                                        className="w-full h-14 text-center text-2xl tracking-[0.5em] font-mono rounded-xl 
                                            bg-gray-100 dark:bg-gray-700 
                                            border border-gray-200 dark:border-gray-600 
                                            text-gray-900 dark:text-white 
                                            placeholder:text-gray-300
                                            focus:outline-none focus:ring-2 focus:ring-[#E6602F]/50
                                            transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full h-12 pl-12 pr-4 rounded-xl 
                                                bg-gray-100 dark:bg-gray-700 
                                                border border-gray-200 dark:border-gray-600 
                                                text-gray-900 dark:text-white 
                                                focus:outline-none focus:ring-2 focus:ring-[#E6602F]/50
                                                transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full h-12 pl-12 pr-4 rounded-xl 
                                                bg-gray-100 dark:bg-gray-700 
                                                border border-gray-200 dark:border-gray-600 
                                                text-gray-900 dark:text-white 
                                                focus:outline-none focus:ring-2 focus:ring-[#E6602F]/50
                                                transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otp.length !== 6}
                                    className="w-full h-12 rounded-xl bg-[#E6602F] text-white font-medium
                                        hover:bg-[#d4551f] disabled:opacity-50
                                        transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    {loading ? <><Loader2 className="h-5 w-5 animate-spin" />Resetting...</> : 'Reset Password'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep('email')}
                                    className="w-full text-sm text-gray-600 dark:text-gray-400 hover:underline"
                                >
                                    Change email
                                </button>
                            </form>
                        </>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-8">
                            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Reset!</h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">Redirecting to login...</p>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-[#E6602F] hover:underline font-medium">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
