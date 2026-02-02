import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Shield, Loader2, User, Lock, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.ts';
import { decodeToken } from '../utils/jwt.ts';

// Login Validation Schema
const loginSchema = z.object({
    email: z.string()
        .min(1, 'Employee ID or Email is required')
        .refine(
            (val) => val.includes('@') ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) : val.length >= 3,
            'Please enter a valid Employee ID or Email'
        ),
    password: z.string()
        .min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, user, isAuthenticated } = useAuth();
    const [serverError, setServerError] = useState<string | null>(null);

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated && user) {
            const dashboardMap: Record<string, string> = {
                ADMIN: '/admin/dashboard',
                DOCTOR: '/doctor/dashboard',
                LAB: '/lab/dashboard',
                RECEPTIONIST: '/receptionist/dashboard',
            };
            navigate(dashboardMap[user.role] || '/', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    });

    const onSubmit = async (data: LoginFormValues) => {
        setServerError(null);
        try {
            await login(data);

            const token = localStorage.getItem('token');
            if (token) {
                const decoded = decodeToken(token);
                if (decoded) {
                    const dashboardMap: Record<string, string> = {
                        ADMIN: '/admin/dashboard',
                        DOCTOR: '/doctor/dashboard',
                        LAB: '/lab/dashboard',
                        RECEPTIONIST: '/receptionist/dashboard',
                    };
                    navigate(dashboardMap[decoded.role] || '/');
                } else {
                    navigate('/');
                }
            } else {
                navigate('/');
            }
        } catch (err: any) {
            setServerError(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
        }
    };

    return (
        <div className="login-page">
            {/* CSS-based abstract medical background */}
            <style>{`
                .login-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    font-family: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
                    background: 
                        radial-gradient(circle at 20% 80%, rgba(0, 82, 204, 0.08) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(0, 82, 204, 0.06) 0%, transparent 50%),
                        radial-gradient(circle at 40% 40%, rgba(0, 82, 204, 0.04) 0%, transparent 30%),
                        linear-gradient(180deg, #F8FAFC 0%, #EEF2F7 100%);
                    position: relative;
                    overflow: hidden;
                }
                .login-page::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: 
                        url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5v10M25 10h10M30 45v10M25 50h10M5 30h10M10 25v10M45 30h10M50 25v10' stroke='%230052CC' stroke-opacity='0.04' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
                    pointer-events: none;
                }
                .login-card {
                    width: 100%;
                    max-width: 400px;
                    background: #FFFFFF;
                    border: 1px solid #DFE1E6;
                    border-radius: 6px;
                    box-shadow: 0 4px 12px rgba(9, 30, 66, 0.08), 0 0 1px rgba(9, 30, 66, 0.12);
                    position: relative;
                    z-index: 1;
                }
                .login-header {
                    padding: 32px 32px 24px;
                    text-align: center;
                    border-bottom: 1px solid #EBECF0;
                    background: linear-gradient(180deg, #FAFBFC 0%, #FFFFFF 100%);
                }
                .shield-icon {
                    width: 56px;
                    height: 56px;
                    background: linear-gradient(135deg, #0052CC 0%, #0747A6 100%);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                    box-shadow: 0 2px 8px rgba(0, 82, 204, 0.25);
                }
                .shield-icon svg {
                    color: white;
                }
                .login-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #172B4D;
                    margin: 0 0 4px;
                    letter-spacing: -0.3px;
                }
                .login-subtitle {
                    font-size: 13px;
                    color: #6B778C;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }
                .login-subtitle svg {
                    width: 14px;
                    height: 14px;
                    color: #00875A;
                }
                .login-body {
                    padding: 28px 32px 32px;
                }
                .error-banner {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 12px;
                    margin-bottom: 20px;
                    background: #FFEBE6;
                    border: 1px solid #FF8F73;
                    border-radius: 4px;
                    font-size: 13px;
                    color: #BF2600;
                }
                .error-banner svg {
                    flex-shrink: 0;
                    margin-top: 1px;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-label {
                    display: block;
                    font-size: 12px;
                    font-weight: 600;
                    color: #172B4D;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .input-wrapper {
                    position: relative;
                }
                .input-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #6B778C;
                    pointer-events: none;
                }
                .form-input {
                    width: 100%;
                    padding: 10px 12px 10px 40px;
                    font-size: 14px;
                    font-family: inherit;
                    color: #172B4D;
                    background: #FAFBFC;
                    border: 1px solid #DFE1E6;
                    border-radius: 4px;
                    outline: none;
                    transition: border-color 100ms, box-shadow 100ms;
                }
                .form-input:focus {
                    background: #FFFFFF;
                    border-color: #0052CC;
                    box-shadow: 0 0 0 1px #0052CC;
                }
                .form-input.has-error {
                    border-color: #DE350B;
                }
                .form-input.has-error:focus {
                    box-shadow: 0 0 0 1px #DE350B;
                }
                .form-input::placeholder {
                    color: #A5ADBA;
                }
                .form-input:disabled {
                    background: #F4F5F7;
                    color: #A5ADBA;
                    cursor: not-allowed;
                }
                .form-error {
                    font-size: 11px;
                    color: #DE350B;
                    margin-top: 4px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .submit-btn {
                    width: 100%;
                    padding: 12px 16px;
                    font-size: 14px;
                    font-weight: 600;
                    font-family: inherit;
                    color: #FFFFFF;
                    background: linear-gradient(180deg, #0052CC 0%, #0747A6 100%);
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: opacity 100ms;
                    box-shadow: 0 1px 2px rgba(7, 71, 166, 0.2);
                }
                .submit-btn:hover:not(:disabled) {
                    opacity: 0.92;
                }
                .submit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .submit-btn svg {
                    width: 18px;
                    height: 18px;
                }
                .login-footer {
                    padding: 16px 32px;
                    background: #FAFBFC;
                    border-top: 1px solid #EBECF0;
                    text-align: center;
                }
                .footer-text {
                    font-size: 11px;
                    color: #6B778C;
                    margin: 0;
                    line-height: 1.5;
                }
                .footer-text strong {
                    color: #172B4D;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .spinner {
                    animation: spin 0.6s linear infinite;
                }
            `}</style>

            <div className="login-card">
                {/* Header with Shield Icon */}
                <div className="login-header">
                    <div className="shield-icon">
                        <Shield size={28} strokeWidth={2} />
                    </div>
                    <h1 className="login-title">Hospital Staff Portal</h1>
                    <p className="login-subtitle">
                        <Lock size={14} />
                        Secure Authentication Required
                    </p>
                </div>

                {/* Form Body */}
                <div className="login-body">
                    {serverError && (
                        <div className="error-banner">
                            <AlertCircle size={16} />
                            <span>{serverError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Employee ID / Email Field */}
                        <div className="form-group">
                            <label className="form-label">Employee ID / Email</label>
                            <div className="input-wrapper">
                                <User size={18} className="input-icon" />
                                <input
                                    type="text"
                                    {...register('email')}
                                    disabled={isSubmitting}
                                    className={`form-input ${errors.email ? 'has-error' : ''}`}
                                    placeholder="Enter your ID or email"
                                    autoComplete="username"
                                />
                            </div>
                            {errors.email && (
                                <p className="form-error">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-wrapper">
                                <KeyRound size={18} className="input-icon" />
                                <input
                                    type="password"
                                    {...register('password')}
                                    disabled={isSubmitting}
                                    className={`form-input ${errors.password ? 'has-error' : ''}`}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                            </div>
                            {errors.password && (
                                <p className="form-error">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="submit-btn"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="spinner" />
                                    <span>Authenticating...</span>
                                </>
                            ) : (
                                <>
                                    <Lock size={18} />
                                    <span>Secure Sign In</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="login-footer">
                    <p className="footer-text">
                        <strong>Authorized Personnel Only</strong><br />
                        This system is for hospital staff use only. Unauthorized access is prohibited.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
