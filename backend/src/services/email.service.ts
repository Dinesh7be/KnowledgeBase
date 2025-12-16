import nodemailer from 'nodemailer';

// Create transporter with Brevo SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // Use TLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verify connection on startup
transporter.verify((error) => {
    if (error) {
        console.log('❌ SMTP Connection Error:', error.message);
    } else {
        console.log('✅ SMTP Server connected - Ready to send emails');
    }
});

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
    try {
        const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

        console.log(`📤 Sending email to: ${options.to}`);
        console.log(`   From: ${fromEmail}`);
        console.log(`   Subject: ${options.subject}`);

        const info = await transporter.sendMail({
            from: `"Chat Base" <${fromEmail}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text || options.html.replace(/<[^>]*>/g, ''),
        });

        console.log(`✅ Email sent successfully!`);
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Response: ${info.response}`);
        return true;
    } catch (error: any) {
        console.error('❌ Email send error:', error.message);
        console.error('   Full error:', JSON.stringify(error, null, 2));
        return false;
    }
}

export async function sendOTPEmail(email: string, otp: string, type: 'register' | 'login' | 'reset'): Promise<boolean> {
    // Set subject based on type
    let subject: string;
    let heading: string;
    let description: string;

    switch (type) {
        case 'register':
            subject = 'Verify your Chat Base account';
            heading = 'Verify Your Email';
            description = 'Welcome to Chat Base! Use the verification code below to complete your registration:';
            break;
        case 'login':
            subject = 'Your login OTP for Chat Base';
            heading = 'Login Verification';
            description = 'Use the verification code below to log in to your account:';
            break;
        case 'reset':
            subject = 'Reset your Chat Base password';
            heading = 'Password Reset';
            description = 'You requested to reset your password. Use the verification code below to reset your password:';
            break;
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Source Sans Pro', Arial, sans-serif; background-color: #f4f4f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #E6602F 0%, #d4551f 100%); padding: 32px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Chat Base</h1>
                            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Knowledge Base Chatbot</p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px; color: #18181b; font-size: 20px; font-weight: 600;">
                                ${heading}
                            </h2>
                            <p style="margin: 0 0 24px; color: #52525b; font-size: 15px; line-height: 1.6;">
                                ${description}
                            </p>
                            
                            <!-- OTP Code -->
                            <div style="background-color: #f4f4f5; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                                <p style="margin: 0 0 8px; color: #71717a; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Your verification code</p>
                                <p style="margin: 0; color: #18181b; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: monospace;">${otp}</p>
                            </div>
                            
                            <p style="margin: 0 0 8px; color: #71717a; font-size: 13px;">
                                ⏱️ This code expires in <strong>10 minutes</strong>
                            </p>
                            <p style="margin: 0; color: #71717a; font-size: 13px;">
                                🔒 If you didn't request this, please ignore this email.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f4f4f5; padding: 24px 40px; text-align: center; border-top: 1px solid #e4e4e7;">
                            <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                                © ${new Date().getFullYear()} Chat Base. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    return sendEmail({
        to: email,
        subject,
        html,
    });
}
