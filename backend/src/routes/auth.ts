import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
    registerUser,
    validateUser,
    initiateRegistration,
    completeRegistration,
    handleGoogleAuth,
    sendOTP,
    verifyOTP,
    initiateForgotPassword,
    resetPassword
} from '../services/auth.service.ts';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const otpSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
});

const googleAuthSchema = z.object({
    googleId: z.string(),
    email: z.string().email(),
});

export async function authRoutes(app: FastifyInstance) {
    // Legacy Register (direct, no OTP)
    app.post('/api/auth/register', async (request, reply) => {
        try {
            const body = registerSchema.parse(request.body);
            const user = await registerUser(body.email, body.password);

            const token = app.jwt.sign({ id: user.id, email: user.email });

            return reply.status(201).send({
                success: true,
                user,
                token,
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({
                    success: false,
                    error: 'Validation error',
                    details: error.issues,
                });
            }

            const message = error instanceof Error ? error.message : 'Registration failed';
            return reply.status(400).send({
                success: false,
                error: message,
            });
        }
    });

    // Initiate registration with OTP
    app.post('/api/auth/register/initiate', async (request, reply) => {
        try {
            const body = registerSchema.parse(request.body);
            await initiateRegistration(body.email, body.password);

            return reply.send({
                success: true,
                message: 'OTP sent to your email',
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({
                    success: false,
                    error: 'Validation error',
                    details: error.issues,
                });
            }

            const message = error instanceof Error ? error.message : 'Failed to send OTP';
            return reply.status(400).send({
                success: false,
                error: message,
            });
        }
    });

    // Verify OTP and complete registration
    app.post('/api/auth/register/verify', async (request, reply) => {
        try {
            const body = otpSchema.parse(request.body);
            const user = await completeRegistration(body.email, body.otp);

            const token = app.jwt.sign({ id: user.id, email: user.email });

            return reply.status(201).send({
                success: true,
                user,
                token,
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({
                    success: false,
                    error: 'Validation error',
                    details: error.issues,
                });
            }

            const message = error instanceof Error ? error.message : 'Verification failed';
            return reply.status(400).send({
                success: false,
                error: message,
            });
        }
    });

    // Resend OTP
    app.post('/api/auth/resend-otp', async (request, reply) => {
        try {
            const body = z.object({ email: z.string().email(), type: z.enum(['register', 'login']) }).parse(request.body);
            await sendOTP(body.email, body.type);

            return reply.send({
                success: true,
                message: 'OTP resent successfully',
            });
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: 'Failed to resend OTP',
            });
        }
    });

    // Login
    app.post('/api/auth/login', async (request, reply) => {
        try {
            const body = loginSchema.parse(request.body);
            const user = await validateUser(body.email, body.password);

            if (!user) {
                return reply.status(401).send({
                    success: false,
                    error: 'Invalid email or password',
                });
            }

            const token = app.jwt.sign({ id: user.id, email: user.email });

            return reply.send({
                success: true,
                user,
                token,
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({
                    success: false,
                    error: 'Validation error',
                    details: error.issues,
                });
            }

            return reply.status(500).send({
                success: false,
                error: 'Login failed',
            });
        }
    });

    // Google OAuth
    app.post('/api/auth/google', async (request, reply) => {
        try {
            const body = googleAuthSchema.parse(request.body);
            const user = await handleGoogleAuth(body.googleId, body.email);

            const token = app.jwt.sign({ id: user.id, email: user.email });

            return reply.send({
                success: true,
                user,
                token,
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({
                    success: false,
                    error: 'Validation error',
                    details: error.issues,
                });
            }

            return reply.status(500).send({
                success: false,
                error: 'Google authentication failed',
            });
        }
    });

    // Get current user (protected)
    app.get('/api/auth/me', {
        preHandler: [app.authenticate],
    }, async (request, reply) => {
        const jwtUser = request.user as { id: string };
        // Fetch full user data with widgetKey
        const { getUserById } = await import('../services/auth.service.ts');
        const user = getUserById(jwtUser.id);

        if (!user) {
            return reply.status(404).send({
                success: false,
                error: 'User not found',
            });
        }

        return reply.send({
            success: true,
            user,
        });
    });

    // Forgot password - send OTP
    app.post('/api/auth/forgot-password', async (request, reply) => {
        try {
            const body = z.object({ email: z.string().email() }).parse(request.body);
            await initiateForgotPassword(body.email);

            return reply.send({
                success: true,
                message: 'If an account exists, an OTP has been sent to your email',
            });
        } catch (error) {
            // Always return success to prevent email enumeration
            return reply.send({
                success: true,
                message: 'If an account exists, an OTP has been sent to your email',
            });
        }
    });

    // Reset password with OTP
    app.post('/api/auth/reset-password', async (request, reply) => {
        try {
            const body = z.object({
                email: z.string().email(),
                otp: z.string().length(6),
                newPassword: z.string().min(6),
            }).parse(request.body);

            await resetPassword(body.email, body.otp, body.newPassword);

            return reply.send({
                success: true,
                message: 'Password reset successfully',
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Password reset failed';
            return reply.status(400).send({
                success: false,
                error: message,
            });
        }
    });
}
