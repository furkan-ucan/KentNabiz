import React from 'react';

export interface InputProps {
  /**
   * Input tipi
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search' | 'date';

  /**
   * Placeholder metni
   */
  placeholder?: string;

  /**
   * Input değeri
   */
  value?: string;

  /**
   * Değer değiştiğinde tetiklenecek fonksiyon
   */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * Input etiketi
   */
  label?: string;

  /**
   * Hata mesajı
   */
  error?: string;

  /**
   * Input ID'si
   */
  id?: string;

  /**
   * Input adı
   */
  name?: string;

  /**
   * Zorunlu alan mı?
   */
  required?: boolean;

  /**
   * Özel CSS sınıfı
   */
  className?: string;

  /**
   * Disabled durumu
   */
  disabled?: boolean;

  /**
   * Autocompletion özelliği
   */
  autoComplete?: string;

  /**
   * Maksimum karakter sayısı
   */
  maxLength?: number;

  /**
   * Minimum karakter sayısı
   */
  minLength?: number;
}

/**
 * Temel Input bileşeni
 */
export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  label,
  error,
  id,
  name,
  required = false,
  className = '',
  disabled = false,
  autoComplete,
  maxLength,
  minLength,
  ...rest
}) => {
  const inputId = id || name || Math.random().toString(36).substr(2, 9);

  // Gerçek implementasyon framework'e göre değişecektir
  // (React, React Native veya başka bir UI kütüphanesi)

  // Bu sadece bir TypeScript arayüzü/taslak implementasyonudur

  return (
    <div className="form-input-container">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label} {required && <span className="required-indicator">*</span>}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete={autoComplete}
        maxLength={maxLength}
        minLength={minLength}
        required={required}
        className={`form-input ${error ? 'form-input-error' : ''} ${className}`}
        {...rest}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

export default Input;
