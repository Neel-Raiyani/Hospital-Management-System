import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import logger from './logger.js';

const transporter = nodemailer.createTransport({
    host: env.mail_host,
    port: env.mail_port,
    secure: env.mail_port === 465,
    auth: {
        user: env.mail_user,
        pass: env.mail_pass,
    },
});

export const sendPasswordResetEmail = async (email: string, token: string, name: string) => {
    const resetUrl = `${env.frontend_url}/reset-password?token=${token}`;

    // DEBUG: Always log the reset link to console for trial/development
    console.log('--------------------------------------------------');
    console.log(`PASSWORD RESET LINK FOR ${email}:`);
    console.log(resetUrl);
    console.log('--------------------------------------------------');

    const mailOptions = {
        from: `"Empyreal Healthcare" <${env.mail_from}>`,
        to: email,
        subject: 'Password Reset Request - Empyreal HMS',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #4F46E5; margin: 0; font-size: 28px;">Empyreal</h1>
                    <p style="color: #6B7280; text-transform: uppercase; font-size: 10px; letter-spacing: 2px; font-weight: bold; margin-top: 5px;">Healthcare Systems</p>
                </div>
                
                <div style="padding: 20px; background-color: #F9FAFB; border-radius: 8px; margin-bottom: 30px;">
                    <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Password Reset Request</h2>
                    <p style="color: #374151; line-height: 1.6;">Hello ${name},</p>
                    <p style="color: #374151; line-height: 1.6;">We received a request to reset your password for your Empyreal Staff account. Click the button below to set a new password. This link will expire in 1 hour.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #4F46E5; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4);">
                            Reset Password
                        </a>
                    </div>
                    
                    <p style="color: #6B7280; font-size: 13px; line-height: 1.6;">If the button above doesn't work, copy and paste this link into your browser:</p>
                    <p style="color: #4F46E5; font-size: 13px; word-break: break-all;">${resetUrl}</p>
                </div>
                
                <div style="border-top: 1px solid #e0e0e0; padding-top: 20px;">
                    <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">If you didn't request a password reset, please ignore this email or contact your system administrator.</p>
                    <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 10px 0 0;">&copy; ${new Date().getFullYear()} Empyreal Healthcare Systems. All rights reserved.</p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info(`Password reset email sent to: ${email}`);
    } catch (error) {
        logger.error(`Error sending password reset email: ${(error as Error).message}`);
        throw new Error('Failed to send reset email. Please try again later.');
    }
};
