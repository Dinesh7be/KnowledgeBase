'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Loader2, UserPlus, KeyRound } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { auth } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<'form' | 'otp'>('form');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password || !confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            await auth.initiateRegister(email, password);
            toast.success('OTP sent! Check your email');
            setStep('otp');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();

        if (otp.length !== 6) {
            toast.error('Please enter 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            const res = await auth.verifyOTP(email, otp);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userEmail', res.data.user.email);
            toast.success('Account created successfully!');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        try {
            await auth.resendOTP(email, 'register');
            toast.success('New OTP sent! Check your email');
        } catch (error: any) {
            toast.error('Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setLoading(true);
        try {
            const decoded: any = jwtDecode(credentialResponse.credential);
            const res = await auth.googleAuth(decoded.sub, decoded.email);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userEmail', res.data.user.email);
            toast.success('Account created successfully!');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Google signup failed');
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
                    {step === 'form' ? (
                        <>
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create account</h1>
                                <p className="text-gray-600 dark:text-gray-400">Sign up to get started</p>
                            </div>

                            {/* Google Sign Up */}
                            <div className="flex justify-center mb-6">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => toast.error('Google signup failed')}
                                    theme="outline"
                                    size="large"
                                    text="signup_with"
                                />
                            </div>

                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">or continue with email</span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full h-12 pl-12 pr-4 rounded-xl 
                                                bg-gray-100 dark:bg-gray-700 
                                                border border-gray-200 dark:border-gray-600 
                                                text-gray-900 dark:text-white 
                                                placeholder:text-gray-400 dark:placeholder:text-gray-500
                                                focus:outline-none focus:ring-2 focus:ring-[#E6602F]/50 focus:border-[#E6602F]/50
                                                transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full h-12 pl-12 pr-4 rounded-xl 
                                                bg-gray-100 dark:bg-gray-700 
                                                border border-gray-200 dark:border-gray-600 
                                                text-gray-900 dark:text-white 
                                                placeholder:text-gray-400 dark:placeholder:text-gray-500
                                                focus:outline-none focus:ring-2 focus:ring-[#E6602F]/50 focus:border-[#E6602F]/50
                                                transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full h-12 pl-12 pr-4 rounded-xl 
                                                bg-gray-100 dark:bg-gray-700 
                                                border border-gray-200 dark:border-gray-600 
                                                text-gray-900 dark:text-white 
                                                placeholder:text-gray-400 dark:placeholder:text-gray-500
                                                focus:outline-none focus:ring-2 focus:ring-[#E6602F]/50 focus:border-[#E6602F]/50
                                                transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 rounded-xl bg-[#E6602F] text-white font-medium
                                        hover:bg-[#d4551f] focus:outline-none focus:ring-2 focus:ring-[#E6602F]/50
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    {loading ? <><Loader2 className="h-5 w-5 animate-spin" />Sending OTP...</> : <><UserPlus className="h-5 w-5" />Create account</>}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <div className="mx-auto w-16 h-16 rounded-full bg-[#E6602F]/10 flex items-center justify-center mb-4">
                                    <KeyRound className="h-8 w-8 text-[#E6602F]" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verify your email</h1>
                                <p className="text-gray-600 dark:text-gray-400">Enter the 6-digit code sent to<br /><span className="font-medium text-gray-900 dark:text-white">{email}</span></p>

                            </div>

                            <form onSubmit={handleVerifyOTP} className="space-y-5">
                                <div>
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
                                            placeholder:text-gray-300 dark:placeholder:text-gray-600
                                            focus:outline-none focus:ring-2 focus:ring-[#E6602F]/50 focus:border-[#E6602F]/50
                                            transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otp.length !== 6}
                                    className="w-full h-12 rounded-xl bg-[#E6602F] text-white font-medium
                                        hover:bg-[#d4551f] focus:outline-none focus:ring-2 focus:ring-[#E6602F]/50
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    {loading ? <><Loader2 className="h-5 w-5 animate-spin" />Verifying...</> : 'Verify & Create Account'}
                                </button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={loading}
                                        className="text-sm text-[#E6602F] hover:underline font-medium"
                                    >
                                        Resend OTP
                                    </button>
                                    <span className="mx-2 text-gray-400">|</span>
                                    <button
                                        type="button"
                                        onClick={() => setStep('form')}
                                        className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                                    >
                                        Change email
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="text-[#E6602F] hover:underline font-medium">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
