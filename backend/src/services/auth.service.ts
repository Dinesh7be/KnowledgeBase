import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { sendOTPEmail } from './email.service.ts';

export interface User {
    id: string;
    email: string;
    passwordHash: string;
    isVerified: boolean;
    provider: 'email' | 'google';
    widgetKey: string; // Unique API key for embed widget
    createdAt: string;
}

interface OTPData {
    code: string;
    email: string;
    expiresAt: number;
    type: 'register' | 'login' | 'reset';
}

// In-memory stores (replace with database in production)
const users = new Map<string, User>();
const otpStore = new Map<string, OTPData>();
const pendingRegistrations = new Map<string, { email: string; passwordHash: string }>();

// Generate 6-digit OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via email (Brevo SMTP)
export async function sendOTP(email: string, type: 'register' | 'login'): Promise<string> {
    const code = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(email, { code, email, expiresAt, type });

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, code, type);

    if (emailSent) {
        console.log(`✅ OTP email sent to ${email}`);
    } else {
        console.log(`⚠️ Email failed, OTP for ${email}: ${code}`);
    }

    return code; // Return OTP for fallback display
}

// Verify OTP
export function verifyOTP(email: string, code: string, type: 'register' | 'login'): boolean {
    const otpData = otpStore.get(email);

    if (!otpData) {
        return false;
    }

    if (otpData.code !== code) {
        return false;
    }

    if (otpData.type !== type) {
        return false;
    }

    if (Date.now() > otpData.expiresAt) {
        otpStore.delete(email);
        return false;
    }

    // OTP is valid, remove it
    otpStore.delete(email);
    return true;
}

// Initiate registration (store pending, send OTP)
export async function initiateRegistration(email: string, password: string): Promise<string> {
    // Check if user already exists
    const existingUser = Array.from(users.values()).find((u) => u.email === email);
    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    // Hash password and store pending
    const passwordHash = await bcrypt.hash(password, 10);
    pendingRegistrations.set(email, { email, passwordHash });

    // Generate OTP and store it
    const code = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    otpStore.set(email, { code, email, expiresAt, type: 'register' });

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, code, 'register');

    if (emailSent) {
        console.log(`✅ OTP email sent to ${email}`);
    } else {
        console.log(`⚠️ Email failed, OTP for ${email}: ${code}`);
    }

    return code; // Return OTP for fallback display
}

// Complete registration after OTP verification
export async function completeRegistration(email: string, otp: string): Promise<Omit<User, 'passwordHash'>> {
    // Verify OTP
    if (!verifyOTP(email, otp, 'register')) {
        throw new Error('Invalid or expired OTP');
    }

    // Get pending registration
    const pending = pendingRegistrations.get(email);
    if (!pending) {
        throw new Error('No pending registration found');
    }

    // Generate unique widget key
    const widgetKey = `wk_${uuidv4().replace(/-/g, '').substring(0, 24)}`;

    // Create user
    const user: User = {
        id: uuidv4(),
        email: pending.email,
        passwordHash: pending.passwordHash,
        isVerified: true,
        provider: 'email',
        widgetKey,
        createdAt: new Date().toISOString(),
    };

    users.set(user.id, user);
    pendingRegistrations.delete(email);

    return {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
        provider: user.provider,
        widgetKey: user.widgetKey,
        createdAt: user.createdAt,
    };
}

// Legacy register (for backward compatibility)
export async function registerUser(
    email: string,
    password: string
): Promise<Omit<User, 'passwordHash'>> {
    const existingUser = Array.from(users.values()).find((u) => u.email === email);
    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const widgetKey = `wk_${uuidv4().replace(/-/g, '').substring(0, 24)}`;

    const user: User = {
        id: uuidv4(),
        email,
        passwordHash,
        isVerified: true,
        provider: 'email',
        widgetKey,
        createdAt: new Date().toISOString(),
    };

    users.set(user.id, user);

    return {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
        provider: user.provider,
        widgetKey: user.widgetKey,
        createdAt: user.createdAt,
    };
}

export async function validateUser(
    email: string,
    password: string
): Promise<Omit<User, 'passwordHash'> | null> {
    const user = Array.from(users.values()).find((u) => u.email === email);
    if (!user) {
        return null;
    }

    if (user.provider !== 'email') {
        return null; // User registered with Google, can't login with password
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        return null;
    }

    return {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
        provider: user.provider,
        widgetKey: user.widgetKey,
        createdAt: user.createdAt,
    };
}

// Google OAuth - create or get user
export async function handleGoogleAuth(
    googleId: string,
    email: string
): Promise<Omit<User, 'passwordHash'>> {
    // Check if user exists
    let user = Array.from(users.values()).find((u) => u.email === email);

    if (!user) {
        // Create new user with unique widget key
        const widgetKey = `wk_${uuidv4().replace(/-/g, '').substring(0, 24)}`;
        user = {
            id: uuidv4(),
            email,
            passwordHash: '', // No password for Google users
            isVerified: true,
            provider: 'google',
            widgetKey,
            createdAt: new Date().toISOString(),
        };
        users.set(user.id, user);
    }

    return {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
        provider: user.provider,
        widgetKey: user.widgetKey,
        createdAt: user.createdAt,
    };
}

export function getUserById(id: string): Omit<User, 'passwordHash'> | null {
    const user = users.get(id);
    if (!user) {
        return null;
    }

    return {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
        provider: user.provider,
        widgetKey: user.widgetKey,
        createdAt: user.createdAt,
    };
}

// Get user by widget key (for widget API validation)
export function getUserByWidgetKey(widgetKey: string): Omit<User, 'passwordHash'> | null {
    const user = Array.from(users.values()).find((u) => u.widgetKey === widgetKey);
    if (!user) {
        return null;
    }

    return {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
        provider: user.provider,
        widgetKey: user.widgetKey,
        createdAt: user.createdAt,
    };
}

// Initiate forgot password - send OTP
export async function initiateForgotPassword(email: string): Promise<void> {
    const user = Array.from(users.values()).find((u) => u.email === email);
    if (!user) {
        // Don't reveal if user exists or not
        throw new Error('If an account exists, you will receive an OTP');
    }

    if (user.provider === 'google') {
        throw new Error('This account uses Google login. Please sign in with Google.');
    }

    // Generate OTP and store it
    const code = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    otpStore.set(email, { code, email, expiresAt, type: 'reset' });

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, code, 'reset');

    if (emailSent) {
        console.log(`✅ Password reset OTP sent to ${email}`);
    } else {
        console.log(`⚠️ Email failed for reset OTP to ${email}: ${code}`);
    }
}

// Reset password with OTP
export async function resetPassword(email: string, otp: string, newPassword: string): Promise<boolean> {
    // Verify OTP
    const otpData = otpStore.get(email);

    if (!otpData || otpData.code !== otp || otpData.type !== 'reset') {
        throw new Error('Invalid or expired OTP');
    }

    if (Date.now() > otpData.expiresAt) {
        otpStore.delete(email);
        throw new Error('OTP has expired');
    }

    // Find user
    const user = Array.from(users.values()).find((u) => u.email === email);
    if (!user) {
        throw new Error('User not found');
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    users.set(user.id, user);

    // Clear OTP
    otpStore.delete(email);

    console.log(`✅ Password reset for ${email}`);
    return true;
}
