import React, { forwardRef } from 'react';

/**
 * Validation state for the input
 */
export type ValidationState = 'default' | 'error' | 'success';

interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Input label text */
    label?: string;
    /** Whether the field is required */
    required?: boolean;
    /** Validation state */
    validationState?: ValidationState;
    /** Error message to display */
    errorMessage?: string;
    /** Success message to display */
    successMessage?: string;
    /** Helper text shown below the input */
    helperText?: string;
    /** Icon component to display on the left */
    leftIcon?: React.ReactNode;
    /** Icon component to display on the right */
    rightIcon?: React.ReactNode;
    /** Additional class for the wrapper */
    wrapperClassName?: string;
}

/**
 * FormInput Component
 * 
 * Validated input component with strict validation states for clinical forms.
 * Features clear visual feedback for errors, success states, and disabled inputs.
 * 
 * @example
 * ```tsx
 * <FormInput
 *   label="Patient ID"
 *   required
 *   placeholder="Enter Patient ID"
 *   validationState="error"
 *   errorMessage="Patient ID is required"
 * />
 * 
 * <FormInput
 *   label="Email"
 *   type="email"
 *   validationState="success"
 *   leftIcon={<MailIcon />}
 * />
 * ```
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    (
        {
            label,
            required = false,
            validationState = 'default',
            errorMessage,
            successMessage,
            helperText,
            leftIcon,
            rightIcon,
            wrapperClassName = '',
            className = '',
            disabled,
            id,
            ...inputProps
        },
        ref
    ) => {
        const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

        // Determine input class based on validation state
        const getInputClass = (): string => {
            const baseClass = 'hms-input';
            const stateClasses = {
                default: '',
                error: 'hms-input-error',
                success: 'hms-input-success',
            };

            return `${baseClass} ${stateClasses[validationState]} ${className}`;
        };

        return (
            <div className={`hms-form-group ${wrapperClassName}`} style={{ marginBottom: 0 }}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className={`hms-label ${required ? 'hms-label-required' : ''}`}
                    >
                        {label}
                    </label>
                )}

                <div style={{ position: 'relative' }}>
                    {leftIcon && (
                        <div
                            style={{
                                position: 'absolute',
                                left: 12,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--color-text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                pointerEvents: 'none',
                            }}
                        >
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        disabled={disabled}
                        className={getInputClass()}
                        style={{
                            paddingLeft: leftIcon ? 40 : undefined,
                            paddingRight: rightIcon ? 40 : undefined,
                        }}
                        aria-invalid={validationState === 'error'}
                        aria-describedby={
                            errorMessage
                                ? `${inputId}-error`
                                : helperText
                                    ? `${inputId}-helper`
                                    : undefined
                        }
                        {...inputProps}
                    />

                    {rightIcon && (
                        <div
                            style={{
                                position: 'absolute',
                                right: 12,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color:
                                    validationState === 'error'
                                        ? '#DE350B'
                                        : validationState === 'success'
                                            ? '#00875A'
                                            : 'var(--color-text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                pointerEvents: 'none',
                            }}
                        >
                            {rightIcon}
                        </div>
                    )}
                </div>

                {validationState === 'error' && errorMessage && (
                    <p id={`${inputId}-error`} className="hms-input-error-text" role="alert">
                        {errorMessage}
                    </p>
                )}

                {validationState === 'success' && successMessage && (
                    <p
                        id={`${inputId}-success`}
                        className="hms-input-helper"
                        style={{ color: '#00875A' }}
                    >
                        {successMessage}
                    </p>
                )}

                {validationState === 'default' && helperText && (
                    <p id={`${inputId}-helper`} className="hms-input-helper">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

FormInput.displayName = 'FormInput';

export default FormInput;
