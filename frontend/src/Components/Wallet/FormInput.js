/**
 * FormInput Component
 * Reusable input wrapper with validation UI and error states
 * Supports text, email, number, password types
 */

import React, { forwardRef } from 'react';
import { FiAlertCircle, FiCheck } from 'react-icons/fi';
import '../../../styles/walletUtilities.css';

const FormInput = forwardRef(
  (
    {
      type = 'text',
      label,
      placeholder,
      value,
      onChange,
      onBlur,
      error,
      hint,
      disabled = false,
      required = false,
      autoComplete,
      inputMode,
      pattern,
      minLength,
      maxLength,
      min,
      max,
      step,
      showValidation = false,
      isValid = false,
      name,
      id,
    },
    ref,
  ) => {
    const fieldId = id || `field-${name}-${Math.random()}`;
    const showError = error && error.trim();
    const showValid = showValidation && isValid && !showError;

    return (
      <div className="wallet-form-group">
        {label && (
          <label htmlFor={fieldId} className="wallet-form-label">
            {label}
            {required && <span style={{ color: '#ef4444' }}> *</span>}
          </label>
        )}

        <div style={{ position: 'relative' }}>
          <input
            ref={ref}
            id={fieldId}
            type={type}
            name={name}
            className={`wallet-input ${showError ? 'wallet-input--error' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            inputMode={inputMode}
            pattern={pattern}
            minLength={minLength}
            maxLength={maxLength}
            min={min}
            max={max}
            step={step}
            aria-invalid={showError ? 'true' : 'false'}
            aria-describedby={
              showError
                ? `${fieldId}-error`
                : hint
                  ? `${fieldId}-hint`
                  : undefined
            }
            style={{
              paddingRight: showError || showValid ? '2.5rem' : undefined,
            }}
          />

          {/* Validation icons */}
          {showError && (
            <div
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <FiAlertCircle size={18} />
            </div>
          )}

          {showValid && (
            <div
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <FiCheck size={18} />
            </div>
          )}
        </div>

        {/* Error message */}
        {showError && (
          <div id={`${fieldId}-error`} className="wallet-form-error">
            <FiAlertCircle size={14} />
            {error}
          </div>
        )}

        {/* Hint text */}
        {hint && !showError && (
          <div id={`${fieldId}-hint`} className="wallet-form-hint">
            {hint}
          </div>
        )}
      </div>
    );
  },
);

FormInput.displayName = 'FormInput';

export default FormInput;
