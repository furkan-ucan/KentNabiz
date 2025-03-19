import { useState, useCallback, ChangeEvent } from 'react';

export type ValidationRule<T> = (value: unknown, formValues: T) => string | undefined;

export type FormErrors<T> = {
  [K in keyof T]?: string;
};

export type FormTouched<T> = {
  [K in keyof T]?: boolean;
};

export interface UseFormProps<T> {
  initialValues: T;
  onSubmit: (values: T) => void | Promise<void>;
  validate?: (values: T) => FormErrors<T>;
  validationSchema?: {
    [K in keyof T]?: ValidationRule<T>[];
  };
}

export interface UseFormReturn<T> {
  values: T;
  errors: FormErrors<T>;
  touched: FormTouched<T>;
  isSubmitting: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setFieldValue: <K extends keyof T>(name: K, value: T[K]) => void;
  setFieldError: (name: keyof T, error: string) => void;
  resetForm: () => void;
  validateForm: () => boolean;
}

/**
 * Form yönetimi için özel hook
 * @param props Form özellikleri
 * @returns Form state ve işleyicileri
 */
export function useForm<T extends Record<string, unknown>>({
  initialValues,
  onSubmit,
  validate,
  validationSchema,
}: UseFormProps<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<FormTouched<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form doğrulama fonksiyonu
  const validateForm = useCallback((): boolean => {
    let formErrors: FormErrors<T> = {};

    // validationSchema ile doğrulama
    if (validationSchema) {
      Object.keys(validationSchema).forEach(key => {
        const fieldKey = key as keyof T;
        const fieldValue = values[fieldKey];
        const fieldRules = validationSchema[fieldKey] || [];

        for (const rule of fieldRules) {
          const error = rule(fieldValue, values);
          if (error) {
            formErrors[fieldKey] = error;
            break;
          }
        }
      });
    }

    // validate fonksiyonu ile doğrulama (varsa)
    if (validate) {
      formErrors = { ...formErrors, ...validate(values) };
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  }, [values, validate, validationSchema]);

  // Form değişiklik işleyicisi
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setValues(prevValues => ({
      ...prevValues,
      [name]: fieldValue,
    }));
  }, []);

  // Alan değerini manuel olarak ayarlama işlevi
  const setFieldValue = useCallback(<K extends keyof T>(name: K, value: T[K]) => {
    setValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }));
  }, []);

  // Alan hatası ayarlama işlevi
  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: error,
    }));
  }, []);

  // Alan blur olayı işleyicisi
  const handleBlur = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true,
    }));
  }, []);

  // Form gönderme işleyicisi
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setTouched(
        Object.keys(values).reduce((acc, key) => {
          acc[key as keyof T] = true;
          return acc;
        }, {} as FormTouched<T>)
      );

      const isValid = validateForm();

      if (isValid) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [values, onSubmit, validateForm]
  );

  // Formu sıfırlama işlevi
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
    validateForm,
  };
}

export default useForm;
