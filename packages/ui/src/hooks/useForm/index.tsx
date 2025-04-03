import { useState, useCallback, ChangeEvent, FormEvent } from 'react';

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
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  setFieldValue: <K extends keyof T>(name: K, value: T[K]) => void;
  setFieldError: (name: keyof T, error: string) => void;
  resetForm: () => void;
  validateForm: () => boolean;
}

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

  const validateForm = useCallback((): boolean => {
    let formErrors: FormErrors<T> = {};

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

    if (validate) {
      formErrors = { ...formErrors, ...validate(values) };
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  }, [values, validate, validationSchema]);

  // Form değişiklik işleyicisi
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, type } = e.target;
      let value: unknown;

      // HTMLInputElement için checkbox tipi kontrolü
      if (e.target instanceof HTMLInputElement && type === 'checkbox') {
        value = e.target.checked;
      } else {
        value = e.target.value;
      }

      setValues(prevValues => ({
        ...prevValues,
        [name]: value,
      }));
    },
    []
  );

  // Alan blur olayı işleyicisi
  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      setTouched(prevTouched => ({
        ...prevTouched,
        [name]: true,
      }));
    },
    []
  );

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

  const setFieldValue = useCallback(<K extends keyof T>(name: K, value: T[K]) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  }, []);

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
