import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, Shield, LogOut, KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../api/auth.service';

const ForcePasswordChange: React.FC = () => {
    const navigate = useNavigate();
    const { logout, updateForcePasswordChange } = useAuth();

    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Password strength indicators
    const passwordChecks = {
        minLength: formData.newPassword.length >= 6,
        maxLength: formData.newPassword.length <= 8,
        hasLetter: /[a-zA-Z]/.test(formData.newPassword),
        hasNumber: /[0-9]/.test(formData.newPassword),
    };

    const isPasswordValid = passwordChecks.minLength && passwordChecks.maxLength;
    const doPasswordsMatch = formData.newPassword === formData.confirmPassword && formData.confirmPassword !== '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.oldPassword) {
            setError('Please enter your current password');
            return;
        }

        if (!isPasswordValid) {
            setError('New password must be 6-8 characters');
            return;
        }

        if (!doPasswordsMatch) {
            setError('Passwords do not match');
            return;
        }

        if (formData.oldPassword === formData.newPassword) {
            setError('New password must be different from current password');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await authService.changePassword({
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword,
            });

            if (response.token) {
                localStorage.setItem('token', response.token);
            }

            setSuccess(true);

            // Update the auth context to reflect password change
            if (updateForcePasswordChange) {
                updateForcePasswordChange(false);
            }

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 2000);
        } catch (err: unknown) {
            console.error('Password change failed:', err);
            interface AxiosErrorResponse {
                response?: {
                    data?: {
                        message?: string;
                    };
                };
            }
            const axiosError = err as AxiosErrorResponse;
            setError(axiosError.response?.data?.message || 'Failed to change password. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    if (success) {
        return (
            <div className="login-page">
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
                    .login-card {
                        width: 100%;
                        max-width: 400px;
                        background: #FFFFFF;
                        border: 1px solid #DFE1E6;
                        border-radius: 6px;
                        box-shadow: 0 4px 12px rgba(9, 30, 66, 0.08), 0 0 1px rgba(9, 30, 66, 0.12);
                        padding: 32px;
                        text-align: center;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                    .spinner {
                        animation: spin 0.6s linear infinite;
                    }
                `}</style>
                <div className="login-card">
                    <CheckCircle size={40} color="#00875A" style={{ margin: '0 auto 12px' }} />
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#172B4D', margin: '0 0 4px' }}>
                        Password Changed!
                    </h2>
                    <p style={{ fontSize: '13px', color: '#6B778C', margin: 0 }}>
                        Redirecting to your dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
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
                    max-width: 440px;
                    background: #FFFFFF;
                    border: 1px solid #DFE1E6;
                    border-radius: 6px;
                    box-shadow: 0 4px 12px rgba(9, 30, 66, 0.08), 0 0 1px rgba(9, 30, 66, 0.12);
                    position: relative;
                    z-index: 1;
                }
                .login-header {
                    padding: 24px 24px 16px;
                    text-align: center;
                    border-bottom: 1px solid #EBECF0;
                    background: linear-gradient(180deg, #FAFBFC 0%, #FFFFFF 100%);
                }
                .shield-icon {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, #0052CC 0%, #0747A6 100%);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 12px;
                    box-shadow: 0 2px 8px rgba(0, 82, 204, 0.25);
                }
                .shield-icon svg {
                    color: white;
                }
                .login-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #172B4D;
                    margin: 0 0 2px;
                    letter-spacing: -0.3px;
                }
                .login-subtitle {
                    font-size: 13px;
                    color: #6B778C;
                    margin: 0;
                }
                .login-body {
                    padding: 20px 32px 24px;
                }
                .info-banner {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    margin-bottom: 18px;
                    background: #EAE6FF;
                    border: 1px solid #998DD9;
                    border-radius: 4px;
                    font-size: 12px;
                    color: #403294;
                }
                .error-banner {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 10px;
                    margin-bottom: 16px;
                    background: #FFEBE6;
                    border: 1px solid #FF8F73;
                    border-radius: 4px;
                    font-size: 12px;
                    color: #BF2600;
                }
                .form-group {
                    margin-bottom: 16px;
                }
                .form-label {
                    display: block;
                    font-size: 11px;
                    font-weight: 600;
                    color: #172B4D;
                    margin-bottom: 4px;
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
                .eye-button {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    color: #6B778C;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .form-input {
                    width: 100%;
                    padding: 9px 44px 9px 40px;
                    font-size: 14px;
                    font-family: inherit;
                    color: #172B4D;
                    background: #FAFBFC;
                    border: 1px solid #DFE1E6;
                    border-radius: 4px;
                    outline: none;
                    box-sizing: border-box;
                    transition: border-color 100ms, box-shadow 100ms;
                }
                .form-input:focus {
                    background: #FFFFFF;
                    border-color: #0052CC;
                    box-shadow: 0 0 0 1px #0052CC;
                }
                .password-strength {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    margin-top: 8px;
                    padding: 6px 10px;
                    background: #F4F5F7;
                    border-radius: 4px;
                }
                .strength-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11px;
                }
                .strength-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: #DFE1E6;
                }
                .strength-dot.active {
                    background: #00875A;
                }
                .strength-dot.error {
                    background: #DE350B;
                }
                .submit-btn {
                    width: 100%;
                    padding: 11px 16px;
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
                    box-shadow: 0 1px 2px rgba(7, 71, 166, 0.2);
                }
                .logout-link {
                    display: block;
                    width: 100%;
                    text-align: center;
                    margin-top: 14px;
                    font-size: 12px;
                    color: #0052CC;
                    background: none;
                    border: none;
                    cursor: pointer;
                    text-decoration: none;
                }
                .logout-link:hover {
                    text-decoration: underline;
                }
                .login-footer {
                    padding: 12px 32px;
                    background: #FAFBFC;
                    border-top: 1px solid #EBECF0;
                    text-align: center;
                }
                .footer-text {
                    font-size: 11px;
                    color: #6B778C;
                    margin: 0;
                    line-height: 1.4;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .spinner {
                    animation: spin 0.6s linear infinite;
                }
            `}</style>

            <div className="login-card">
                <div className="login-header">
                    <div className="shield-icon">
                        <Shield size={24} strokeWidth={2.5} />
                    </div>
                    <h1 className="login-title">Security Update</h1>
                    <p className="login-subtitle">Change Password</p>
                </div>

                <div className="login-body">
                    <div className="info-banner">
                        <AlertCircle size={16} style={{ flexShrink: 0 }} />
                        <span>Update your temporary password to access the portal.</span>
                    </div>

                    {error && (
                        <div className="error-banner">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Current Password */}
                        <div className="form-group">
                            <label className="form-label">Current Temporary Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type={showOldPassword ? 'text' : 'password'}
                                    value={formData.oldPassword}
                                    onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                                    className="form-input"
                                    placeholder="Enter current password"
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    className="eye-button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                >
                                    {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="form-group">
                            <label className="form-label">New Secure Password</label>
                            <div className="input-wrapper">
                                <KeyRound size={18} className="input-icon" />
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    className="form-input"
                                    placeholder="Create new password"
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    className="eye-button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Password Strength Indicators */}
                            {formData.newPassword && (
                                <div className="password-strength">
                                    <div className="strength-item">
                                        <div className={`strength-dot ${passwordChecks.minLength ? 'active' : ''}`} />
                                        <span style={{ color: passwordChecks.minLength ? '#006644' : '#6B778C' }}>
                                            6 - 8 characters
                                        </span>
                                    </div>
                                    {formData.newPassword.length > 8 && (
                                        <div className="strength-item">
                                            <div className="strength-dot error" />
                                            <span style={{ color: '#DE350B' }}>Too long (max 8)</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="form-group">
                            <label className="form-label">Confirm New Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="form-input"
                                    style={formData.confirmPassword ? {
                                        borderColor: doPasswordsMatch ? '#00875A' : '#DE350B'
                                    } : {}}
                                    placeholder="Confirm new password"
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    className="eye-button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {formData.confirmPassword && !doPasswordsMatch && (
                                <p style={{ fontSize: '11px', color: '#DE350B', marginTop: '4px' }}>Passwords do not match</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || !isPasswordValid || !doPasswordsMatch}
                            className="submit-btn"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="spinner" size={18} />
                                    <span>Updating Password...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={18} />
                                    <span>Update & Access Portal</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            className="logout-link"
                            onClick={handleLogout}
                            disabled={isSubmitting}
                        >
                            <LogOut size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            Sign out and use different account
                        </button>
                    </form>
                </div>

                <div className="login-footer">
                    <p className="footer-text">
                        <strong>Security Enforcement</strong><br />
                        This update is required to maintain the safety of hospital records.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForcePasswordChange;
